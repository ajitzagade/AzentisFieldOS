import type { PrismaService } from '../prisma/prisma.service';

// spec-daily-reports-list-and-edit: the single shared chain-walk for a
// DailySiteReport's submission history, used by both the new cross-Site
// history list (DsrService.listAllSubmitted) and the existing single-report
// detail read (DsrService.findOne). Walks `correctsId` backward from the
// given (current) row to its root, the same bounded-loop shape as this
// file's sibling reasoning in dsr.service.ts's collectCorrectsIdAncestors —
// correction chains are expected to be short in practice (0-2 hops), so this
// is a deliberate small-N walk, never a recursive SQL CTE. MAX_HOPS is a
// safety valve against a corrupt/cyclic correctsId, not a real-world limit.
const MAX_HOPS = 100;

export interface SubmissionVersion {
  id: string;
  createdAt: Date;
  submittedByName: string;
  reason: string | null;
}

export interface SubmissionChain {
  /** The root/original submission's own createdAt. */
  submittedAt: Date;
  /** Every version in this report's history, oldest -> newest. */
  versions: SubmissionVersion[];
}

export interface ChainRow {
  id: string;
  createdAt: Date;
  correctsId: string | null;
  reason: string | null;
  submittedBy: { name: string };
}

// `row` is the CURRENT (tip) version — already loaded by the caller (list's
// per-page query, or findOne's own read), so no extra round-trip for it.
// Every ancestor beyond that is fetched here, one hop at a time.
export async function getSubmissionChain(
  prisma: PrismaService,
  row: ChainRow,
): Promise<SubmissionChain> {
  const versions: SubmissionVersion[] = [
    {
      id: row.id,
      createdAt: row.createdAt,
      submittedByName: row.submittedBy.name,
      reason: row.reason,
    },
  ];

  let correctsId = row.correctsId;
  let hops = 0;
  while (correctsId && hops < MAX_HOPS) {
    const ancestor = await prisma.dailySiteReport.findUnique({
      where: { id: correctsId },
      select: {
        id: true,
        createdAt: true,
        correctsId: true,
        reason: true,
        submittedBy: { select: { name: true } },
      },
    });
    if (!ancestor) break;
    versions.push({
      id: ancestor.id,
      createdAt: ancestor.createdAt,
      submittedByName: ancestor.submittedBy.name,
      reason: ancestor.reason,
    });
    correctsId = ancestor.correctsId;
    hops++;
  }

  versions.reverse(); // oldest -> newest
  return { submittedAt: versions[0]!.createdAt, versions };
}

// Review fix: findOne(id) can be asked for ANY version in a chain, not just
// the tip — a middle version has both a `correctsId` (something it corrects)
// AND something else's `correctsId` pointing back at IT (something that
// corrects it). getSubmissionChain above only ever walks backward, so
// calling it directly on a middle version silently omits every version
// newer than the one being viewed — reachable in practice by clicking an
// older "Edit N" entry from the tip's own Version History list. This walks
// FORWARD first (repeatedly finding whatever row corrects the current one)
// to resolve the true tip, then delegates to the existing backward walk from
// there — so the returned chain is always complete regardless of which
// version was loaded. Same bounded-loop safety valve as the backward walk;
// `listAllSubmitted` never needs this — its rows are always tips already by
// construction (filtered via `id: { notIn: superseded }`), so it keeps
// calling getSubmissionChain directly rather than pay for an always-empty
// forward walk.
export async function getSubmissionChainFromAnyVersion(
  prisma: PrismaService,
  row: ChainRow,
): Promise<SubmissionChain> {
  let tip = row;
  let hops = 0;
  while (hops < MAX_HOPS) {
    const newer = await prisma.dailySiteReport.findFirst({
      where: { correctsId: tip.id },
      select: {
        id: true,
        createdAt: true,
        correctsId: true,
        reason: true,
        submittedBy: { select: { name: true } },
      },
    });
    if (!newer) break;
    tip = newer;
    hops++;
  }

  return getSubmissionChain(prisma, tip);
}
