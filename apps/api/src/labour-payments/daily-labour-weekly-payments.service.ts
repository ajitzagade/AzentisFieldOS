import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateDailyLabourWeeklyPaymentInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  currentAttendanceWhere,
  supersededAttendanceIds,
} from './current-labour-attendance';
import { decrementDailyLabourerBalanceWithFloorCheck } from './daily-labour-outstanding-balance';

function toNum(value: unknown): number {
  if (value == null) return 0;
  const maybeDecimal = value as { toNumber?: () => number };
  return typeof maybeDecimal.toNumber === 'function'
    ? maybeDecimal.toNumber()
    : Number(value);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

// FR-24-equivalent for this module: Total Earned is always server-computed
// from that week's current (non-superseded) attended DailyLabourAttendance
// rows — deliberately absent from the request body so it can never be
// trusted from the client, same reasoning as Payment.netPayable.
@Injectable()
export class DailyLabourWeeklyPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDailyLabourWeeklyPaymentInput) {
    let originalLinkedAdjustment: {
      id: string;
      advanceId: string;
      amount: Prisma.Decimal;
    } | null = null;

    const weekStartDate = new Date(input.weekStartDate);
    const weekEndDate = addDays(weekStartDate, 6);

    if (input.correctsId) {
      const original = await this.prisma.dailyLabourWeeklyPayment.findUnique({
        where: { id: input.correctsId },
        include: { advanceAdjustments: true },
      });
      if (!original) {
        throw new BadRequestException(
          `Weekly Payment ${input.correctsId} does not exist`,
        );
      }
      if (original.labourerId !== input.labourerId) {
        throw new BadRequestException(
          "A correction's Labourer must match the Weekly Payment it corrects",
        );
      }
      if (original.weekStartDate.getTime() !== weekStartDate.getTime()) {
        throw new BadRequestException(
          'A correction must restate the same week it corrects',
        );
      }
      originalLinkedAdjustment = original.advanceAdjustments[0] ?? null;
    }

    const superseded = await supersededAttendanceIds(this.prisma);
    const weekAttendance = await this.prisma.dailyLabourAttendance.findMany({
      where: {
        labourerId: input.labourerId,
        attended: true,
        workDate: { gte: weekStartDate, lte: weekEndDate },
        ...currentAttendanceWhere(superseded),
      },
    });
    const totalEarned = weekAttendance.reduce(
      (sum, row) => sum + toNum(row.perDayAmount),
      0,
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        const payment = await tx.dailyLabourWeeklyPayment.create({
          data: {
            labourerId: input.labourerId,
            weekStartDate,
            weekEndDate,
            totalEarned,
            amountPaid: input.amountPaid,
            status: input.status,
            paidAt:
              input.status === 'UNPAID'
                ? null
                : input.paidAt
                  ? new Date(input.paidAt)
                  : new Date(),
            correctsId: input.correctsId,
            correctionReason: input.reason,
          },
        });

        // Only the *delta* between the previous linked amount and the new
        // one is ever applied to the balance — same reasoning
        // team/payments.service.ts's create() gives for why a correction
        // re-entering the same adjustment must not double-decrement.
        const newAmount = input.advanceAdjustment?.amount ?? 0;
        const previousAmount = originalLinkedAdjustment?.amount.toNumber() ?? 0;
        const delta = newAmount - previousAmount;

        if (input.advanceAdjustment) {
          const advance = await tx.dailyLabourAdvance.findUniqueOrThrow({
            where: { id: input.advanceAdjustment.advanceId },
          });
          if (advance.labourerId !== input.labourerId) {
            throw new BadRequestException(
              'The linked Advance must belong to the same Labourer as the Weekly Payment',
            );
          }

          if (delta !== 0) {
            await decrementDailyLabourerBalanceWithFloorCheck(
              tx,
              advance.labourerId,
              delta,
            );
          }

          await tx.dailyLabourAdvanceAdjustment.create({
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
          // The correction drops the previously-linked Adjustment entirely
          // — give the balance back and record that reversal as its own
          // correcting row (AD-9: never a silent, row-less balance change).
          await decrementDailyLabourerBalanceWithFloorCheck(
            tx,
            input.labourerId,
            -previousAmount,
          );

          await tx.dailyLabourAdvanceAdjustment.create({
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

  // The Labourer detail page's ledger history — Total Earned → Advance
  // Taken → Advance Adjusted → Amount Paid → Remaining Balance, newest week
  // first. Superseded (corrected-over) weeks are excluded, same reasoning
  // as everywhere else in this module.
  async listForLabourer(labourerId: string) {
    const rows = await this.prisma.dailyLabourWeeklyPayment.findMany({
      where: { labourerId },
      include: { advanceAdjustments: true },
      orderBy: { weekStartDate: 'desc' },
    });
    const correctedIds = new Set(
      rows.map((r) => r.correctsId).filter((x): x is string => x !== null),
    );
    return rows.filter((r) => !correctedIds.has(r.id));
  }

  async findOne(id: string) {
    const payment = await this.prisma.dailyLabourWeeklyPayment.findUnique({
      where: { id },
      include: {
        labourer: true,
        advanceAdjustments: { include: { advance: true } },
      },
    });
    if (!payment) {
      throw new NotFoundException(`Weekly Payment ${id} not found`);
    }
    return payment;
  }

  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2003' || error.code === 'P2025')
    ) {
      return new BadRequestException(
        'This Weekly Payment references a Labourer or Advance that does not exist',
      );
    }
    return error;
  }
}
