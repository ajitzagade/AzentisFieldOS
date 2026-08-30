import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { FinancialReportsService } from './financial-reports.service';

// The `where` object the first call to a mocked Prisma aggregate/groupBy
// received — narrowed enough to read each table's own date-field bounds.
function firstWhere(
  fn: Mock,
): Record<string, { gte: Date; lt: Date } | undefined> {
  const call = fn.mock.calls[0];
  if (!call) throw new Error('mock was never called');
  return (
    call[0] as { where: Record<string, { gte: Date; lt: Date } | undefined> }
  ).where;
}

// A minimal Prisma.Decimal stand-in: only `.toNumber()` is exercised by the
// service (the same `?.toNumber() ?? 0` coercion the RMC/Expense stats use).
function dec(n: number) {
  return { toNumber: () => n };
}

function makeService() {
  const prisma = {
    // The superseded-DSR sweep (no corrections by default).
    dailySiteReport: { findMany: vi.fn().mockResolvedValue([]) },
    purchase: { groupBy: vi.fn().mockResolvedValue([]) },
    payment: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { netPayable: null } }),
      // The superseded-Payment sweep (no corrections by default).
      findMany: vi.fn().mockResolvedValue([]),
    },
    rmcEntry: { groupBy: vi.fn().mockResolvedValue([]) },
    machineryServiceLog: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { cost: null } }),
    },
    vehicleServiceLog: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { cost: null } }),
    },
    expense: { groupBy: vi.fn().mockResolvedValue([]) },
    wasteDisposal: { groupBy: vi.fn().mockResolvedValue([]) },
    site: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  };
  const service = new FinancialReportsService(prisma as never);
  return { service, prisma };
}

// A representative multi-Site dataset with a Godown-destined Purchase, used by
// the reconciliation + attribution tests below.
//   material: site1 100000, site2 50000, Godown (siteId null) 30000
//   labour (Payment.netPayable, Contractor-wide): 200000
//   rmc: site1 260400
//   machineryVehicle (machinery cost 15000 + vehicle cost 8000): 23000
//   expenses: site1 5000, site2 12000
function seed(prisma: ReturnType<typeof makeService>['prisma']) {
  prisma.purchase.groupBy.mockResolvedValue([
    { siteId: 'site1', _sum: { totalAmount: dec(100000) } },
    { siteId: 'site2', _sum: { totalAmount: dec(50000) } },
    { siteId: null, _sum: { totalAmount: dec(30000) } },
  ]);
  prisma.payment.aggregate.mockResolvedValue({
    _sum: { netPayable: dec(200000) },
  });
  prisma.rmcEntry.groupBy.mockResolvedValue([
    { siteId: 'site1', _sum: { totalAmount: dec(260400) } },
  ]);
  prisma.machineryServiceLog.aggregate.mockResolvedValue({
    _sum: { cost: dec(15000) },
  });
  prisma.vehicleServiceLog.aggregate.mockResolvedValue({
    _sum: { cost: dec(8000) },
  });
  prisma.expense.groupBy.mockResolvedValue([
    { siteId: 'site1', _sum: { amount: dec(5000) } },
    { siteId: 'site2', _sum: { amount: dec(12000) } },
  ]);
  prisma.wasteDisposal.groupBy.mockResolvedValue([
    { siteId: 'site1', _sum: { totalAmount: dec(9000) } },
  ]);
  prisma.site.findMany.mockResolvedValue([
    { id: 'site1', name: 'NH-48' },
    { id: 'site2', name: 'Bypass' },
  ]);
}

let ctx: ReturnType<typeof makeService>;
beforeEach(() => {
  ctx = makeService();
});

describe('FinancialReportsService.getFinancialReport (FR-46)', () => {
  it('sums every category correctly into the Contractor total', async () => {
    seed(ctx.prisma);

    const { contractorTotal } = await ctx.service.getFinancialReport({});

    expect(contractorTotal).toEqual({
      material: 180000, // 100000 + 50000 + 30000 (Godown included)
      labour: 200000,
      rmc: 260400,
      machineryVehicle: 23000, // 15000 + 8000
      expenses: 17000, // 5000 + 12000
      wasteDisposal: 9000, // site1 disposal trips
      total: 689400,
    });
  });

  it('excludes a Godown-destined Purchase from every bySite.material but includes it in contractorTotal.material', async () => {
    seed(ctx.prisma);

    const { bySite, contractorTotal } = await ctx.service.getFinancialReport(
      {},
    );

    // The Godown 30000 appears in no per-Site row...
    const perSiteMaterialSum = bySite.reduce((s, r) => s + r.material, 0);
    expect(perSiteMaterialSum).toBe(150000); // 100000 + 50000, NOT 180000
    // ...but is present in the Contractor material total.
    expect(contractorTotal.material).toBe(180000);
    // No bySite row is keyed to the Godown (there is no siteId for it).
    expect(bySite.every((r) => r.siteId !== null)).toBe(true);
  });

  it('never fabricates a per-Site labour or machineryVehicle figure — both are null in every bySite row', async () => {
    seed(ctx.prisma);

    const { bySite } = await ctx.service.getFinancialReport({});

    expect(bySite.length).toBeGreaterThan(0);
    for (const row of bySite) {
      expect(row.labour).toBeNull();
      expect(row.machineryVehicle).toBeNull();
      // A per-Site total is the sum of ONLY its genuinely Site-tagged
      // categories (material + rmc + expenses + wasteDisposal).
      expect(row.total).toBe(
        row.material + row.rmc + row.expenses + row.wasteDisposal,
      );
    }
  });

  it('reconciles exactly (AC #1): Σ bySite.total + labour + machineryVehicle + Godown material == contractorTotal.total', async () => {
    seed(ctx.prisma);

    const { bySite, contractorTotal } = await ctx.service.getFinancialReport(
      {},
    );

    const bySiteTotal = bySite.reduce((s, r) => s + r.total, 0);
    // The Contractor-only remainders the per-Site rows structurally can't hold:
    // labour, machineryVehicle, and the Godown-only slice of material.
    const godownMaterial =
      contractorTotal.material - bySite.reduce((s, r) => s + r.material, 0);
    const reconstructed =
      bySiteTotal +
      contractorTotal.labour +
      contractorTotal.machineryVehicle +
      godownMaterial;

    expect(reconstructed).toBe(contractorTotal.total);
  });

  it('builds one row per Site with a cost, joined to its name, sorted by name', async () => {
    seed(ctx.prisma);

    const { bySite } = await ctx.service.getFinancialReport({});

    expect(bySite).toEqual([
      {
        siteId: 'site2',
        name: 'Bypass',
        material: 50000,
        labour: null,
        rmc: 0,
        machineryVehicle: null,
        expenses: 12000,
        wasteDisposal: 0,
        total: 62000,
      },
      {
        siteId: 'site1',
        name: 'NH-48',
        material: 100000,
        labour: null,
        rmc: 260400,
        machineryVehicle: null,
        expenses: 5000,
        wasteDisposal: 9000,
        total: 374400,
      },
    ]);
  });

  it('threads the from/to window into each category SUM on its own business-date field', async () => {
    seed(ctx.prisma);

    await ctx.service.getFinancialReport({
      from: '2026-08-01',
      to: '2026-08-31',
    });

    // Each owning table is filtered on its own timestamp column; `to` is made
    // end-of-day-inclusive by the shared dateRangeBounds helper (gte/lt).
    const expectBounds = (bounds: { gte: Date; lt: Date } | undefined) => {
      expect(bounds).toBeDefined();
      expect(bounds!.gte).toEqual(new Date('2026-08-01'));
      expect(bounds!.lt.getTime()).toBeGreaterThan(bounds!.gte.getTime());
    };
    expectBounds(firstWhere(ctx.prisma.purchase.groupBy as Mock).purchasedAt);
    expectBounds(firstWhere(ctx.prisma.payment.aggregate as Mock).createdAt);
    expectBounds(firstWhere(ctx.prisma.rmcEntry.groupBy as Mock).deliveredAt);
    expectBounds(
      firstWhere(ctx.prisma.machineryServiceLog.aggregate as Mock).serviceDate,
    );
    expectBounds(
      firstWhere(ctx.prisma.vehicleServiceLog.aggregate as Mock).serviceDate,
    );
    expectBounds(firstWhere(ctx.prisma.expense.groupBy as Mock).incurredAt);
  });

  it('passes no date filter (undefined) when no window is given', async () => {
    seed(ctx.prisma);

    await ctx.service.getFinancialReport({});

    expect(
      firstWhere(ctx.prisma.purchase.groupBy as Mock).purchasedAt,
    ).toBeUndefined();
    expect(
      firstWhere(ctx.prisma.payment.aggregate as Mock).createdAt,
    ).toBeUndefined();
  });

  it('an empty window yields an empty bySite and an all-zero Contractor total, not an error', async () => {
    // Default mocks: every aggregate empty/null.
    const { bySite, contractorTotal } = await ctx.service.getFinancialReport(
      {},
    );

    expect(bySite).toEqual([]);
    expect(contractorTotal).toEqual({
      material: 0,
      labour: 0,
      rmc: 0,
      machineryVehicle: 0,
      expenses: 0,
      wasteDisposal: 0,
      total: 0,
    });
  });
});

describe('FinancialReportsService.getFinancialReport — correction supersedence (AD-9)', () => {
  it('filters RMC and Expense SUMs to current-DSR rows only — a corrected report must not double-count', async () => {
    seed(ctx.prisma);
    // dsr-old was corrected (a newer report's correctsId points at it) — its
    // nested RMC/Expense rows are superseded and must be excluded.
    ctx.prisma.dailySiteReport.findMany.mockResolvedValue([
      { correctsId: 'dsr-old' },
    ]);

    await ctx.service.getFinancialReport({});

    const expectedFilter = {
      OR: [
        { dailySiteReportId: null },
        { dailySiteReportId: { notIn: ['dsr-old'] } },
      ],
    };
    expect(firstWhere(ctx.prisma.rmcEntry.groupBy as Mock)).toMatchObject(
      expectedFilter,
    );
    expect(firstWhere(ctx.prisma.expense.groupBy as Mock)).toMatchObject(
      expectedFilter,
    );
    // Purchases are deliberately NOT filtered — standalone signed-delta
    // corrections are meant to be summed alongside their originals.
    expect(firstWhere(ctx.prisma.purchase.groupBy as Mock).OR).toBeUndefined();
  });

  it('excludes restated Payments from the labour SUM — a Payment correction replaces its original, chain-safe', async () => {
    seed(ctx.prisma);
    // pay-a was corrected by pay-b, which was itself corrected by pay-c:
    // only tip pay-c may be summed.
    ctx.prisma.payment.findMany.mockResolvedValue([
      { correctsId: 'pay-a' },
      { correctsId: 'pay-b' },
    ]);

    await ctx.service.getFinancialReport({});

    expect(ctx.prisma.payment.findMany).toHaveBeenCalledWith({
      where: { correctsId: { not: null } },
      select: { correctsId: true },
    });
    expect(firstWhere(ctx.prisma.payment.aggregate as Mock)).toMatchObject({
      id: { notIn: ['pay-a', 'pay-b'] },
    });
  });

  it('the zero-corrections case filters nothing away (notIn: [] / notIn: [] match everything)', async () => {
    seed(ctx.prisma);

    const { contractorTotal } = await ctx.service.getFinancialReport({});

    expect(firstWhere(ctx.prisma.payment.aggregate as Mock)).toMatchObject({
      id: { notIn: [] },
    });
    expect(firstWhere(ctx.prisma.rmcEntry.groupBy as Mock)).toMatchObject({
      OR: [{ dailySiteReportId: null }, { dailySiteReportId: { notIn: [] } }],
    });
    // The seeded totals still reconcile exactly as before the filter existed.
    expect(contractorTotal.total).toBe(689400);
  });
});

describe('FinancialReportsService.getFinancialReport — Site filter (AC #2)', () => {
  it('narrows bySite to the selected Site while contractorTotal stays Contractor-wide', async () => {
    seed(ctx.prisma);

    const { bySite, contractorTotal } = await ctx.service.getFinancialReport({
      siteId: 'site1',
    });

    expect(bySite).toEqual([
      {
        siteId: 'site1',
        name: 'NH-48',
        material: 100000,
        labour: null,
        rmc: 260400,
        machineryVehicle: null,
        expenses: 5000,
        wasteDisposal: 9000,
        total: 374400,
      },
    ]);
    // Contractor total is unchanged by the Site filter — it always spans every
    // Site plus the Site-less labour/machinery/Godown-material figures.
    expect(contractorTotal.total).toBe(689400);
    expect(contractorTotal.labour).toBe(200000);
    expect(contractorTotal.machineryVehicle).toBe(23000);
  });

  it('presents an honest zero row (0 material/rmc/expenses, null labour/machinery) for a real Site with no costs in the window', async () => {
    seed(ctx.prisma);
    // site3 exists but appears in none of the cost aggregates.
    ctx.prisma.site.findUnique.mockResolvedValue({ name: 'New Site' });

    const { bySite } = await ctx.service.getFinancialReport({
      siteId: 'site3',
    });

    expect(bySite).toEqual([
      {
        siteId: 'site3',
        name: 'New Site',
        material: 0,
        labour: null,
        rmc: 0,
        machineryVehicle: null,
        expenses: 0,
        wasteDisposal: 0,
        total: 0,
      },
    ]);
  });

  it('404s when the selected Site does not exist', async () => {
    seed(ctx.prisma);
    ctx.prisma.site.findUnique.mockResolvedValue(null);

    await expect(
      ctx.service.getFinancialReport({ siteId: 'ghost' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
