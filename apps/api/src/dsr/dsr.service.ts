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
import { getSiteActivityFeed } from '../sites/site-activity-feed';
import { createWorkEntry } from '../subcontractors/work-entry-write';

// Production incident (2026-09-19): a DSR with a realistic number of crew
// members/consumptions/RMC entries/expenses ran the sequential per-record
// loops in materializeSubRecords past Prisma's 5000ms default interactive-
// transaction timeout (confirmed via prod logs: P2028, "5586 ms passed
// since the start of the transaction"), which surfaced to the Supervisor as
// an opaque 500 and silently dropped the report into the offline queue.
// create()/correct()/finalizeDraft() all run that same loop — same budget
// for all three. The Vercel function itself allows 60s (vercel.json), so
// this has headroom without risking a runaway hang.
const DSR_TRANSACTION_OPTIONS = { timeout: 20_000 };

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
  // Returns the existing WorkRecord for this person/date AT THIS SITE (if
  // any), so create()'s update-vs-create branch can reuse it instead of
  // running a second, near-identical findFirst right after this one.
  //
  // Client-readiness batch (goal 6): a crew member CAN legitimately work
  // more than one Site on the same date (e.g. a half-day at each) — this
  // used to throw ConflictException when the person's most recent WorkRecord
  // for the date belonged to a different Site, which wrongly blocked that
  // case. The advisory lock is still needed (serializes concurrent
  // create()/correct() calls for the same person+date so they can't race
  // into duplicate rows), it's just narrowed to this Site's own existing row
  // so a different Site's booking never collides with or blocks this one.
  // The separate, stricter standalone Work Record entry restriction
  // (WorkRecordsService.assertNoExistingWorkRecord) is untouched.
  private async assertNoDoubleBooking(
    tx: Prisma.TransactionClient,
    teamMemberId: string,
    workDate: Date,
    siteId: string,
  ) {
    await lockOnKey(tx, `workrecord:${teamMemberId}:${workDate.toISOString()}`);
    const existing = await tx.workRecord.findFirst({
      where: { teamMemberId, workDate, siteId },
    });
    return existing;
  }

  // Review fix (finding #2): resolves a Waste Material entry's TRUE
  // current cumulative state by walking its correction chain FORWARD from
  // the root — the one row that carries the entry's (globally unique)
  // clientGeneratedId, since no correction row is ever given one (it would
  // violate the unique constraint) — to its current tip, summing each
  // numeric field along the way. Delta-ing a new correction against just
  // the immediately-superseded report's own row (one hop back) is wrong
  // from the second correction of the same entry onward: that row's own
  // stored tripCount/otherCharges are themselves deltas, not the entry's
  // absolute state, so subtracting against them directly corrupts the
  // total. Returns null when no root exists yet (a brand-new entry).
  private async currentWasteDisposalState(
    tx: Prisma.TransactionClient,
    clientGeneratedId: string,
  ): Promise<{
    tipId: string;
    tripCount: number;
    otherCharges: Prisma.Decimal;
    ratePerTrip: Prisma.Decimal | null;
    paymentStatus: string | null;
  } | null> {
    const root = await tx.wasteDisposal.findUnique({
      where: { clientGeneratedId },
    });
    if (!root) return null;

    let tipId = root.id;
    let tripCount = root.tripCount;
    let otherCharges = root.otherCharges;
    let ratePerTrip = root.ratePerTrip;
    let paymentStatus = root.paymentStatus;
    let frontier = [root.id];

    while (frontier.length > 0) {
      const children = await tx.wasteDisposal.findMany({
        where: { correctsId: { in: frontier } },
      });
      if (children.length === 0) break;
      frontier = [];
      for (const child of children) {
        tipId = child.id;
        tripCount += child.tripCount;
        otherCharges = otherCharges.add(child.otherCharges);
        if (child.ratePerTrip !== null) ratePerTrip = child.ratePerTrip;
        if (child.paymentStatus !== null) paymentStatus = child.paymentStatus;
        frontier.push(child.id);
      }
    }

    return { tipId, tripCount, otherCharges, ratePerTrip, paymentStatus };
  }

  // Backward counterpart to currentWasteDisposalState — given a
  // materialized row's id (not its clientGeneratedId, which correction
  // rows never carry), finds the clientGeneratedId-bearing root of its
  // correction chain. Needed by correct()'s "don't silently drop an
  // already-materialized entry" guard (review finding #4), which only has
  // the superseded report's own row ids to start from.
  private async wasteDisposalRootClientGeneratedId(
    tx: Prisma.TransactionClient,
    rowId: string,
  ): Promise<string | null> {
    let current = await tx.wasteDisposal.findUnique({ where: { id: rowId } });
    while (
      current &&
      current.clientGeneratedId === null &&
      current.correctsId
    ) {
      current = await tx.wasteDisposal.findUnique({
        where: { id: current.correctsId },
      });
    }
    return current?.clientGeneratedId ?? null;
  }

  // Same reasoning as currentWasteDisposalState above, for Subcontractor
  // Work Entry's quantity (SiteContract.quantityCompleted is a materialized
  // running total, same class of bug as Waste Material's totalAmount).
  private async currentSubcontractorWorkEntryState(
    tx: Prisma.TransactionClient,
    clientGeneratedId: string,
  ): Promise<{ tipId: string; quantity: number } | null> {
    const root = await tx.subcontractorWorkEntry.findUnique({
      where: { clientGeneratedId },
    });
    if (!root) return null;

    let tipId = root.id;
    let quantity = root.quantity.toNumber();
    let frontier = [root.id];

    while (frontier.length > 0) {
      const children = await tx.subcontractorWorkEntry.findMany({
        where: { correctsId: { in: frontier } },
      });
      if (children.length === 0) break;
      frontier = [];
      for (const child of children) {
        tipId = child.id;
        quantity += child.quantity.toNumber();
        frontier.push(child.id);
      }
    }

    return { tipId, quantity };
  }

  // Backward counterpart to currentSubcontractorWorkEntryState — same
  // reasoning as wasteDisposalRootClientGeneratedId above.
  private async subcontractorWorkEntryRootClientGeneratedId(
    tx: Prisma.TransactionClient,
    rowId: string,
  ): Promise<string | null> {
    let current = await tx.subcontractorWorkEntry.findUnique({
      where: { id: rowId },
    });
    while (
      current &&
      current.clientGeneratedId === null &&
      current.correctsId
    ) {
      current = await tx.subcontractorWorkEntry.findUnique({
        where: { id: current.correctsId },
      });
    }
    return current?.clientGeneratedId ?? null;
  }

  // Review fix (finding #1): walks a Waste Material/Subcontractor Work
  // Entry correction chain BACKWARD from this DSR's own current rows,
  // collecting every ancestor id along the way (not just the current tip).
  // Unlike RMC/Consumption/Expense (fresh, fully-restated rows on
  // correction — naturally excluded from the feed via
  // currentDsrRowsWhere's superseded-DSR filter), these two use
  // correctsId-chain DELTA rows that are meant to be summed with their
  // ancestors (see WasteDisposalService.summary()/quantityCompleted), so
  // every ancestor is the SAME logical entry as this DSR's current row and
  // must also be excluded from otherActivity — or a corrected DSR's
  // pre-correction row leaks in as if it were someone else's activity.
  private async collectCorrectsIdAncestors(
    model: 'wasteDisposal' | 'subcontractorWorkEntry',
    startIds: string[],
  ): Promise<string[]> {
    const ancestorIds: string[] = [];
    let frontier = startIds;
    while (frontier.length > 0) {
      ancestorIds.push(...frontier);
      const rows =
        model === 'wasteDisposal'
          ? await this.prisma.wasteDisposal.findMany({
              where: { id: { in: frontier } },
              select: { correctsId: true },
            })
          : await this.prisma.subcontractorWorkEntry.findMany({
              where: { id: { in: frontier } },
              select: { correctsId: true },
            });
      frontier = rows
        .map((r) => r.correctsId)
        .filter((id): id is string => id !== null);
    }
    return ancestorIds;
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
      // Server-computed, never client-trusted. Rate absent (pricing
      // pending, goal 1) ⇒ totalAmount stays null — multiplying against a
      // missing rate would otherwise produce NaN into a nullable-but-still-
      // typed column.
      const totalAmount =
        rmc.ratePerM3 === undefined ? null : rmc.quantityM3 * rmc.ratePerM3;
      const data = {
        siteId: input.siteId,
        vendorId: rmc.vendorId,
        quantityM3: rmc.quantityM3,
        grade: rmc.grade,
        ratePerM3: rmc.ratePerM3 ?? null,
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

    // Client-readiness batch (2026-09-20), goal 3: mirrors the RMC loop
    // above exactly — server-computed totalAmount (D7: null whenever
    // ratePerTrip is absent, matching WasteDisposalService.create()'s own
    // tripCount × ratePerTrip + otherCharges arithmetic), upsert-by-
    // clientGeneratedId for offline-sync retry idempotency. Never sets
    // correctsId here — a plain submission/finalize is never a correction
    // of anything.
    for (const waste of input.wasteDisposalEntries) {
      const totalAmount =
        waste.ratePerTrip === undefined
          ? null
          : new Prisma.Decimal(waste.tripCount)
              .mul(waste.ratePerTrip)
              .add(waste.otherCharges ?? 0);
      const data = {
        siteId: input.siteId,
        wasteType: waste.wasteType,
        quantityDetails: waste.quantityDetails,
        ownership: waste.ownership,
        vendorId: waste.vendorId,
        machineryId: waste.machineryId,
        vehicleId: waste.vehicleId,
        vehicleDetails: waste.vehicleDetails,
        tripCount: waste.tripCount,
        ratePerTrip: waste.ratePerTrip ?? null,
        otherCharges: waste.otherCharges ?? 0,
        totalAmount,
        paymentStatus:
          waste.ratePerTrip === undefined
            ? null
            : (waste.paymentStatus ?? null),
        disposalLocation: waste.disposalLocation,
        notes: waste.notes,
        disposedAt: reportDate,
        recordedByUserId: submittedByUserId,
        dailySiteReportId: dsrId,
      };
      if (waste.clientGeneratedId) {
        await tx.wasteDisposal.upsert({
          where: { clientGeneratedId: waste.clientGeneratedId },
          update: data,
          create: { ...data, clientGeneratedId: waste.clientGeneratedId },
        });
      } else {
        await tx.wasteDisposal.create({ data });
      }
    }

    // Client-readiness batch (2026-09-20), goal 4: only entries that picked
    // a real Site Contract + quantity get a real SubcontractorWorkEntry —
    // an entry with workNote only stays exactly as informational as today
    // (the JSON write to subcontractorEntries happens unconditionally,
    // outside this loop, via dsrData above). Guarded by clientGeneratedId
    // against a retried offline sync double-creating the entry (and
    // double-incrementing quantityCompleted) — SubcontractorWorkEntry is
    // append-only (AD-9), so unlike Consumption/RMC/Expense/Waste Material
    // above this is a skip-if-already-materialized check, never an upsert.
    for (const subcontractor of input.subcontractorEntries) {
      if (
        !subcontractor.siteContractId ||
        subcontractor.quantity === undefined
      ) {
        continue;
      }
      if (subcontractor.clientGeneratedId) {
        const existing = await tx.subcontractorWorkEntry.findUnique({
          where: { clientGeneratedId: subcontractor.clientGeneratedId },
        });
        if (existing) continue;
      }
      await createWorkEntry(
        tx,
        {
          siteContractId: subcontractor.siteContractId,
          quantity: subcontractor.quantity,
          workDate: reportDate,
          note: subcontractor.workNote,
          dailySiteReportId: dsrId,
          clientGeneratedId: subcontractor.clientGeneratedId,
          siteId: input.siteId,
        },
        submittedByUserId,
      );
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
          subcontractorEntries: input.subcontractorEntries,
          labourEntries: input.labourEntries,
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
            wasteDisposalEntries: true,
            subcontractorWorkEntries: true,
          },
        });
      }, DSR_TRANSACTION_OPTIONS);

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
      // Same translation finalizeDraft's catch already does for the same
      // materializeSubRecords loop — a Team Member/Material/Vendor/Category
      // referenced by this DSR that no longer exists must surface as an
      // actionable 400, never an opaque 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2025')
      ) {
        throw new BadRequestException(
          'A referenced Site, Vendor, Material or Team Member no longer exists',
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
      // Client-readiness batch (2026-09-20), goal 3: Waste Material is a
      // real-row-materializing sub-record exactly like RMC/Consumption/
      // Expense above (never a plain column, unlike equipmentUsed/
      // subcontractorEntries/labourEntries) — it must be deferred here too,
      // or a Waste Material row typed before Save Draft silently vanishes
      // on Resume.
      wasteDisposalEntries: input.wasteDisposalEntries,
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
        subcontractorEntries: input.subcontractorEntries,
        labourEntries: input.labourEntries,
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
        wasteDisposalEntries?: CreateDsrInput['wasteDisposalEntries'];
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
      subcontractorEntries: draft.subcontractorEntries,
      labourEntries: draft.labourEntries,
      workRecords: content.workRecords ?? [],
      consumptions: content.consumptions ?? [],
      rmcEntries: content.rmcEntries ?? [],
      expenses: content.expenses ?? [],
      wasteDisposalEntries: content.wasteDisposalEntries ?? [],
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
          subcontractorEntries: draft.subcontractorEntries ?? [],
          labourEntries: draft.labourEntries ?? [],
          wasteDisposalEntries: content.wasteDisposalEntries ?? [],
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
            wasteDisposalEntries: true,
            subcontractorWorkEntries: true,
          },
        });
      }, DSR_TRANSACTION_OPTIONS);

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

        // Review fix (finding #4): a correction that silently drops an
        // already-materialized Waste Material/Subcontractor Work Entry
        // (present on the superseded report, absent — or unlinked, for
        // Subcontractor — from this submission) would leave that ledger
        // contribution stuck forever with no way to reverse it. Unlike RMC/
        // Consumption/Expense (naturally invisible once superseded — no
        // correctsId chain to break), these two are real, separately-
        // aggregated rows a plain "just don't resubmit it" can't safely
        // erase. This codebase's own convention (CorrectedValueField) is
        // "type the corrected value," never "delete by omission" — refuse
        // rather than silently orphaning the row.
        const supersededWasteRows = await tx.wasteDisposal.findMany({
          where: { dailySiteReportId: originalId },
        });
        const submittedWasteClientGeneratedIds = new Set(
          input.wasteDisposalEntries
            .map((w) => w.clientGeneratedId)
            .filter((cgid): cgid is string => cgid !== undefined),
        );
        for (const row of supersededWasteRows) {
          const rootId = await this.wasteDisposalRootClientGeneratedId(
            tx,
            row.id,
          );
          if (rootId && !submittedWasteClientGeneratedIds.has(rootId)) {
            throw new BadRequestException(
              'A previously recorded Waste Material entry is missing from this correction — set its trips and charges to 0 instead of removing the row.',
            );
          }
        }

        const supersededWorkEntries = await tx.subcontractorWorkEntry.findMany({
          where: { dailySiteReportId: originalId },
        });
        for (const row of supersededWorkEntries) {
          const rootId = await this.subcontractorWorkEntryRootClientGeneratedId(
            tx,
            row.id,
          );
          if (!rootId) continue;
          const resubmitted = input.subcontractorEntries.find(
            (s) => s.clientGeneratedId === rootId,
          );
          const stillLinked =
            resubmitted &&
            resubmitted.siteContractId &&
            resubmitted.quantity !== undefined;
          if (!stillLinked) {
            throw new BadRequestException(
              'A previously recorded Subcontractor Work Entry is missing from this correction — set its quantity to 0 instead of removing or unlinking the row.',
            );
          }
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
            subcontractorEntries: input.subcontractorEntries,
            labourEntries: input.labourEntries,
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
          const totalAmount =
            rmc.ratePerM3 === undefined ? null : rmc.quantityM3 * rmc.ratePerM3;
          await tx.rmcEntry.create({
            data: {
              siteId: input.siteId,
              vendorId: rmc.vendorId,
              quantityM3: rmc.quantityM3,
              grade: rmc.grade,
              ratePerM3: rmc.ratePerM3 ?? null,
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

        // Client-readiness batch (2026-09-20), goal 3: unlike RMC's loop
        // above, this DOES set correctsId/reason on a matched row —
        // WasteDisposalService.summary()/withSettlement() (used by the
        // standalone Waste Material list and the Vendor page's Advance/
        // Pending columns) sum a correctsId chain, so the row filed here
        // must carry the DELTA relative to the row it supersedes, never
        // the restated absolute value, or those screens would double-
        // count. The prior row is resolved via currentWasteDisposalState
        // (walks the FULL correction chain from the root, not just one hop
        // back — review fix #2) — a miss (no root exists yet, e.g. a wholly
        // new entry added on this correction) falls back to a fresh row.
        for (const waste of input.wasteDisposalEntries) {
          const state = waste.clientGeneratedId
            ? await this.currentWasteDisposalState(tx, waste.clientGeneratedId)
            : null;

          if (state) {
            const tripCountDelta = waste.tripCount - state.tripCount;
            const otherChargesDelta = new Prisma.Decimal(
              waste.otherCharges ?? 0,
            ).sub(state.otherCharges);
            // Review fix (finding #3): the delta must be (new absolute
            // total) − (old absolute total), never
            // tripCountDelta × newRate + otherChargesDelta — that formula
            // silently produces a zero delta whenever a rate is
            // added/changed with tripCount unchanged, leaving the entry's
            // true cost invisible in WasteDisposalService.summary() forever.
            const oldTotal =
              state.ratePerTrip === null
                ? new Prisma.Decimal(0)
                : new Prisma.Decimal(state.tripCount)
                    .mul(state.ratePerTrip)
                    .add(state.otherCharges);
            const newTotal =
              waste.ratePerTrip === undefined
                ? null
                : new Prisma.Decimal(waste.tripCount)
                    .mul(waste.ratePerTrip)
                    .add(waste.otherCharges ?? 0);
            const totalAmount =
              newTotal === null ? null : newTotal.sub(oldTotal);
            await tx.wasteDisposal.create({
              data: {
                siteId: input.siteId,
                wasteType: waste.wasteType,
                quantityDetails: waste.quantityDetails,
                ownership: waste.ownership,
                vendorId: waste.vendorId,
                machineryId: waste.machineryId,
                vehicleId: waste.vehicleId,
                vehicleDetails: waste.vehicleDetails,
                tripCount: tripCountDelta,
                ratePerTrip: waste.ratePerTrip ?? null,
                otherCharges: otherChargesDelta,
                totalAmount,
                paymentStatus:
                  waste.ratePerTrip === undefined
                    ? null
                    : (waste.paymentStatus ?? state.paymentStatus ?? null),
                disposalLocation: waste.disposalLocation,
                notes: waste.notes,
                disposedAt: reportDate,
                recordedByUserId: submittedByUserId,
                dailySiteReportId: dsr.id,
                correctsId: state.tipId,
                reason,
              },
            });
          } else {
            const totalAmount =
              waste.ratePerTrip === undefined
                ? null
                : new Prisma.Decimal(waste.tripCount)
                    .mul(waste.ratePerTrip)
                    .add(waste.otherCharges ?? 0);
            await tx.wasteDisposal.create({
              data: {
                siteId: input.siteId,
                wasteType: waste.wasteType,
                quantityDetails: waste.quantityDetails,
                ownership: waste.ownership,
                vendorId: waste.vendorId,
                machineryId: waste.machineryId,
                vehicleId: waste.vehicleId,
                vehicleDetails: waste.vehicleDetails,
                tripCount: waste.tripCount,
                ratePerTrip: waste.ratePerTrip ?? null,
                otherCharges: waste.otherCharges ?? 0,
                totalAmount,
                paymentStatus:
                  waste.ratePerTrip === undefined
                    ? null
                    : (waste.paymentStatus ?? null),
                disposalLocation: waste.disposalLocation,
                notes: waste.notes,
                disposedAt: reportDate,
                recordedByUserId: submittedByUserId,
                dailySiteReportId: dsr.id,
                // Review fix (#2/#4): MUST persist so a future correction
                // of this freshly-added-during-a-correction row can find
                // it again via currentWasteDisposalState — omitting it (as
                // the original implementation did) meant a row added on
                // correction #1 could never be properly delta-corrected on
                // correction #2; it would silently spawn a second,
                // disconnected "fresh" row instead.
                clientGeneratedId: waste.clientGeneratedId,
              },
            });
          }
        }

        // Client-readiness batch (2026-09-20), goal 4: same correctsId-
        // chain reasoning as Waste Material above — SiteContract.
        // quantityCompleted is a materialized running total, so a matched
        // entry's ledger row must carry the DELTA relative to the entry it
        // supersedes (applyQuantityDelta applies `quantity` as a raw signed
        // increment either way). currentSubcontractorWorkEntryState walks
        // the FULL correction chain (review fix #2), not just one hop back.
        for (const subcontractor of input.subcontractorEntries) {
          if (
            !subcontractor.siteContractId ||
            subcontractor.quantity === undefined
          ) {
            continue;
          }
          const state = subcontractor.clientGeneratedId
            ? await this.currentSubcontractorWorkEntryState(
                tx,
                subcontractor.clientGeneratedId,
              )
            : null;

          if (state) {
            const quantityDelta = subcontractor.quantity - state.quantity;
            await createWorkEntry(
              tx,
              {
                siteContractId: subcontractor.siteContractId,
                quantity: quantityDelta,
                workDate: reportDate,
                note: subcontractor.workNote,
                correctsId: state.tipId,
                reason,
                dailySiteReportId: dsr.id,
                siteId: input.siteId,
              },
              submittedByUserId,
            );
          } else {
            await createWorkEntry(
              tx,
              {
                siteContractId: subcontractor.siteContractId,
                quantity: subcontractor.quantity,
                workDate: reportDate,
                note: subcontractor.workNote,
                dailySiteReportId: dsr.id,
                // Review fix (#2/#4) — see the equivalent Waste Material
                // comment above.
                clientGeneratedId: subcontractor.clientGeneratedId,
                siteId: input.siteId,
              },
              submittedByUserId,
            );
          }
        }

        return tx.dailySiteReport.findUniqueOrThrow({
          where: { id: dsr.id },
          include: {
            workRecords: true,
            consumptions: true,
            rmcEntries: true,
            expenses: true,
            wasteDisposalEntries: true,
            subcontractorWorkEntries: true,
          },
        });
      }, DSR_TRANSACTION_OPTIONS);
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
      // Same translation create()'s catch applies (both run
      // materializeSubRecords-equivalent loops against possibly-stale ids).
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2025')
      ) {
        throw new BadRequestException(
          'A referenced Site, Vendor, Material or Team Member no longer exists',
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
        wasteDisposalEntries: { include: { vendor: true } },
        subcontractorWorkEntries: {
          include: { siteContract: { include: { subcontractor: true } } },
        },
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

    // Client-readiness batch (2026-09-20), goal 2: reuses the exact same
    // Site Activity Feed the Site detail page renders, narrowed to this
    // report's own Site+date — so "did my entries sync" is answerable by
    // seeing everything else recorded that day, not just this DSR's own
    // materialized rows. Own rows (including this DSR row itself) are
    // filtered out by `${type}:${id}` so nothing appears twice.
    //
    // Review fix (finding #1): Waste Material/Subcontractor Work Entry
    // corrections are correctsId-chain DELTA rows (see
    // currentWasteDisposalState's own comment) — every ancestor a chain
    // was corrected from is the SAME logical entry as this DSR's current
    // row, not a different one, so they must be excluded too.
    const wasteAncestorIds = await this.collectCorrectsIdAncestors(
      'wasteDisposal',
      dsr.wasteDisposalEntries
        .map((r) => r.correctsId)
        .filter((id): id is string => id !== null),
    );
    const workEntryAncestorIds = await this.collectCorrectsIdAncestors(
      'subcontractorWorkEntry',
      dsr.subcontractorWorkEntries
        .map((r) => r.correctsId)
        .filter((id): id is string => id !== null),
    );
    const ownKeys = new Set<string>([
      `DSR:${dsr.id}`,
      ...dsr.workRecords.map((r) => `WORK_RECORD:${r.id}`),
      ...dsr.consumptions.map((r) => `CONSUMPTION:${r.id}`),
      ...dsr.rmcEntries.map((r) => `RMC:${r.id}`),
      ...dsr.expenses.map((r) => `EXPENSE:${r.id}`),
      ...dsr.wasteDisposalEntries.map((r) => `WASTE_DISPOSAL:${r.id}`),
      ...wasteAncestorIds.map((id) => `WASTE_DISPOSAL:${id}`),
      ...dsr.subcontractorWorkEntries.map((r) => `WORK_ENTRY:${r.id}`),
      ...workEntryAncestorIds.map((id) => `WORK_ENTRY:${id}`),
    ]);
    const reportDateStr = dsr.reportDate.toISOString().slice(0, 10);
    const feed = await getSiteActivityFeed(this.prisma, dsr.siteId, {
      from: reportDateStr,
      to: reportDateStr,
    });
    const otherActivity = feed.filter(
      (item) => !ownKeys.has(`${item.type}:${item.id}`),
    );

    return {
      ...dsr,
      photos,
      correctedById: correction?.id ?? null,
      otherActivity,
    };
  }
}
