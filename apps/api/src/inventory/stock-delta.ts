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

// Bugfix (2026-09-23): Consumption (DSR "Materials Used" and the standalone
// Consumption form's plain-create path) draws Site Stock first, then falls
// back to Godown Stock for any shortfall — a Material sitting in the Godown
// but never explicitly Moved to the Site is genuinely available, and
// forcing a Movement first was the bug. Returns the exact split drawn so
// the caller can persist it on the Consumption row (the row's own stored
// split is the sole source of truth for reversing it later — never
// re-derive a guessed split from current balances).
//
// Both legs run inside the caller's transaction: if the Godown leg throws
// (combined insufficiency), the Site leg already applied above is rolled
// back with it, so a partial draw never persists (BadRequestException/
// INSUFFICIENT_STOCK per the Boundaries — negative stock is never
// permitted, and "insufficient" is evaluated against the combined balance,
// not either location alone).
export async function takeConsumptionStock(
  tx: Prisma.TransactionClient,
  siteId: string,
  materialSizeId: string,
  amount: number,
  insufficientMessage: string,
): Promise<{ siteStockQuantity: number; godownStockQuantity: number }> {
  if (amount <= 0) {
    return { siteStockQuantity: 0, godownStockQuantity: 0 };
  }

  const siteStock = await tx.siteStock.findUnique({
    where: { siteId_materialSizeId: { siteId, materialSizeId } },
  });
  const availableAtSite = siteStock ? siteStock.quantity.toNumber() : 0;
  const fromSite = Math.min(Math.max(availableAtSite, 0), amount);
  const fromGodown = amount - fromSite;

  if (fromSite > 0) {
    await decrementStockWithFloorCheck(
      tx,
      { model: 'siteStock', siteId, materialSizeId },
      fromSite,
      insufficientMessage,
    );
  }
  if (fromGodown > 0) {
    await decrementStockWithFloorCheck(
      tx,
      { model: 'godownStock', materialSizeId },
      fromGodown,
      insufficientMessage,
    );
  }

  return { siteStockQuantity: fromSite, godownStockQuantity: fromGodown };
}

// The exact inverse of takeConsumptionStock: gives stock back to the two
// locations a Consumption row's stored split says it was drawn from (an
// edit, a retried offline-sync upsert, or a DSR correction superseding the
// row). A plain upsert-increment, not decrementStockWithFloorCheck with a
// negative amount — same reasoning as applySiteStockDelta's give-back leg,
// a location may not have a row yet for a Consumption recorded before
// stock tracking reached this path.
export async function giveBackConsumptionStock(
  tx: Prisma.TransactionClient,
  siteId: string,
  materialSizeId: string,
  siteAmount: number,
  godownAmount: number,
): Promise<void> {
  if (siteAmount > 0) {
    await tx.siteStock.upsert({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
      update: { quantity: { increment: siteAmount } },
      create: { siteId, materialSizeId, quantity: siteAmount },
    });
  }
  if (godownAmount > 0) {
    await tx.godownStock.upsert({
      where: { materialSizeId },
      update: { quantity: { increment: godownAmount } },
      create: { materialSizeId, quantity: godownAmount },
    });
  }
}
