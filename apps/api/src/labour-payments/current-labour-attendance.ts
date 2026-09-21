import type { PrismaClient, Prisma } from '../generated/prisma/client';

// AD-9: a correction to a DailyLabourAttendance row is a fresh row with
// correctsId pointing at the one it corrects — the original is never
// touched. Any sum over a Labourer's attendance (a week's totalEarned) must
// skip a row that has since been superseded by its own correction, or a
// corrected day double-counts. Same shape as
// common/superseded-dsrs.ts's supersededDsrIds/currentDsrRowsWhere, applied
// to this module's own self-referential correction chain (there is no
// shared parent to key off here — a correction points directly at the
// attendance row it restates).
type Db = PrismaClient | Prisma.TransactionClient;

export async function supersededAttendanceIds(db: Db): Promise<string[]> {
  const corrections = await db.dailyLabourAttendance.findMany({
    where: { correctsId: { not: null } },
    select: { correctsId: true },
  });
  return corrections
    .map((row) => row.correctsId)
    .filter((id): id is string => id !== null);
}

export function currentAttendanceWhere(superseded: string[]): {
  id: { notIn: string[] };
} {
  return { id: { notIn: superseded } };
}
