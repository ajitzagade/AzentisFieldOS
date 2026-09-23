import type { PrismaService } from '../prisma/prisma.service';
import {
  SUBMITTED_DSR_WHERE,
  supersededDsrIds,
} from '../common/superseded-dsrs';

export interface SiteSubcontractorGap {
  count: number;
  // Deep-link targets, in the order first encountered — the web page's
  // gap-flag action links at the first one (see
  // apps/web/app/(app)/sites/[id]/page.tsx).
  subcontractorIds: string[];
}

// spec-subcontractor-dsr-gap-flag: D7-shaped gap-flag (mirrors
// SiteContractsController's count/draft-pending-terms exactly) — a
// Subcontractor named in this Site's DSR subcontractorEntries with zero
// SiteContract rows at THIS Site is otherwise invisible on Site Details →
// Subcontractors (that table is strictly keyed on SiteContract existence).
// Informational only: this never creates a Subcontractor or SiteContract —
// it only counts the gap and surfaces ids for the "formalize" deep link
// into the already-shipped /subcontractors/[id]/contracts/new flow.
//
// A Subcontractor with a SiteContract at a DIFFERENT Site still counts as a
// gap here — the lookup below is scoped to `siteId`, not global.
export async function getSiteSubcontractorGap(
  prisma: PrismaService,
  siteId: string,
): Promise<SiteSubcontractorGap> {
  // Same "current version only" rule as dsr.service.ts's listByDate/
  // listBySiteInRange: a corrected-over DSR's subcontractorEntries must not
  // contribute to the gap (its correction row restates them, if still
  // present).
  const superseded = await supersededDsrIds(prisma);

  const reports = await prisma.dailySiteReport.findMany({
    where: {
      siteId,
      ...SUBMITTED_DSR_WHERE,
      id: { notIn: superseded },
    },
    select: { subcontractorEntries: true },
  });

  // subcontractorEntries is plain denormalized JSON (goal 5's reasoning,
  // schema.prisma) — read defensively rather than trusting its shape.
  const loggedIds = new Set<string>();
  for (const report of reports) {
    const entries = Array.isArray(report.subcontractorEntries)
      ? (report.subcontractorEntries as { subcontractorId?: unknown }[])
      : [];
    for (const entry of entries) {
      if (typeof entry?.subcontractorId === 'string' && entry.subcontractorId) {
        loggedIds.add(entry.subcontractorId);
      }
    }
  }

  if (loggedIds.size === 0) {
    return { count: 0, subcontractorIds: [] };
  }

  const contracted = await prisma.siteContract.findMany({
    where: { siteId, subcontractorId: { in: Array.from(loggedIds) } },
    select: { subcontractorId: true },
  });
  const contractedIds = new Set(contracted.map((c) => c.subcontractorId));

  const gapIds = Array.from(loggedIds).filter((id) => !contractedIds.has(id));

  return { count: gapIds.length, subcontractorIds: gapIds };
}
