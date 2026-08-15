import { Prisma } from '../generated/prisma/client';

// Serializes concurrent transactions that touch the same logical key by
// blocking until any earlier transaction holding it commits or rolls back
// (an xact-scoped advisory lock releases automatically then) — the
// standard Postgres pattern for closing a check-then-act race without a
// DB constraint (used where a unique constraint would block a legitimate
// second row, e.g. DailySiteReport/WorkRecord's correction chains).
// Extracted once a second call site (Story 6.2's WorkRecordsService)
// needed the exact same `workrecord:${teamMemberId}:${workDate}` lock key
// DsrService already uses — both must lock on identical key strings so a
// DSR submission and a standalone Work Record entry for the same crew
// member/date properly serialize against each other, not just against
// themselves.
export async function lockOnKey(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
}
