import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

// Same canonical updateMany + affected-row-count floor check as
// apps/api/src/team/outstanding-balance.ts, ported to
// DailyLabourer.outstandingAdvanceBalance. `amount` may be negative (a
// correction giving balance back), in which case `gte` trivially passes and
// `decrement` becomes an increment — same no-branching behavior the Team
// version relies on.
export async function decrementDailyLabourerBalanceWithFloorCheck(
  tx: Prisma.TransactionClient,
  labourerId: string,
  amount: number,
  message = 'Adjustment cannot exceed the current Outstanding Balance.',
): Promise<void> {
  const result = await tx.dailyLabourer.updateMany({
    where: { id: labourerId, outstandingAdvanceBalance: { gte: amount } },
    data: { outstandingAdvanceBalance: { decrement: amount } },
  });
  if (result.count === 0) {
    throw new BadRequestException({
      error: { code: 'ADJUSTMENT_EXCEEDS_BALANCE', message },
    });
  }
}
