import {
  DsrStatus,
  Prisma,
  type PrismaClient,
} from '../generated/prisma/client';

// spec-dsr-drafts: a DRAFT DailySiteReport is private and unmaterialised — it
// must never appear in any submitted-report read path (the Dashboard "Sites
// Reporting" count, /daily-activity, the site photo gallery, the compiled
// Daily Report, search). Every *direct* DailySiteReport read spreads this
// fragment so the DRAFT/SUBMITTED gate lives in exactly one place, mirroring
// how supersededDsrIds() below centralises the corrected-over exclusion.
//
// The DSR-nested ledger tables (Consumption/Expense/RmcEntry/WorkRecord) need
// no equivalent draft filter: a draft materialises NO such rows (they live as
// draftContent JSON until Finalize), so currentDsrRowsWhere() already excludes
// them by construction. Photos are the one exception — the FK is non-nullable,
// so a draft's photos attach to the draft row and are filtered at the gallery
// by the parent DSR's status (see site-photo-gallery.ts).
export const SUBMITTED_DSR_WHERE = { status: DsrStatus.SUBMITTED } as const;

// A corrected Daily Site Report's nested sub-records (Consumption,
// RmcEntry, Expense, WorkRecord) stay in the database untouched (AD-9) —
// the correction inserts its own fresh, restated rows alongside them
// (Story 3.5). Any aggregate or list that sums/counts those tables must
// therefore skip rows whose parent DSR has been superseded, or every
// corrected report double-counts. The daily report compiler already reads
// through the "current version" of each DSR; this helper extends that
// same rule to the direct table consumers.
//
// A row with no parent DSR (dailySiteReportId null — a standalone
// transaction) is never superseded by this mechanism; standalone
// corrections use signed-delta rows that are *meant* to be summed
// alongside their originals.
type Db = PrismaClient | Prisma.TransactionClient;

export async function supersededDsrIds(db: Db): Promise<string[]> {
  const corrections = await db.dailySiteReport.findMany({
    where: { correctsId: { not: null } },
    select: { correctsId: true },
  });
  return corrections
    .map((row) => row.correctsId)
    .filter((id): id is string => id !== null);
}

// Where-clause fragment: keep standalone rows and rows whose parent DSR
// is still the current version. Spread into an AND with the caller's own
// filters. `notIn: []` matches everything, so the zero-corrections case
// needs no special path.
export function currentDsrRowsWhere(superseded: string[]): {
  OR: [{ dailySiteReportId: null }, { dailySiteReportId: { notIn: string[] } }];
} {
  return {
    OR: [
      { dailySiteReportId: null },
      { dailySiteReportId: { notIn: superseded } },
    ],
  };
}
