import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  saveDraftSchema,
  type CreateDsrInput,
  type SaveDraftInput,
} from '@azentisfieldos/shared';
import { DsrStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { lockOnKey } from '../common/advisory-lock';
import { dateRangeBounds } from '../common/date-range';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
  SUBMITTED_DSR_WHERE,
} from '../common/superseded-dsrs';
import { applySiteStockDelta } from '../inventory/stock-delta';
import { StorageService } from '../storage/storage.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

// FR-28: one DSR per Site per date, with all its nested sub-records
// created atomically (a partial write must never happen).
//
// Story 3.2 (AD-8): a plain submission (create/retried-sync, this file's
// `create`) keeps at most one non-correcting DailySiteReport per
// (siteId, reportDate) by finding and updating that row in place rather
// than ever inserting a second one — last-synced-write-wins per AD-8,
// exactly as before.
//
// Story 3.5 (AD-9, FR-54): a *correction* (`correct`) is structurally
// different — it must insert a brand-new row, and fresh nested rows,
// without ever touching the report (or its rows) it corrects. This is why
// DailySiteReport.siteId+reportDate and WorkRecord.teamMemberId+workDate
// are no longer DB-unique (see schema comments): a correction and the row
// it corrects can legitimately share both. The "no true duplicate" /
// "no double-booking" invariants those constraints used to enforce as a
// DB backstop now live entirely in this file — enforced via Postgres
// advisory locks (below), since a plain findFirst-then-create/update has a
// check-then-act race window a DB unique constraint no longer closes.
@Injectable()
export class DsrService {
  private readonly logger = new Logger(DsrService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly pushNotifications: PushNotificationsService,
  ) {}

  // Every call site acquires locks in the same relative order (site+date
  // lock, if any, before per-crew-member locks; crew member locks always
  // in teamMemberId-sorted order) so two transactions can never deadlock
  // waiting on each other.
  //
  // Returns the existing WorkRecord for this person/date (if any), so
  // create()'s update-vs-create branch can reuse it instead of running a
  // second, near-identical findFirst right after this one — the two used
  // to query overlapping data (this one across every Site, the second
  // re-checking the same person/date narrowed to just this Site) once per
  // crew member, every DSR submission.
  private async assertNoDoubleBooking(
    tx: Prisma.TransactionClient,
    teamMemberId: string,
    workDate: Date,
    siteId: string,
  ) {
    await lockOnKey(tx, `workrecord:${teamMemberId}:${workDate.toISOString()}`);
    const existing = await tx.workRecord.findFirst({
      where: { teamMemberId, workDate },
    });
    if (existing && existing.siteId !== siteId) {
      throw new ConflictException(
        'A crew member is already recorded at another Site on this date',
      );
    }
    return existing;
  }

  // Crew members are processed in a fixed (teamMemberId-sorted) order so
  // that any two transactions touching an overlapping set of people always
  // request their per-person advisory locks in the same relative order —
  // this is what makes concurrent create()/correct() calls block on each
  // other instead of deadlocking.
  private sortedWorkRecords(input: CreateDsrInput) {
    return [...input.workRecords].sort((a, b) =>
      a.teamMemberId.localeCompare(b.teamMemberId),
    );
  }

  // spec-dsr-drafts (AD-5): the single sub-record materialisation +
  // SiteStock application path, shared by the one-shot submit (create) and
  // Finalize (finalizeDraft) so the two can never drift on how stock is
  // applied — the double-count bug class this feature exists to close. It
  // creates the WorkRecord/Consumption/RmcEntry/Expense rows and applies the
  // signed SiteStock delta, all inside the caller's transaction. The upsert
  // -by-clientGeneratedId + signed-difference stock logic is preserved
  // verbatim from create()'s original inline loops so a retried offline sync
  // (AD-8) still drains stock exactly once.
  private async materializeSubRecords(
    tx: Prisma.TransactionClient,
    dsrId: string,
    input: CreateDsrInput,
    reportDate: Date,
    submittedByUserId: string,
  ) {
    for (const workRecord of this.sortedWorkRecords(input)) {
      // assertNoDoubleBooking's own findFirst already found this
      // person's existing row for this date (if any) — if it exists at
      // all, the check above already confirmed it's at this Site (a
      // different Site would have thrown), so it's exactly the row
      // create/update below needs. No second query.
      const existingWorkRecord = await this.assertNoDoubleBooking(
        tx,
        workRecord.teamMemberId,
        reportDate,
        input.siteId,
      );

      const workRecordData = {
        attended: workRecord.attended,
        hours: workRecord.hours,
        overtimeHours: workRecord.overtimeHours,
        dailySiteReportId: dsrId,
      };
      if (existingWorkRecord) {
        await tx.workRecord.update({
          where: { id: existingWorkRecord.id },
          data: workRecordData,
        });
      } else {
        await tx.workRecord.create({
          data: {
            teamMemberId: workRecord.teamMemberId,
            siteId: input.siteId,
            workDate: reportDate,
            ...workRecordData,
          },
        });
      }
    }

    for (const consumption of input.consumptions) {
      const data = {
        siteId: input.siteId,
        materialSizeId: consumption.materialSizeId,
        quantity: consumption.quantity,
        activityReference: consumption.activityReference,
        dailySiteReportId: dsrId,
        recordedByUserId: submittedByUserId,
        consumedAt: reportDate,
      };
      // FR-12: Consumption recorded through a DSR reduces Site Stock
      // exactly like the standalone POST /consumption path — the DSR
      // is an entry surface, never a stock-invisible silo. A retried
      // sync's upsert (AD-8) must apply only the *difference* against
      // the row it already wrote, or every retry would drain stock
      // again.
      const existing = consumption.clientGeneratedId
        ? await tx.consumption.findUnique({
            where: { clientGeneratedId: consumption.clientGeneratedId },
          })
        : null;
      if (consumption.clientGeneratedId) {
        await tx.consumption.upsert({
          where: { clientGeneratedId: consumption.clientGeneratedId },
          update: data,
          create: {
            ...data,
            clientGeneratedId: consumption.clientGeneratedId,
          },
        });
      } else {
        await tx.consumption.create({ data });
      }
      if (existing && existing.materialSizeId !== consumption.materialSizeId) {
        // The resubmission moved this row to a different Material —
        // give the previously consumed Material back, then charge the
        // new one in full.
        await applySiteStockDelta(
          tx,
          existing.siteId,
          existing.materialSizeId,
          -existing.quantity.toNumber(),
          'Not enough Site Stock for this Consumption.',
        );
        await applySiteStockDelta(
          tx,
          input.siteId,
          consumption.materialSizeId,
          consumption.quantity,
          'Not enough Site Stock for this Consumption.',
        );
      } else {
        await applySiteStockDelta(
          tx,
          input.siteId,
          consumption.materialSizeId,
          consumption.quantity - (existing?.quantity.toNumber() ?? 0),
          'Not enough Site Stock for this Consumption.',
        );
      }
    }

    for (const rmc of input.rmcEntries) {
      // Server-computed, never client-trusted.
      const totalAmount = rmc.quantityM3 * rmc.ratePerM3;
      const data = {
        siteId: input.siteId,
        vendorId: rmc.vendorId,
        quantityM3: rmc.quantityM3,
        grade: rmc.grade,
        ratePerM3: rmc.ratePerM3,
        totalAmount,
        deliveredAt: reportDate,
        dailySiteReportId: dsrId,
      };
      if (rmc.clientGeneratedId) {
        await tx.rmcEntry.upsert({
          where: { clientGeneratedId: rmc.clientGeneratedId },
          update: data,
          create: { ...data, clientGeneratedId: rmc.clientGeneratedId },
        });
      } else {
        await tx.rmcEntry.create({ data });
      }
    }

    for (const expense of input.expenses) {
      const data = {
        siteId: input.siteId,
        categoryId: expense.categoryId,
        amount: expense.amount,
        description: expense.description,
        paymentMethod: expense.paymentMethod,
        personOrVendor: expense.personOrVendor,
        dailySiteReportId: dsrId,
        incurredAt: reportDate,
      };
      if (expense.clientGeneratedId) {
        await tx.expense.upsert({
          where: { clientGeneratedId: expense.clientGeneratedId },
          update: data,
          create: { ...data, clientGeneratedId: expense.clientGeneratedId },
        });
      } else {
        await tx.expense.create({ data });
      }
    }
  }

  // Story 1.8 (AC #1): `submittedByUserId` is the real authenticated user,
  // threaded in from the controller (req.user, set by ClerkAuthGuard) — no
  // longer a placeholder resolved inside the service.
  async create(input: CreateDsrInput, submittedByUserId: string) {
    const reportDate = new Date(input.reportDate);
    let isFirstSubmission = false;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Advisory lock, acquired before anything else in this
        // transaction: DailySiteReport.@@unique([siteId, reportDate]) was
        // relaxed to a plain index (Story 3.5) so a correction can share a
        // Site/date with the report it corrects. Without this lock, two
        // concurrent plain submissions for the same Site/date (e.g. a
        // manual resubmit racing Story 3.2's offline-sync retry) could
        // both pass the findFirst below and both insert a new "original"
        // row, violating AD-8's "a retried sync can never create a
        // duplicate" guarantee.
        await lockOnKey(tx, `dsr:${input.siteId}:${input.reportDate}`);

        // spec-dsr-drafts: only ever fold into an existing SUBMITTED original
        // — a DRAFT for this (site,date) is a separate, private row the
        // one-shot submit must never merge into or overwrite.
        const existingOriginal = await tx.dailySiteReport.findFirst({
          where: {
            siteId: input.siteId,
            reportDate,
            correctsId: null,
            ...SUBMITTED_DSR_WHERE,
          },
        });
        isFirstSubmission = !existingOriginal;

        const dsrData = {
          workCompleted: input.workCompleted,
          workInProgress: input.workInProgress,
          plannedWork: input.plannedWork,
          issuesBlockers: input.issuesBlockers,
          safetyObservations: input.safetyObservations,
          notes: input.notes,
          equipmentUsed: input.equipmentUsed,
        };

        const dsr = existingOriginal
          ? await tx.dailySiteReport.update({
              where: { id: existingOriginal.id },
              data: dsrData,
            })
          : await tx.dailySiteReport.create({
              data: {
                siteId: input.siteId,
                reportDate,
                submittedByUserId,
                ...dsrData,
              },
            });

        await this.materializeSubRecords(
          tx,
          dsr.id,
          input,
          reportDate,
          submittedByUserId,
        );

        return tx.dailySiteReport.findUniqueOrThrow({
          where: { id: dsr.id },
          include: {
            workRecords: true,
            consumptions: true,
            rmcEntries: true,
            expenses: true,
          },
        });
      });

      // Outside the transaction — a push failure must never roll back a
      // successfully saved DSR. Only on the first submission for this
      // Site/date, never on an offline-sync retry resubmitting the same
      // day (AD-8), which would otherwise re-notify on every retry. Wrapped
      // in its own try/catch: this runs after the DSR already committed, so
      // a transient failure here (e.g. the site lookup) must never surface
      // to the client as a failed submission.
      if (isFirstSubmission) {
        await this.notifyReportSubmitted(
          result.id,
          input.siteId,
          submittedByUserId,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Prisma 7's driver-adapter (@prisma/adapter-pg) error shape does
      // NOT populate `error.meta.target` the way classic Prisma Client
      // does — confirmed by direct inspection against a real Postgres
      // instance, not assumed.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This record conflicts with an existing one',
        );
      }
      throw error;
    }
  }

  // spec-dsr-drafts (AD-5): the single "Daily Report submitted" push, shared
  // by the one-shot submit and Finalize. Runs OUTSIDE the transaction and
  // swallows its own failures — a push problem must never roll back or fail an
  // already-committed report. Self-excluded when the actor is themselves an
  // Owner/Admin (handled by PushNotificationsService.sendToRole).
  private async notifyReportSubmitted(
    dsrId: string,
    siteId: string,
    submittedByUserId: string,
  ) {
    try {
      const site = await this.prisma.site.findUnique({
        where: { id: siteId },
        select: { name: true },
      });
      void this.pushNotifications.sendToRole(
        'OWNER_ADMIN',
        {
          title: 'Daily Report submitted',
          body: `${site?.name ?? 'A Site'} submitted today's Daily Report.`,
          url: `/daily-activity/${dsrId}`,
        },
        submittedByUserId,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send 'Daily Report submitted' push for DSR ${dsrId}: ${String(error)}`,
      );
    }
  }

  // spec-dsr-drafts: the not-yet-materialised sub-records stored on a draft
  // row's draftContent JSON column. Narrative fields + equipmentUsed live as
  // real columns (they carry no side effects); only the ledger-bound
  // sub-records are deferred here until Finalize.
  private draftSubRecords(input: SaveDraftInput) {
    return {
      workRecords: input.workRecords,
      consumptions: input.consumptions,
      rmcEntries: input.rmcEntries,
      expenses: input.expenses,
    };
  }

  // spec-dsr-drafts: Save Draft. Upserts the caller's single private DRAFT row
  // per (siteId, reportDate, author) — no ledger rows, no SiteStock delta. The
  // narrative fields and equipmentUsed land on real columns; the sub-records
  // are stored as draftContent JSON until Finalize materialises them. Same
  // advisory lock create() takes, so a rapid double-save (or a save racing a
  // finalize) can never fork into two DRAFT rows for the same (site,date,
  // author) — a partial unique index backstops it too.
  async saveDraft(input: SaveDraftInput, submittedByUserId: string) {
    const reportDate = new Date(input.reportDate);
    return this.prisma.$transaction(async (tx) => {
      await lockOnKey(tx, `dsr:${input.siteId}:${input.reportDate}`);

      // Review item 1: once a report is SUBMITTED for this (site,date), it is
      // history — block a new draft rather than let a parallel editable copy
      // shadow it. Changes go through Correct.
      const alreadySubmitted = await tx.dailySiteReport.findFirst({
        where: {
          siteId: input.siteId,
          reportDate,
          correctsId: null,
          ...SUBMITTED_DSR_WHERE,
        },
        select: { id: true },
      });
      if (alreadySubmitted) {
        throw new ConflictException(
          'A report is already submitted for this site and date — use Correct to change it.',
        );
      }

      // Review item 2: drafts are private per supervisor — only the caller's
      // own draft for this (site,date) is ever resumed or overwritten.
      const existingDraft = await tx.dailySiteReport.findFirst({
        where: {
          siteId: input.siteId,
          reportDate,
          correctsId: null,
          status: DsrStatus.DRAFT,
          submittedByUserId,
        },
      });

      const draftData = {
        workCompleted: input.workCompleted,
        workInProgress: input.workInProgress,
        plannedWork: input.plannedWork,
        issuesBlockers: input.issuesBlockers,
        safetyObservations: input.safetyObservations,
        notes: input.notes,
        equipmentUsed: input.equipmentUsed,
        draftContent: this.draftSubRecords(input) as Prisma.InputJsonValue,
      };

      const draft = existingDraft
        ? await tx.dailySiteReport.update({
            where: { id: existingDraft.id },
            data: draftData,
          })
        : await tx.dailySiteReport.create({
            data: {
              siteId: input.siteId,
              reportDate,
              submittedByUserId,
              status: DsrStatus.DRAFT,
              ...draftData,
            },
          });

      return { id: draft.id };
    });
  }

  // spec-dsr-drafts: Resume. Returns the caller's own private DRAFT for a
  // (siteId, date) so the entry form can pre-fill — narrative + equipmentUsed
  // from columns, sub-records from draftContent, plus any photos already
  // attached to the draft row (gallery-hidden until Finalize). Null when the
  // caller has no draft (the form simply stays empty). Drafts are private per
  // supervisor, so another user's draft for the same (site,date) is invisible
  // here. Photos carry thumbnail URLs like findOne.
  async getDraft(siteId: string, date: string, submittedByUserId: string) {
    const draft = await this.prisma.dailySiteReport.findFirst({
      where: {
        siteId,
        reportDate: new Date(date),
        correctsId: null,
        status: DsrStatus.DRAFT,
        submittedByUserId,
      },
      include: { photos: true },
    });
    if (!draft) {
      return null;
    }

    const content =
      (draft.draftContent as {
        workRecords?: CreateDsrInput['workRecords'];
        consumptions?: CreateDsrInput['consumptions'];
        rmcEntries?: CreateDsrInput['rmcEntries'];
        expenses?: CreateDsrInput['expenses'];
      } | null) ?? {};
    const photos = await Promise.all(
      draft.photos.map(async (photo) => ({
        id: photo.id,
        url: await this.storage.getThumbnailUrl(photo.storageKey),
      })),
    );

    return {
      id: draft.id,
      siteId: draft.siteId,
      reportDate: draft.reportDate.toISOString().slice(0, 10),
      workCompleted: draft.workCompleted,
      workInProgress: draft.workInProgress,
      plannedWork: draft.plannedWork,
      issuesBlockers: draft.issuesBlockers,
      safetyObservations: draft.safetyObservations,
      notes: draft.notes,
      equipmentUsed: draft.equipmentUsed,
      workRecords: content.workRecords ?? [],
      consumptions: content.consumptions ?? [],
      rmcEntries: content.rmcEntries ?? [],
      expenses: content.expenses ?? [],
      photos,
    };
  }

  // spec-dsr-drafts: Discard. Hard-deletes the caller's own DRAFT row and its
  // gallery-hidden photos (no ledger rows ever existed for a draft). Refuses a
  // SUBMITTED id — a submitted report is history, corrected via
  // POST /dsr/:id/correct, never deleted (AD-9).
  //
  // Review item 4: the authoritative status/owner check runs INSIDE a
  // transaction holding the same dsr:site:date advisory lock a concurrent
  // finalize would take, re-reading the row under the lock — so a Discard can
  // never race a Finalize of the same draft (one blocks until the other
  // commits, then sees the updated status). A preliminary read outside the
  // lock only supplies the site/date needed to build the lock key.
  async deleteDraft(id: string, submittedByUserId: string) {
    const preliminary = await this.prisma.dailySiteReport.findUnique({
      where: { id },
      select: { siteId: true, reportDate: true },
    });
    if (!preliminary) {
      throw new NotFoundException(`Daily Site Report ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await lockOnKey(
        tx,
        `dsr:${preliminary.siteId}:${preliminary.reportDate.toISOString().slice(0, 10)}`,
      );
      const row = await tx.dailySiteReport.findUnique({
        where: { id },
        select: { status: true, submittedByUserId: true },
      });
      // Re-read inside the lock — the row (or its status) may have changed
      // since the preliminary read above.
      if (!row || row.submittedByUserId !== submittedByUserId) {
        // Private per supervisor: another user's draft (or a vanished row) is
        // simply "not found" to this caller — never revealed or deletable.
        throw new NotFoundException(`Daily Site Report ${id} not found`);
      }
      if (row.status !== DsrStatus.DRAFT) {
        throw new ConflictException(
          'A submitted report cannot be discarded — correct it instead',
        );
      }
      await tx.photo.deleteMany({ where: { dailySiteReportId: id } });
      await tx.dailySiteReport.delete({ where: { id } });
    });
    return { id };
  }

  // spec-dsr-drafts: Finalize. Flips DRAFT -> SUBMITTED, materialises the
  // deferred sub-records via the shared materializeSubRecords helper (so stock
  // is applied by the exact same path as the one-shot submit — never a second
  // copy), and clears draftContent — all in one transaction. Insufficient
  // stock throws from applySiteStockDelta, rolling the whole finalize back so
  // the report stays DRAFT with nothing materialised.
  //
  // Review items:
  //  3 (TOCTOU): the authoritative `status === DRAFT` check runs AFTER the
  //    advisory lock, re-reading the row under the lock — a preliminary read
  //    only supplies the site/date for the lock key. So two concurrent
  //    finalizes of the same draft can't both pass the check.
  //  1: a finalize is refused (409) if a SUBMITTED original already exists for
  //    this (site,date) — never a second submitted row for the same day.
  //  2: submittedByUserId is preserved (the draft's author) — a finalize by
  //    anyone never rewrites authorship; sub-records are attributed to the
  //    author too.
  //  6: the stored draftContent is re-parsed against the draft schema before
  //    materialising, and a referenced-entity-deleted-since-save failure is
  //    surfaced as a friendly BadRequest, never an opaque 500.
  async finalizeDraft(id: string, actingUserId: string) {
    const preliminary = await this.prisma.dailySiteReport.findUnique({
      where: { id },
      select: { siteId: true, reportDate: true },
    });
    if (!preliminary) {
      throw new NotFoundException(`Daily Site Report ${id} not found`);
    }
    const reportDateStr = preliminary.reportDate.toISOString().slice(0, 10);

    let authorUserId = actingUserId;
    let siteId = preliminary.siteId;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Lock FIRST, then re-read and check status under the lock (item 3).
        await lockOnKey(tx, `dsr:${preliminary.siteId}:${reportDateStr}`);

        const draft = await tx.dailySiteReport.findUnique({ where: { id } });
        if (!draft) {
          throw new NotFoundException(`Daily Site Report ${id} not found`);
        }
        if (draft.status !== DsrStatus.DRAFT) {
          throw new ConflictException('This report has already been submitted');
        }
        authorUserId = draft.submittedByUserId; // item 2: preserve author.
        siteId = draft.siteId;

        // Item 1: never finalize a draft on top of an already-SUBMITTED report
        // for the same (site,date) — that would create a duplicate submission.
        const alreadySubmitted = await tx.dailySiteReport.findFirst({
          where: {
            siteId: draft.siteId,
            reportDate: draft.reportDate,
            correctsId: null,
            ...SUBMITTED_DSR_WHERE,
          },
          select: { id: true },
        });
        if (alreadySubmitted) {
          throw new ConflictException(
            'A report is already submitted for this site and date — use Correct to change it.',
          );
        }

        // Item 6: re-parse the stored sub-records against the draft schema —
        // corrupt/stale draftContent must never reach materialisation as an
        // opaque failure.
        const content = (draft.draftContent as Prisma.JsonObject | null) ?? {};
        const parsed = saveDraftSchema.safeParse({
          siteId: draft.siteId,
          reportDate: reportDateStr,
          workCompleted: draft.workCompleted ?? undefined,
          workInProgress: draft.workInProgress ?? undefined,
          plannedWork: draft.plannedWork ?? undefined,
          issuesBlockers: draft.issuesBlockers ?? undefined,
          safetyObservations: draft.safetyObservations ?? undefined,
          notes: draft.notes ?? undefined,
          workRecords: content.workRecords ?? [],
          consumptions: content.consumptions ?? [],
          rmcEntries: content.rmcEntries ?? [],
          expenses: content.expenses ?? [],
          equipmentUsed: draft.equipmentUsed ?? [],
        });
        if (!parsed.success) {
          throw new BadRequestException(
            "This draft's saved data is no longer valid — edit the draft before finalizing.",
          );
        }
        const input: CreateDsrInput = parsed.data;

        await tx.dailySiteReport.update({
          where: { id },
          // Item 2: no submittedByUserId here — authorship is preserved.
          data: {
            status: DsrStatus.SUBMITTED,
            draftContent: Prisma.DbNull,
          },
        });

        await this.materializeSubRecords(
          tx,
          id,
          input,
          draft.reportDate,
          authorUserId,
        );

        return tx.dailySiteReport.findUniqueOrThrow({
          where: { id },
          include: {
            workRecords: true,
            consumptions: true,
            rmcEntries: true,
            expenses: true,
          },
        });
      });

      // A finalize that reaches here is always the day's first submission (we
      // 409 above if a SUBMITTED original already existed).
      await this.notifyReportSubmitted(result.id, siteId, authorUserId);

      return result;
    } catch (error) {
      // Item 6: a Material/Vendor/Category/Team Member referenced by the draft
      // that was deleted after save trips a Prisma FK/record-not-found error —
      // surface it as an actionable message, not a raw 500. Nest exceptions
      // (INSUFFICIENT_STOCK BadRequest, the 409s above, NotFound) pass through
      // unchanged.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2025')
      ) {
        throw new BadRequestException(
          'A referenced item was removed since this draft was saved — edit the draft before finalizing.',
        );
      }
      throw error;
    }
  }

  // Story 3.5 (AD-9, FR-54): a correction is always a brand-new
  // DailySiteReport row, with its own brand-new nested rows — it never
  // updates the report it corrects or that report's own rows. AC #4: this
  // deliberately does NOT go through create()'s "find the existing
  // non-corrected row for this Site/date" logic — a correction is expected
  // to coexist with the row it corrects, not merge into it.
  async correct(
    originalId: string,
    input: CreateDsrInput,
    reason: string,
    submittedByUserId: string,
  ) {
    const original = await this.prisma.dailySiteReport.findUnique({
      where: { id: originalId },
    });
    if (!original) {
      throw new NotFoundException(`Daily Site Report ${originalId} not found`);
    }
    // spec-dsr-drafts (review item 8): a DRAFT is private and unmaterialised —
    // it can't be corrected (there is nothing submitted to supersede).
    // Consistent with findOne hiding drafts: treat a draft target as absent.
    if (original.status !== DsrStatus.SUBMITTED) {
      throw new NotFoundException(`Daily Site Report ${originalId} not found`);
    }

    // AC #4 says a correction is "a second, linked row for that same
    // Site/date" — enforce that rather than trusting the client, since
    // findCurrentForSiteAndDate()/listByDate() resolve "current version"
    // by grouping rows under (siteId, reportDate); a correction recorded
    // under a different Site or date would silently detach from the
    // report it claims to correct instead of superseding it.
    const originalDateStr = original.reportDate.toISOString().slice(0, 10);
    if (
      input.siteId !== original.siteId ||
      input.reportDate !== originalDateStr
    ) {
      throw new BadRequestException(
        'A correction must keep the same Site and date as the report it corrects',
      );
    }

    const reportDate = new Date(input.reportDate);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Same site+date advisory lock create() takes, so a correction
        // serializes against concurrent plain submissions AND against a
        // concurrent second correction of the same report — which must be
        // rejected below, not least because the stock reversal for the
        // superseded report's rows may only ever run once.
        await lockOnKey(tx, `dsr:${input.siteId}:${input.reportDate}`);

        const alreadyCorrected = await tx.dailySiteReport.findFirst({
          where: { correctsId: originalId },
          select: { id: true },
        });
        if (alreadyCorrected) {
          throw new ConflictException(
            'This report has already been corrected — correct the latest version instead',
          );
        }

        const dsr = await tx.dailySiteReport.create({
          data: {
            siteId: input.siteId,
            reportDate,
            submittedByUserId,
            workCompleted: input.workCompleted,
            workInProgress: input.workInProgress,
            plannedWork: input.plannedWork,
            issuesBlockers: input.issuesBlockers,
            safetyObservations: input.safetyObservations,
            notes: input.notes,
            equipmentUsed: input.equipmentUsed,
            correctsId: originalId,
            reason,
          },
        });

        for (const workRecord of this.sortedWorkRecords(input)) {
          await this.assertNoDoubleBooking(
            tx,
            workRecord.teamMemberId,
            reportDate,
            input.siteId,
          );
          // Always a fresh row — never update an existing WorkRecord, even
          // one belonging to the report being corrected (AD-9).
          await tx.workRecord.create({
            data: {
              teamMemberId: workRecord.teamMemberId,
              siteId: input.siteId,
              workDate: reportDate,
              attended: workRecord.attended,
              hours: workRecord.hours,
              overtimeHours: workRecord.overtimeHours,
              dailySiteReportId: dsr.id,
            },
          });
        }

        // FR-12/FR-54: the superseded report's Consumption rows stay in
        // the ledger untouched (AD-9), but their Site Stock effect is
        // handed back here and the restated rows below charge stock
        // afresh — so current Stock always reflects the *current* version
        // of the report, and net across the whole correction is
        // (restated − original), the same signed-delta a standalone
        // Consumption correction applies.
        const supersededConsumptions = await tx.consumption.findMany({
          where: { dailySiteReportId: originalId },
        });
        for (const superseded of supersededConsumptions) {
          await applySiteStockDelta(
            tx,
            superseded.siteId,
            superseded.materialSizeId,
            -superseded.quantity.toNumber(),
            'Not enough Site Stock for this Consumption.',
          );
        }

        for (const consumption of input.consumptions) {
          await tx.consumption.create({
            data: {
              siteId: input.siteId,
              materialSizeId: consumption.materialSizeId,
              quantity: consumption.quantity,
              activityReference: consumption.activityReference,
              dailySiteReportId: dsr.id,
              recordedByUserId: submittedByUserId,
              consumedAt: reportDate,
            },
          });
          await applySiteStockDelta(
            tx,
            input.siteId,
            consumption.materialSizeId,
            consumption.quantity,
            'Not enough Site Stock for this Consumption.',
          );
        }

        for (const rmc of input.rmcEntries) {
          const totalAmount = rmc.quantityM3 * rmc.ratePerM3;
          await tx.rmcEntry.create({
            data: {
              siteId: input.siteId,
              vendorId: rmc.vendorId,
              quantityM3: rmc.quantityM3,
              grade: rmc.grade,
              ratePerM3: rmc.ratePerM3,
              totalAmount,
              deliveredAt: reportDate,
              dailySiteReportId: dsr.id,
            },
          });
        }

        for (const expense of input.expenses) {
          await tx.expense.create({
            data: {
              siteId: input.siteId,
              categoryId: expense.categoryId,
              amount: expense.amount,
              description: expense.description,
              paymentMethod: expense.paymentMethod,
              personOrVendor: expense.personOrVendor,
              dailySiteReportId: dsr.id,
              incurredAt: reportDate,
            },
          });
        }

        return tx.dailySiteReport.findUniqueOrThrow({
          where: { id: dsr.id },
          include: {
            workRecords: true,
            consumptions: true,
            rmcEntries: true,
            expenses: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This record conflicts with an existing one',
        );
      }
      throw error;
    }
  }

  // AC #1: "yesterday's crew" means the last day this Site had any
  // attendance recorded, not literally date-1 — a Site can skip a day.
  async getCrewDefaults(siteId: string, beforeDate: string) {
    const mostRecent = await this.prisma.workRecord.findFirst({
      where: { siteId, workDate: { lt: new Date(beforeDate) } },
      orderBy: { workDate: 'desc' },
      select: { workDate: true },
    });

    if (!mostRecent) {
      return [];
    }

    const records = await this.prisma.workRecord.findMany({
      where: {
        siteId,
        workDate: mostRecent.workDate,
        attended: true,
        // A corrected DSR leaves its original attendance rows in place
        // (AD-9) — default from the correction's restated crew only, or
        // the same person pre-populates twice.
        ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
      },
      include: { teamMember: true },
    });

    return records.map((record) => ({
      teamMemberId: record.teamMemberId,
      name: record.teamMember.name,
    }));
  }

  // Story 3.5 Task 3: a (siteId, reportDate) pair can now have a chain of
  // rows (original -> correction -> correction...). The "current version"
  // is the one nothing else's correctsId points at — the tip of the chain.
  async findCurrentForSiteAndDate(siteId: string, reportDate: Date) {
    const rows = await this.prisma.dailySiteReport.findMany({
      // spec-dsr-drafts: a private DRAFT is never "the current report".
      where: { siteId, reportDate, ...SUBMITTED_DSR_WHERE },
    });
    if (rows.length === 0) return null;
    const correctedIds = new Set(
      rows.map((r) => r.correctsId).filter((x): x is string => x !== null),
    );
    return rows.find((r) => !correctedIds.has(r.id)) ?? null;
  }

  // FR-28/story 3.4 AC #1: a list, not a detail — deliberately lightweight
  // (site/submitter names + row counts) rather than the full nested
  // include findOne below uses, since this backs a log table, not a
  // single-report read view. Story 3.5: only the current (uncorrected-over)
  // version of each Site/date's report is shown, never a superseded one.
  async listByDate(date: string) {
    const rows = await this.prisma.dailySiteReport.findMany({
      // spec-dsr-drafts: the /daily-activity log shows SUBMITTED only.
      where: { reportDate: new Date(date), ...SUBMITTED_DSR_WHERE },
      include: {
        site: { select: { id: true, name: true } },
        submittedBy: { select: { name: true } },
        _count: { select: { workRecords: true, consumptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const correctedIds = new Set(
      rows.map((r) => r.correctsId).filter((x): x is string => x !== null),
    );
    return rows.filter((r) => !correctedIds.has(r.id));
  }

  // Story 13.2 (FR-42): one Site's DSR history across a date window, for the
  // Site Reports view. Same "current version only" rule as listByDate (a
  // superseded row that some later correction points at is filtered out via
  // its correctsId), and the same lightweight list shape (site/submitter
  // names + row counts) — this backs a report table linking to each DSR's
  // detail, not a full nested read. This extends the existing
  // DailySiteReport query capability with a from/to bound; it introduces no
  // new aggregation of its own.
  async listBySiteInRange(siteId: string, from?: string, to?: string) {
    const rows = await this.prisma.dailySiteReport.findMany({
      // spec-dsr-drafts: Site Reports show SUBMITTED only.
      where: {
        siteId,
        reportDate: dateRangeBounds(from, to),
        ...SUBMITTED_DSR_WHERE,
      },
      include: {
        site: { select: { id: true, name: true } },
        submittedBy: { select: { name: true } },
        _count: { select: { workRecords: true, consumptions: true } },
      },
      orderBy: { reportDate: 'desc' },
    });
    const correctedIds = new Set(
      rows.map((r) => r.correctsId).filter((x): x is string => x !== null),
    );
    return rows.filter((r) => !correctedIds.has(r.id));
  }

  // Story 16.6: the global Search palette's Daily Report coverage — matches
  // the linked Site/submitter name plus every free-text narrative field.
  // A DSR that has since been corrected (its id appears as some other row's
  // correctsId) is excluded — same "current version only" rule as
  // listByDate/listBySiteInRange above, but DB-side here since search's
  // candidate set is filtered by `q` first. `superseded` is computed once
  // by the caller (SearchService) and shared across every entity that needs
  // it — see ConsumptionService.searchCandidates for why.
  async searchCandidates(
    q: string,
    superseded: string[],
  ): Promise<{
    candidates: Prisma.DailySiteReportGetPayload<{
      include: { site: true; submittedBy: true };
    }>[];
    total: number;
  }> {
    const where: Prisma.DailySiteReportWhereInput = {
      id: { notIn: superseded },
      // spec-dsr-drafts: a private DRAFT never surfaces in global search.
      ...SUBMITTED_DSR_WHERE,
      OR: [
        { site: { name: { contains: q, mode: 'insensitive' as const } } },
        {
          submittedBy: {
            name: { contains: q, mode: 'insensitive' as const },
          },
        },
        { workCompleted: { contains: q, mode: 'insensitive' as const } },
        { workInProgress: { contains: q, mode: 'insensitive' as const } },
        { plannedWork: { contains: q, mode: 'insensitive' as const } },
        { issuesBlockers: { contains: q, mode: 'insensitive' as const } },
        { safetyObservations: { contains: q, mode: 'insensitive' as const } },
        { notes: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.dailySiteReport.findMany({
        where,
        include: { site: true, submittedBy: true },
        orderBy: { reportDate: 'desc' },
        take: 200,
      }),
      this.prisma.dailySiteReport.count({ where }),
    ]);
    return { candidates, total };
  }

  // story 3.4 AC #2: the single report's full detail. Story 3.5: also
  // reports whether this specific report has since been corrected, so the
  // detail page can point at the newer version instead of silently
  // presenting stale data as current.
  async findOne(id: string) {
    const dsr = await this.prisma.dailySiteReport.findUnique({
      where: { id },
      include: {
        site: true,
        submittedBy: true,
        workRecords: { include: { teamMember: true } },
        consumptions: {
          include: { materialSize: { include: { material: true } } },
        },
        rmcEntries: { include: { vendor: true } },
        expenses: { include: { category: true } },
        photos: true,
      },
    });
    // spec-dsr-drafts: a DRAFT is private and unmaterialised — it is not a
    // viewable report. The Resume path reads it through getDraft(); this
    // public detail lookup treats it as absent (the /daily-activity/[id]
    // page renders notFound()).
    if (!dsr || dsr.status !== DsrStatus.SUBMITTED) {
      throw new NotFoundException(`Daily Site Report ${id} not found`);
    }

    // The Daily Report detail page only ever renders these into a small
    // thumbnail grid (no lightbox/full-size viewer) — same reasoning as
    // getSitePhotoGallery.
    const photos = await Promise.all(
      dsr.photos.map(async (photo) => ({
        ...photo,
        url: await this.storage.getThumbnailUrl(photo.storageKey),
      })),
    );

    const correction = await this.prisma.dailySiteReport.findFirst({
      where: { correctsId: id },
      select: { id: true },
    });

    return { ...dsr, photos, correctedById: correction?.id ?? null };
  }
}
