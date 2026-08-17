import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

// Epic 5 Story 5.2's canonical updateMany + affected-row-count floor
// check, ported to TeamMember.outstandingAdvanceBalance (Story 7.1) and
// shared by every write path that can decrement it — AdvanceAdjustmentsService
// (Story 7.2), PaymentsService's optional linked Adjustment (Story 7.3),
// and AdvancesService's own correction path (a negative-amount Advance
// correction decrements the same balance and must be floor-checked too —
// pass `-amount` since Advance's sign convention is inverted from
// AdvanceAdjustment's: positive increases the balance, not decreases it).
// `amount` may be negative (a correction giving balance back), in which
// case `gte` trivially passes and `decrement` becomes an increment — same
// no-branching behavior decrementStockWithFloorCheck relies on for stock.
export async function decrementOutstandingBalanceWithFloorCheck(
  tx: Prisma.TransactionClient,
  teamMemberId: string,
  amount: number,
  message = 'Adjustment cannot exceed the current Outstanding Balance.',
): Promise<void> {
  const result = await tx.teamMember.updateMany({
    where: { id: teamMemberId, outstandingAdvanceBalance: { gte: amount } },
    data: { outstandingAdvanceBalance: { decrement: amount } },
  });
  if (result.count === 0) {
    throw new BadRequestException({
      error: { code: 'ADJUSTMENT_EXCEEDS_BALANCE', message },
    });
  }
}
