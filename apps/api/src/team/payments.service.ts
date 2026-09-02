import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreatePaymentInput,
  LabourReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';
import { decrementOutstandingBalanceWithFloorCheck } from './outstanding-balance';

const PAYMENT_SORT_FIELDS = [
  'payPeriod',
  'basePay',
  'additionalAmount',
  'deductions',
  'netPayable',
  'status',
] as const;
type PaymentSortField = (typeof PAYMENT_SORT_FIELDS)[number];

function isPaymentSortField(
  value: string | undefined,
): value is PaymentSortField {
  return (
    Boolean(value) &&
    (PAYMENT_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

export interface PaymentsListQuery extends LabourReportFilters {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-24: Net Payable = Base Pay + Additional - Deductions - (linked
// Advance Adjustment, if any) — always computed here, never trusted from
// the request body.
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePaymentInput) {
    // The previously-linked Adjustment (if any) this correction is
    // replacing — needed so the balance is adjusted by the *delta*
    // between the old and new linked amount, not the new amount applied
    // fresh on top of an already-applied one (see the comment at its use
    // below).
    let originalLinkedAdjustment: {
      id: string;
      advanceId: string;
      amount: Prisma.Decimal;
    } | null = null;

    if (input.correctsId) {
      const original = await this.prisma.payment.findUnique({
        where: { id: input.correctsId },
        include: { advanceAdjustments: true },
      });
      if (!original) {
        throw new BadRequestException(
          `Payment ${input.correctsId} does not exist`,
        );
      }
      // A correction must stay tied to the same Team Member as the
      // Payment it corrects — the four re-entered inputs replace the
      // original's, but they must still describe the same person's pay.
      if (original.teamMemberId !== input.teamMemberId) {
        throw new BadRequestException(
          "A correction's Team Member must match the Payment it corrects",
        );
      }
      originalLinkedAdjustment = original.advanceAdjustments[0] ?? null;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const netPayable =
          input.basePay +
          input.additionalAmount -
          input.deductions -
          (input.advanceAdjustment?.amount ?? 0);

        const payment = await tx.payment.create({
          data: {
            teamMemberId: input.teamMemberId,
            basePay: input.basePay,
            additionalAmount: input.additionalAmount,
            deductions: input.deductions,
            payPeriod: input.payPeriod,
            netPayable,
            status: 'pending',
            paidAt: null,
            correctsId: input.correctsId,
            reason: input.reason,
          },
        });

        // AC #3/#4: omitting an Adjustment is valid, no warning. When this
        // Payment is itself a correction, `input.advanceAdjustment`
        // re-enters what the linked Adjustment should be going forward —
        // applying its full amount as a fresh decrement (as the pre-fix
        // code did) double-counts whatever the original Payment's own
        // linked Adjustment already took off the balance. Only the
        // *delta* between the previous linked amount and the new one is
        // ever applied to the balance; the full new amount is still what
        // gets recorded on the new AdvanceAdjustment row.
        const newAmount = input.advanceAdjustment?.amount ?? 0;
        const previousAmount = originalLinkedAdjustment?.amount.toNumber() ?? 0;
        const delta = newAmount - previousAmount;

        if (input.advanceAdjustment) {
          const advance = await tx.advance.findUniqueOrThrow({
            where: { id: input.advanceAdjustment.advanceId },
          });

          // The linked Advance must belong to the same Team Member as the
          // Payment, or its balance decrement would apply to the wrong
          // person's Outstanding Balance — same defense-in-depth check
          // every other correction-linkage in this epic already has.
          if (advance.teamMemberId !== input.teamMemberId) {
            throw new BadRequestException(
              'The linked Advance must belong to the same Team Member as the Payment',
            );
          }

          if (delta !== 0) {
            await decrementOutstandingBalanceWithFloorCheck(
              tx,
              advance.teamMemberId,
              delta,
            );
          }

          await tx.advanceAdjustment.create({
            data: {
              advanceId: input.advanceAdjustment.advanceId,
              paymentId: payment.id,
              amount: input.advanceAdjustment.amount,
              note: input.advanceAdjustment.note,
              adjustedAt: payment.createdAt,
              correctsId: originalLinkedAdjustment?.id,
              correctionReason: originalLinkedAdjustment
                ? input.reason
                : undefined,
            },
          });
        } else if (originalLinkedAdjustment) {
          // The correction drops the previously-linked Adjustment
          // entirely — give the balance back and record that reversal as
          // its own correcting row (AD-9: never a silent, row-less
          // balance change).
          await decrementOutstandingBalanceWithFloorCheck(
            tx,
            input.teamMemberId,
            -previousAmount,
          );

          await tx.advanceAdjustment.create({
            data: {
              advanceId: originalLinkedAdjustment.advanceId,
              paymentId: payment.id,
              amount: -previousAmount,
              adjustedAt: payment.createdAt,
              correctsId: originalLinkedAdjustment.id,
              correctionReason: input.reason,
            },
          });
        }

        return payment;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // AD-9/Epic 5 Story 5.2's confirmReceipt reasoning: a narrow, guarded,
  // one-directional status transition, not a correction — never routed
  // through correctsId, never reversible back to 'pending'.
  async markPaid(id: string) {
    const result = await this.prisma.payment.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'paid', paidAt: new Date() },
    });
    if (result.count === 0) {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });
      if (!payment) {
        throw new NotFoundException(`Payment ${id} not found`);
      }
      throw new ConflictException(`Payment ${id} has already been paid`);
    }
    return this.prisma.payment.findUniqueOrThrow({ where: { id } });
  }

  // The Payments list page's "Pending Payments" stat tile — a count query,
  // not a client-side filter over the full unbounded Payment list, same
  // precedent as PurchasesService.countThisMonth (Story 5.7).
  countPending() {
    return this.prisma.payment.count({ where: { status: 'pending' } });
  }

  // Story 13.3 (FR-44): the Labour Reports view reuses this same Payment
  // history, optionally narrowed by Team Member and a date window. The window
  // filters on `createdAt` (when the Payment was recorded) rather than
  // `paidAt` — `paidAt` is null until a Payment is marked paid, so a `paidAt`
  // window would silently drop still-pending Payments from the history; the
  // weekly/monthly *paid* totals (which do key off `paidAt`) come from
  // TeamMembersService.getTeamSummary, composed alongside this. Unfiltered
  // (the default `{}`) the query is unchanged, so the live Payments list is
  // byte-identical.
  list(
    query: PaymentsListQuery = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
    const where = this.reportWhere(query);
    if (query.q) {
      where.teamMember = { name: { contains: query.q, mode: 'insensitive' } };
    }
    const include = {
      teamMember: true,
      advanceAdjustments: { include: { advance: true } },
    };
    const orderBy: Prisma.PaymentOrderByWithRelationInput = isPaymentSortField(
      query.sort,
    )
      ? { [query.sort]: isSortOrder(query.order) ? query.order : 'asc' }
      : { createdAt: 'desc' };

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.payment.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.payment.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.payment.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  private reportWhere(filters: LabourReportFilters): Prisma.PaymentWhereInput {
    const where: Prisma.PaymentWhereInput = {};
    if (filters.teamMemberId) where.teamMemberId = filters.teamMemberId;
    where.createdAt = dateRangeBounds(filters.from, filters.to);
    return where;
  }

  // The correction form (apps/web) needs the original Payment's fields to
  // pre-fill from — same precedent as AdvancesService.findOne.
  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        teamMember: true,
        advanceAdjustments: { include: { advance: true } },
      },
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }

  // Story 19.2: the global Search palette's Payment coverage — Payment has
  // no text field of its own worth matching besides payPeriod, so this also
  // matches the linked Team Member's name (same relation-filter pattern
  // list()'s `q` uses above).
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.PaymentGetPayload<{ include: { teamMember: true } }>[];
    total: number;
  }> {
    const where: Prisma.PaymentWhereInput = {
      OR: [
        { teamMember: { name: { contains: q, mode: 'insensitive' as const } } },
        { payPeriod: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { teamMember: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { candidates, total };
  }

  // A teamMemberId/advanceId that doesn't exist must be a clean 400, not
  // a raw 500 — P2025 comes from this method's own findUniqueOrThrow,
  // P2003 from a foreign-key violation, same pattern as
  // AdvanceAdjustmentsService.translateWriteError. ConflictException
  // (markPaid's double-transition guard) passes through unchanged.
  private translateWriteError(error: unknown) {
    if (error instanceof ConflictException) {
      return error;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2003' || error.code === 'P2025')
    ) {
      return new BadRequestException(
        'This Payment references a Team Member or Advance that does not exist',
      );
    }
    return error;
  }
}
