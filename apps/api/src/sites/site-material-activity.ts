import type { PrismaService } from '../prisma/prisma.service';

// Client-readiness gap fix (2026-09-21): Purchase and Movement have no
// relation to DailySiteReport at all — the DSR form never had a "materials
// received" concept — and Consumption/RmcEntry/WasteDisposal's own nullable
// dailySiteReportId is only ever populated by DSR-form materialization, never
// by their standalone entry forms. This helper live-queries exactly the rows
// a DSR's own Site+date is missing, structured (not the generic activity-feed
// summary strings) so both the on-screen report and the compiled/emailed
// report can merge them into their real Materials sections instead of a
// generic side "Other activity" list. ReturnWastage has no dailySiteReportId
// field at all, so every row for the Site+date is inherently standalone.

export interface MaterialRow {
  id: string;
  occurredAt: string;
  materialName: string;
  sizeLabel: string;
  unitName: string;
  quantity: number;
  amount: number | null;
  summary: string;
}

export interface MaterialsReceivedRow extends MaterialRow {
  source: 'PURCHASE' | 'MOVEMENT';
}

export interface WastageReturnRow extends MaterialRow {
  kind: 'WASTAGE' | 'RETURN';
}

export interface StandaloneRmcRow {
  id: string;
  occurredAt: string;
  vendorName: string;
  grade: string;
  quantityM3: number;
  totalAmount: number | null;
}

export interface StandaloneWasteRow {
  id: string;
  occurredAt: string;
  wasteType: string;
  tripCount: number;
  vendorName: string | null;
  totalAmount: number | null;
}

export interface SiteMaterialActivity {
  materialsReceived: MaterialsReceivedRow[];
  standaloneConsumptions: MaterialRow[];
  standaloneRmcEntries: StandaloneRmcRow[];
  standaloneWasteDisposals: StandaloneWasteRow[];
  standaloneWastageReturns: WastageReturnRow[];
}

function dayBounds(date: Date): { gte: Date; lt: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { gte: start, lt: end };
}

function toNum(value: unknown): number {
  if (value == null) return 0;
  const maybeDecimal = value as { toNumber?: () => number };
  return typeof maybeDecimal.toNumber === 'function'
    ? maybeDecimal.toNumber()
    : Number(value);
}

function toNumOrNull(value: unknown): number | null {
  if (value == null) return null;
  return toNum(value);
}

// Every Purchase/Movement/standalone Consumption/RmcEntry/WasteDisposal/
// ReturnWastage touching this Site on this calendar date — the exact set a
// DSR for that Site+date currently has no way to see. Consumption/RmcEntry/
// WasteDisposal are filtered to dailySiteReportId: null (the DSR's own
// materialized rows are already fetched separately by the caller); Purchase/
// Movement/ReturnWastage have no such column, so every row for the Site+date
// qualifies.
export async function getSiteMaterialActivity(
  prisma: PrismaService,
  siteId: string,
  date: Date,
): Promise<SiteMaterialActivity> {
  const bounds = dayBounds(date);

  const [
    purchases,
    movements,
    consumptions,
    rmcEntries,
    wasteDisposals,
    returnWastages,
  ] = await Promise.all([
    prisma.purchase.findMany({
      where: { siteId, purchasedAt: bounds },
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
        vendor: true,
      },
    }),
    prisma.movement.findMany({
      where: {
        OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }],
        movedAt: bounds,
      },
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
        sourceSite: true,
        destinationSite: true,
      },
    }),
    prisma.consumption.findMany({
      where: { siteId, consumedAt: bounds, dailySiteReportId: null },
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    }),
    prisma.rmcEntry.findMany({
      where: { siteId, deliveredAt: bounds, dailySiteReportId: null },
      include: { vendor: true },
    }),
    prisma.wasteDisposal.findMany({
      where: { siteId, disposedAt: bounds, dailySiteReportId: null },
      include: { vendor: true },
    }),
    prisma.returnWastage.findMany({
      where: { siteId, recordedAt: bounds },
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    }),
  ]);

  const materialsReceived: MaterialsReceivedRow[] = [
    ...purchases.map((p): MaterialsReceivedRow => ({
      id: p.id,
      occurredAt: p.purchasedAt.toISOString(),
      materialName: p.materialSize.material.name,
      sizeLabel: p.materialSize.label,
      unitName: p.materialSize.material.unit.name,
      quantity: toNum(p.quantity),
      amount: toNumOrNull(p.totalAmount),
      summary: `from ${p.vendor.name}`,
      source: 'PURCHASE',
    })),
    ...movements.map((m): MaterialsReceivedRow => ({
      id: m.id,
      occurredAt: m.movedAt.toISOString(),
      materialName: m.materialSize.material.name,
      sizeLabel: m.materialSize.label,
      unitName: m.materialSize.material.unit.name,
      quantity: toNum(m.sentQuantity),
      amount: null,
      summary: `${m.sourceSite?.name ?? 'Godown'} → ${m.destinationSite.name}`,
      source: 'MOVEMENT',
    })),
  ];

  const standaloneConsumptions: MaterialRow[] = consumptions.map((c) => ({
    id: c.id,
    occurredAt: c.consumedAt.toISOString(),
    materialName: c.materialSize.material.name,
    sizeLabel: c.materialSize.label,
    unitName: c.materialSize.material.unit.name,
    quantity: toNum(c.quantity),
    amount: null,
    summary: 'consumed on site',
  }));

  const standaloneRmcEntries: StandaloneRmcRow[] = rmcEntries.map((r) => ({
    id: r.id,
    occurredAt: r.deliveredAt.toISOString(),
    vendorName: r.vendor.name,
    grade: r.grade,
    quantityM3: toNum(r.quantityM3),
    totalAmount: toNumOrNull(r.totalAmount),
  }));

  const standaloneWasteDisposals: StandaloneWasteRow[] = wasteDisposals.map(
    (w) => ({
      id: w.id,
      occurredAt: w.disposedAt.toISOString(),
      wasteType: w.wasteType,
      tripCount: w.tripCount,
      vendorName: w.vendor?.name ?? null,
      totalAmount: toNumOrNull(w.totalAmount),
    }),
  );

  const standaloneWastageReturns: WastageReturnRow[] = returnWastages.map(
    (r) => ({
      id: r.id,
      occurredAt: r.recordedAt.toISOString(),
      materialName: r.materialSize.material.name,
      sizeLabel: r.materialSize.label,
      unitName: r.materialSize.material.unit.name,
      quantity: toNum(r.quantity),
      amount: null,
      summary: r.kind === 'WASTAGE' ? 'wastage' : 'returned',
      kind: r.kind,
    }),
  );

  return {
    materialsReceived,
    standaloneConsumptions,
    standaloneRmcEntries,
    standaloneWasteDisposals,
    standaloneWastageReturns,
  };
}
