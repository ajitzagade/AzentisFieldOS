import type { FeedItem, ReportDateRange } from '@azentisfieldos/shared';
import { dateRangeBounds } from '../common/date-range';
import type { PrismaService } from '../prisma/prisma.service';

// Ten separate findMany calls per page load, merged and sorted in
// application code — Prisma has no single query that unions across these
// distinct models, and a raw-SQL UNION isn't worth it at the data volumes
// a single Site realistically accumulates pre-launch. Each result maps to
// FeedItem using the model's own business-date field (occurredAt), never
// createdAt — they can legitimately differ (e.g. a Purchase entered today
// for a delivery received yesterday).
//
// Story 13.2 (FR-42): the optional `range` narrows the feed to a report
// window. Each model's own business-date field is filtered by the same
// inclusive [from, to] bounds — an undefined `bounds` is passed straight
// through and read by Prisma as "no constraint", so the unfiltered Site
// detail feed (Story 2.3) behaves exactly as before.
export async function getSiteActivityFeed(
  prisma: PrismaService,
  siteId: string,
  range: ReportDateRange = {},
): Promise<FeedItem[]> {
  const bounds = dateRangeBounds(range.from, range.to);
  const [
    purchases,
    movements,
    consumptions,
    returnWastages,
    workRecords,
    expenses,
    rmcEntries,
    dsrs,
    machineryMoves,
    vehicleMoves,
  ] = await Promise.all([
    prisma.purchase.findMany({
      where: { siteId, purchasedAt: bounds },
      include: { materialSize: { include: { material: true } }, vendor: true },
    }),
    prisma.movement.findMany({
      where: {
        OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }],
        movedAt: bounds,
      },
      include: {
        materialSize: { include: { material: true } },
        sourceSite: true,
        destinationSite: true,
      },
    }),
    prisma.consumption.findMany({
      where: { siteId, consumedAt: bounds },
      include: { materialSize: { include: { material: true } } },
    }),
    prisma.returnWastage.findMany({
      where: { siteId, recordedAt: bounds },
      include: { materialSize: { include: { material: true } } },
    }),
    prisma.workRecord.findMany({
      where: { siteId, workDate: bounds },
      include: { teamMember: true },
    }),
    prisma.expense.findMany({
      where: { siteId, incurredAt: bounds },
      include: { category: true },
    }),
    prisma.rmcEntry.findMany({
      where: { siteId, deliveredAt: bounds },
      include: { vendor: true },
    }),
    prisma.dailySiteReport.findMany({
      where: { siteId, reportDate: bounds },
      include: { submittedBy: true, photos: true },
    }),
    prisma.machineryMovementLog.findMany({
      where: { siteId, movedAt: bounds },
      include: { machinery: true },
    }),
    prisma.vehicleMovementLog.findMany({
      where: { siteId, movedAt: bounds },
      include: { vehicle: { include: { type: true } } },
    }),
  ]);

  const items: FeedItem[] = [
    ...purchases.map((p): FeedItem => ({
      id: p.id,
      type: 'PURCHASE',
      occurredAt: p.purchasedAt.toISOString(),
      summary: `${p.materialSize.material.name} (${p.materialSize.label}), ${p.quantity.toString()} — from ${p.vendor.name}`,
      amount: p.totalAmount.toNumber(),
    })),
    ...movements.map((m): FeedItem => ({
      id: m.id,
      type: 'MOVEMENT',
      occurredAt: m.movedAt.toISOString(),
      summary: `${m.materialSize.material.name} (${m.materialSize.label}), ${m.sentQuantity.toString()} — ${m.sourceSite?.name ?? 'Godown'} → ${m.destinationSite.name}`,
      amount: null,
    })),
    ...consumptions.map((c): FeedItem => ({
      id: c.id,
      type: 'CONSUMPTION',
      occurredAt: c.consumedAt.toISOString(),
      summary: `${c.materialSize.material.name} (${c.materialSize.label}), ${c.quantity.toString()} consumed on site`,
      amount: null,
    })),
    ...returnWastages.map((r): FeedItem => ({
      id: r.id,
      type: 'RETURN_WASTAGE',
      occurredAt: r.recordedAt.toISOString(),
      summary: `${r.kind === 'WASTAGE' ? 'Wastage' : 'Return'}: ${r.materialSize.material.name} (${r.materialSize.label}), ${r.quantity.toString()}`,
      amount: null,
    })),
    ...workRecords.map((w): FeedItem => ({
      id: w.id,
      type: 'WORK_RECORD',
      occurredAt: w.workDate.toISOString(),
      summary: `${w.teamMember.name} — ${w.attended ? 'present' : 'absent'}${w.hours ? `, ${w.hours.toString()} hrs` : ''}`,
      amount: null,
    })),
    ...expenses.map((e): FeedItem => ({
      id: e.id,
      type: 'EXPENSE',
      occurredAt: e.incurredAt.toISOString(),
      summary: e.description ?? `${e.category.name} expense`,
      amount: e.amount.toNumber(),
    })),
    ...rmcEntries.map((r): FeedItem => ({
      id: r.id,
      type: 'RMC',
      occurredAt: r.deliveredAt.toISOString(),
      summary: `RMC delivery, ${r.quantityM3.toString()} m³ (${r.grade}) — ${r.vendor.name}`,
      amount: r.totalAmount.toNumber(),
    })),
    ...dsrs.map((d): FeedItem => ({
      id: d.id,
      type: 'DSR',
      occurredAt: d.reportDate.toISOString(),
      summary:
        (d.workCompleted
          ? `Daily Site Report — ${d.workCompleted}`
          : 'Daily Site Report submitted') +
        ` (${d.submittedBy.name})` +
        (d.photos.length > 0
          ? ` · ${d.photos.length} photo${d.photos.length === 1 ? '' : 's'}`
          : ''),
      amount: null,
    })),
    ...machineryMoves.map((m): FeedItem => ({
      id: m.id,
      type: 'MACHINERY_MOVEMENT',
      occurredAt: m.movedAt.toISOString(),
      summary: `${m.machinery.name} (${m.machinery.assetNumber}) — ${m.toStatus.replace('_', ' ').toLowerCase()}`,
      amount: null,
    })),
    ...vehicleMoves.map((v): FeedItem => ({
      id: v.id,
      type: 'VEHICLE_MOVEMENT',
      occurredAt: v.movedAt.toISOString(),
      summary: `${v.vehicle.type.name} ${v.vehicle.number} — ${v.toStatus.replace('_', ' ').toLowerCase()}`,
      amount: null,
    })),
  ];

  return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
