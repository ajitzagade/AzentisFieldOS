import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

type StockTarget =
  | { model: 'godownStock'; materialSizeId: string }
  | { model: 'siteStock'; siteId: string; materialSizeId: string };

// Story 5.2's canonical stock-safety floor check, extracted once a third
// call site (Story 5.5) needed it: GodownStock (5.2), SiteStock-as-source
// (5.4), SiteStock-as-consumer (5.5). A typed update() can't add a
// `quantity: { gte }` filter alongside its unique `where`, so updateMany()
// + its affected-row count is the race-safe way to enforce a non-negative
// floor without a separate read-then-write (which would have a race
// window under concurrent writers against the same balance). `quantity`
// may be negative — a correction's signed delta giving stock back — in
// which case `gte` trivially passes and `decrement` becomes an increment.
export async function decrementStockWithFloorCheck(
  tx: Prisma.TransactionClient,
  target: StockTarget,
  quantity: number,
  insufficientMessage: string,
): Promise<void> {
  const result =
    target.model === 'godownStock'
      ? await tx.godownStock.updateMany({
          where: {
            materialSizeId: target.materialSizeId,
            quantity: { gte: quantity },
          },
          data: { quantity: { decrement: quantity } },
        })
      : await tx.siteStock.updateMany({
          where: {
            siteId: target.siteId,
            materialSizeId: target.materialSizeId,
            quantity: { gte: quantity },
          },
          data: { quantity: { decrement: quantity } },
        });

  if (result.count === 0) {
    throw new BadRequestException({
      error: { code: 'INSUFFICIENT_STOCK', message: insufficientMessage },
    });
  }
}

// Signed Site Stock adjustment for the DSR write paths: a positive delta
// consumes stock (race-safe floor check above), a negative delta gives
// stock back. The give-back is an upsert, not decrementStockWithFloorCheck
// with a negative quantity — that variant requires a SiteStock row to
// already exist, and a DSR recorded before stock tracking reached this
// path may reference a Material/Site pair that never got one.
export async function applySiteStockDelta(
  tx: Prisma.TransactionClient,
  siteId: string,
  materialSizeId: string,
  delta: number,
  insufficientMessage: string,
): Promise<void> {
  if (delta === 0) {
    return;
  }
  if (delta > 0) {
    await decrementStockWithFloorCheck(
      tx,
      { model: 'siteStock', siteId, materialSizeId },
      delta,
      insufficientMessage,
    );
    return;
  }
  await tx.siteStock.upsert({
    where: { siteId_materialSizeId: { siteId, materialSizeId } },
    update: { quantity: { increment: -delta } },
    create: { siteId, materialSizeId, quantity: -delta },
  });
}
