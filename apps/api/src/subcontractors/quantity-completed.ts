import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

// The floor-checked materialized-quantity update for SiteContract.
// quantityCompleted (Story 18.3, FR-58) — identical shape to
// decrementOutstandingBalanceWithFloorCheck (apps/api/src/team/outstanding-balance.ts)
// and Story 5.2's stock floor-check, adapted to this module's own model
// rather than shared, since each guards a different model and a different
// floor (see this story's Dev Notes for why a shared generic isn't worth
// the indirection yet).
//
// `delta` may be positive (a new entry) or negative (a reducing
// correction). A positive delta always passes the `gte: -delta` check
// trivially (any stored value is >= a non-positive number); a negative
// delta is the case this floor check actually guards — quantityCompleted
// must never go below zero.
export async function applyQuantityDelta(
  tx: Prisma.TransactionClient,
  siteContractId: string,
  delta: number,
  message = 'This correction would reduce completed quantity below zero.',
): Promise<void> {
  const result = await tx.siteContract.updateMany({
    where: { id: siteContractId, quantityCompleted: { gte: -delta } },
    data: { quantityCompleted: { increment: delta } },
  });
  if (result.count === 0) {
    throw new BadRequestException({
      error: { code: 'QUANTITY_BELOW_ZERO', message },
    });
  }
}
