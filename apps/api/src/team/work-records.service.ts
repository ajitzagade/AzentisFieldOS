import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type {
  CreateWorkRecordBatchInput,
  CreateWorkRecordInput,
  LabourReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { lockOnKey } from '../common/advisory-lock';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';

type WorkRecordListRow = Prisma.WorkRecordGetPayload<{
  include: { teamMember: true; site: true };
}>;

// FR-20: labour presence tracked per Site per day. WorkRecord.@@index
// ([teamMemberId, workDate]) is a plain index, not a unique constraint
// (Story 3.5 relaxed it so DSR corrections can share a crew
// member/date) — so AC #1's same-date collision guard is enforced here
// via the same Postgres advisory-lock pattern DsrService's
// assertNoDoubleBooking already uses, locking on the identical
// `workrecord:${teamMemberId}:${workDate}` key so a DSR submission and a
// standalone Work Record entry for the same crew member/date properly
// serialize against each other.
@Injectable()
export class WorkRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateWorkRecordInput) {
    const workDate = new Date(input.workDate);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.assertNoExistingWorkRecord(tx, input.teamMemberId, workDate);
        return this.createRow(tx, input, workDate);
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // AC #2/#3: a whole crew checked in at once. Rows processed in
  // teamMemberId-sorted order — matching DsrService's crew-member lock
  // ordering — so concurrent batches touching overlapping people always
  // request their per-person locks in the same relative order and block
  // on each other instead of deadlocking.
  async createBatch(input: CreateWorkRecordBatchInput) {
    const sorted = [...input].sort((a, b) =>
      a.teamMemberId.localeCompare(b.teamMemberId),
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        const created: Awaited<ReturnType<typeof this.createRow>>[] = [];
        for (const record of sorted) {
          const workDate = new Date(record.workDate);
          await this.assertNoExistingWorkRecord(
            tx,
            record.teamMemberId,
            workDate,
          );
          created.push(await this.createRow(tx, record, workDate));
        }
        return created;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 6.3 AC #2: "by Site" is this same query with a siteId filter —
  // one query capability, not a second copy of it under apps/api/src/sites/.
  // Story 13.3 (FR-44): the Labour Reports view reuses this same capability,
  // adding optional teamMemberId + date-window narrowing. Called the old way
  // (`list()` / `list('site1')`) the `where` is byte-identical to before —
  // `undefined` with no filters, `{ siteId }` with only a Site — so existing
  // callers/tests are unaffected.
  // Work Records belonging to a superseded (since corrected) DSR are
  // excluded — the correction filed its own restated attendance rows, and
  // counting both would double-count that crew's day (same rule as
  // ConsumptionService.list).
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior (byte-identical for every existing caller/test) is
  // unchanged.
  async list(
    siteId?: string,
    filters: LabourReportFilters = {},
  ): Promise<WorkRecordListRow[] | PaginatedResult<WorkRecordListRow>> {
    const where: Prisma.WorkRecordWhereInput = {
      ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
    };
    if (siteId) where.siteId = siteId;
    if (filters.teamMemberId) where.teamMemberId = filters.teamMemberId;
    const bounds = dateRangeBounds(filters.from, filters.to);
    if (bounds) where.workDate = bounds;
    const include = { teamMember: true, site: true };
    const orderBy: Prisma.WorkRecordOrderByWithRelationInput = {
      workDate: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.workRecord.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.workRecord.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.workRecord.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  // AC #2: "previous day" means the most recent prior date with data for
  // this Site, not literally date - 1 (a Site can skip a day, or be new).
  async getDefaultCrew(siteId: string, beforeDate: string) {
    const parsedDate = new Date(beforeDate);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`"${beforeDate}" is not a valid date`);
    }

    const mostRecent = await this.prisma.workRecord.findFirst({
      where: { siteId, workDate: { lt: parsedDate } },
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
        // A corrected DSR leaves its original attendance rows in place
        // (AD-9) — default from the correction's restated crew only, or
        // the same person appears twice in the checklist.
        ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
      },
      include: { teamMember: true },
    });

    return records.map((record) => ({
      teamMemberId: record.teamMemberId,
      name: record.teamMember.name,
      attended: record.attended,
    }));
  }

  private async assertNoExistingWorkRecord(
    tx: Prisma.TransactionClient,
    teamMemberId: string,
    workDate: Date,
  ) {
    await lockOnKey(tx, `workrecord:${teamMemberId}:${workDate.toISOString()}`);
    // Task 3: a 409 must name which Team Member conflicted, not just the
    // date — a batch submission needs to trace the error back to a row.
    const existing = await tx.workRecord.findFirst({
      where: { teamMemberId, workDate },
      include: { teamMember: true },
    });
    if (existing) {
      throw new ConflictException(
        `${existing.teamMember.name} already has a Work Record for ${workDate.toISOString().slice(0, 10)}`,
      );
    }
  }

  private createRow(
    tx: Prisma.TransactionClient,
    input: CreateWorkRecordInput,
    workDate: Date,
  ) {
    return tx.workRecord.create({
      data: {
        teamMemberId: input.teamMemberId,
        siteId: input.siteId,
        workDate,
        attended: input.attended,
        hours: input.hours,
        overtimeHours: input.overtimeHours,
      },
    });
  }

  // A teamMemberId/siteId that doesn't exist must be a clean 400, not a
  // raw 500 — same pattern as PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (error instanceof ConflictException) {
      return error;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Work Record references a Team Member or Site that does not exist',
      );
    }
    return error;
  }
}
