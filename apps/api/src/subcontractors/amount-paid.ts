import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

// The floor-checked materialized-amount update for SiteContract.amountPaid
// (Story 18.4, FR-59) — same shape as quantity-completed.ts's
// applyQuantityDelta, its own function rather than a shared generic (see
// this story's Dev Notes: two near-identical three-line functions guarding
// different models/floors is fine; a shared helper only pays for itself
// once a third caller needs the identical shape).
//
// Unlike Story 18.3's quantity floor, there is no CEILING here — FR-59
// explicitly allows a Payment/Advance to exceed the amount currently
// payable (an advance paid ahead of completed work). The only floor is
// zero: amountPaid can never go negative, even via a reducing correction.
export async function applyAmountPaidDelta(
  tx: Prisma.TransactionClient,
  siteContractId: string,
  delta: number,
  message = 'This correction would reduce amount paid below zero.',
): Promise<void> {
  const result = await tx.siteContract.updateMany({
    where: { id: siteContractId, amountPaid: { gte: -delta } },
    data: { amountPaid: { increment: delta } },
  });
  if (result.count === 0) {
    throw new BadRequestException({
      error: { code: 'AMOUNT_PAID_BELOW_ZERO', message },
    });
  }
}
