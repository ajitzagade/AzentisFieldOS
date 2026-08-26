import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateAdvanceAdjustmentInput,
  LabourReportFilters,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { decrementOutstandingBalanceWithFloorCheck } from './outstanding-balance';

// FR-23: reduces a Team Member's pooled Outstanding Balance, capped at the
// current balance, race-safe under concurrent submissions.
@Injectable()
export class AdvanceAdjustmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAdvanceAdjustmentInput) {
    if (input.correctsId) {
      const original = await this.prisma.advanceAdjustment.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `AdvanceAdjustment ${input.correctsId} does not exist`,
        );
      }
      // A correction must stay tied to the same Advance as the
      // AdvanceAdjustment it corrects, or its amount delta would apply
      // to the wrong Team Member's Outstanding Balance.
      if (original.advanceId !== input.advanceId) {
        throw new BadRequestException(
          "A correction's Advance must match the AdvanceAdjustment it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // advanceId is required for audit traceability, but the cap check
        // and decrement below are always against the Team-Member-pooled
        // TeamMember.outstandingAdvanceBalance, never a per-Advance
        // remainder (Story 7.1's Dev Notes).
        const advance = await tx.advance.findUniqueOrThrow({
          where: { id: input.advanceId },
        });

        await decrementOutstandingBalanceWithFloorCheck(
          tx,
          advance.teamMemberId,
          input.amount,
        );

        return tx.advanceAdjustment.create({ data: input });
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 13.3 (FR-44): the Labour Reports view reuses this same Adjustment
  // history, optionally narrowed by Team Member (via the parent Advance) and a
  // date window (on `adjustedAt`). Unfiltered (the default `{}`) the query is
  // unchanged, so the Advance Ledger is byte-identical.
  list(filters: LabourReportFilters = {}) {
    const where: Prisma.AdvanceAdjustmentWhereInput = {};
    if (filters.teamMemberId) {
      where.advance = { teamMemberId: filters.teamMemberId };
    }
    where.adjustedAt = dateRangeBounds(filters.from, filters.to);
    return this.prisma.advanceAdjustment.findMany({
      where,
      include: { advance: { include: { teamMember: true } }, payment: true },
      orderBy: { adjustedAt: 'desc' },
    });
  }

  // The correction form (apps/web) needs the original AdvanceAdjustment's
  // fields to pre-fill from — same precedent as AdvancesService.findOne.
  async findOne(id: string) {
    const advanceAdjustment = await this.prisma.advanceAdjustment.findUnique({
      where: { id },
      include: { advance: { include: { teamMember: true } }, payment: true },
    });
    if (!advanceAdjustment) {
      throw new NotFoundException(`AdvanceAdjustment ${id} not found`);
    }
    return advanceAdjustment;
  }

  // An advanceId/paymentId that doesn't exist must be a clean 400, not a
  // raw 500 — P2025 comes from this method's own findUniqueOrThrow, P2003
  // from a foreign-key violation on the AdvanceAdjustment insert itself,
  // same pattern as PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2003' || error.code === 'P2025')
    ) {
      return new BadRequestException(
        'This Advance Adjustment references an Advance or Payment that does not exist',
      );
    }
    return error;
  }
}
