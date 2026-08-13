import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateDsrInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPlaceholderUserId } from '../common/get-placeholder-user-id';
import { StorageService } from '../storage/storage.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Serializes concurrent transactions that touch the same logical key by
  // blocking until any earlier transaction holding it commits or rolls
  // back (an xact-scoped advisory lock releases automatically then) — the
  // standard Postgres pattern for closing a check-then-act race without a
  // DB constraint. Every call site acquires locks in the same relative
  // order (site+date lock, if any, before per-crew-member locks; crew
  // member locks always in teamMemberId-sorted order) so two transactions
  // can never deadlock waiting on each other.
  private async lockOnKey(tx: Prisma.TransactionClient, key: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }

  private async assertNoDoubleBooking(
    tx: Prisma.TransactionClient,
    teamMemberId: string,
    workDate: Date,
    siteId: string,
  ) {
    await this.lockOnKey(
      tx,
      `workrecord:${teamMemberId}:${workDate.toISOString()}`,
    );
    const existing = await tx.workRecord.findFirst({
      where: { teamMemberId, workDate },
    });
    if (existing && existing.siteId !== siteId) {
      throw new ConflictException(
        'A crew member is already recorded at another Site on this date',
      );
    }
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

  async create(input: CreateDsrInput) {
    const submittedByUserId = await getPlaceholderUserId(this.prisma);
    const reportDate = new Date(input.reportDate);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Advisory lock, acquired before anything else in this
        // transaction: DailySiteReport.@@unique([siteId, reportDate]) was
        // relaxed to a plain index (Story 3.5) so a correction can share a
        // Site/date with the report it corrects. Without this lock, two
        // concurrent plain submissions for the same Site/date (e.g. a
        // manual resubmit racing Story 3.2's offline-sync retry) could
        // both pass the findFirst below and both insert a new "original"
        // row, violating AD-8's "a retried sync can never create a
        // duplicate" guarantee.
        await this.lockOnKey(tx, `dsr:${input.siteId}:${input.reportDate}`);

        const existingOriginal = await tx.dailySiteReport.findFirst({
          where: { siteId: input.siteId, reportDate, correctsId: null },
        });

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

        for (const workRecord of this.sortedWorkRecords(input)) {
          await this.assertNoDoubleBooking(
            tx,
            workRecord.teamMemberId,
            reportDate,
            input.siteId,
          );

          const existingWorkRecord = await tx.workRecord.findFirst({
            where: {
              teamMemberId: workRecord.teamMemberId,
              workDate: reportDate,
              siteId: input.siteId,
            },
          });
          const workRecordData = {
            attended: workRecord.attended,
            hours: workRecord.hours,
            overtimeHours: workRecord.overtimeHours,
            dailySiteReportId: dsr.id,
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
            dailySiteReportId: dsr.id,
            recordedByUserId: submittedByUserId,
            consumedAt: reportDate,
          };
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
            dailySiteReportId: dsr.id,
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
            dailySiteReportId: dsr.id,
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

  // Story 3.5 (AD-9, FR-54): a correction is always a brand-new
  // DailySiteReport row, with its own brand-new nested rows — it never
  // updates the report it corrects or that report's own rows. AC #4: this
  // deliberately does NOT go through create()'s "find the existing
  // non-corrected row for this Site/date" logic — a correction is expected
  // to coexist with the row it corrects, not merge into it.
  async correct(originalId: string, input: CreateDsrInput, reason: string) {
    const original = await this.prisma.dailySiteReport.findUnique({
      where: { id: originalId },
    });
    if (!original) {
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

    const submittedByUserId = await getPlaceholderUserId(this.prisma);
    const reportDate = new Date(input.reportDate);

    try {
      return await this.prisma.$transaction(async (tx) => {
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
      where: { siteId, workDate: mostRecent.workDate, attended: true },
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
      where: { siteId, reportDate },
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
      where: { reportDate: new Date(date) },
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
    if (!dsr) {
      throw new NotFoundException(`Daily Site Report ${id} not found`);
    }

    const photos = await Promise.all(
      dsr.photos.map(async (photo) => ({
        ...photo,
        url: await this.storage.getReadUrl(photo.storageKey),
      })),
    );

    const correction = await this.prisma.dailySiteReport.findFirst({
      where: { correctsId: id },
      select: { id: true },
    });

    return { ...dsr, photos, correctedById: correction?.id ?? null };
  }
}
