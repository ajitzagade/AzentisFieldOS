import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateAdvanceInput,
  LabourReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import { decrementOutstandingBalanceWithFloorCheck } from './outstanding-balance';

type AdvanceListRow = Prisma.AdvanceGetPayload<{
  include: { teamMember: true };
}>;

// FR-22, NFR-3: recorded immediately, no approval gate or intermediate
// status field anywhere in this create path.
@Injectable()
export class AdvancesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAdvanceInput) {
    if (input.correctsId) {
      const original = await this.prisma.advance.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Advance ${input.correctsId} does not exist`,
        );
      }
      // A correction must stay tied to the same Team Member as the
      // Advance it corrects, or its amount delta would apply to the
      // wrong person's Outstanding Balance.
      if (original.teamMemberId !== input.teamMemberId) {
        throw new BadRequestException(
          "A correction's Team Member must match the Advance it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // `givenAt` is already a Date — createAdvanceSchema coerces it
        // (unlike the plain `z.iso.date()` string most other transaction
        // schemas use), so no extra Date() conversion is needed here.
        const advance = await tx.advance.create({ data: input });

        // AD-9: Outstanding Balance is materialized and write-path-only.
        // `amount` is the signed delta (positive for an original Advance,
        // either sign for a correction). Advance's sign convention is the
        // inverse of AdvanceAdjustment's (positive increases the balance,
        // not decreases it), so this increments via the shared floor-check
        // helper by passing `-amount` — floor-checked because a negative
        // correction (the original Advance was overstated) decrements the
        // balance and must not be allowed to drive it below zero, the same
        // invariant AdvanceAdjustmentsService/PaymentsService already
        // enforce on every other balance-decrementing write path.
        await decrementOutstandingBalanceWithFloorCheck(
          tx,
          input.teamMemberId,
          -input.amount,
          "This correction would take the Team Member's Outstanding Balance below zero.",
        );

        return advance;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 13.3 (FR-44): the Labour Reports view reuses this same Advance
  // history, optionally narrowed by Team Member and a date window (on
  // `givenAt`, the Advance's business date). Unfiltered (the default `{}`)
  // the query is unchanged, so the Team Member detail page's Advance Ledger
  // is byte-identical.
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior (and the Team Member detail page's Advance Ledger)
  // is unchanged.
  list(
    filters: LabourReportFilters = {},
  ): Promise<AdvanceListRow[] | PaginatedResult<AdvanceListRow>> {
    const where: Prisma.AdvanceWhereInput = {};
    if (filters.teamMemberId) where.teamMemberId = filters.teamMemberId;
    where.givenAt = dateRangeBounds(filters.from, filters.to);
    const include = { teamMember: true };
    const orderBy: Prisma.AdvanceOrderByWithRelationInput = {
      givenAt: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.advance.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.advance.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.advance.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  // The correction form (apps/web) needs the original Advance's fields to
  // pre-fill from — same precedent as PurchasesService.findOne.
  async findOne(id: string) {
    const advance = await this.prisma.advance.findUnique({
      where: { id },
      include: { teamMember: true },
    });
    if (!advance) {
      throw new NotFoundException(`Advance ${id} not found`);
    }
    return advance;
  }

  // A teamMemberId that doesn't exist must be a clean 400, not a raw 500 —
  // same pattern as PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Advance references a Team Member that does not exist',
      );
    }
    return error;
  }
}
