import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { DashboardService } from './dashboard.service';

interface Overrides {
  reportingSiteIds?: string[];
  todaysWorkingHeadcount?: number;
  purchaseCount?: number;
  consumptionCount?: number;
  rmcSum?: Prisma.Decimal | null;
  machineryCount?: number;
  expenseSum?: Prisma.Decimal | null;
  activeSites?: { id: string; name: string }[];
}

function makeService(overrides: Overrides = {}) {
  const dailySiteReportFindMany = vi
    .fn()
    .mockResolvedValue(
      (overrides.reportingSiteIds ?? []).map((siteId) => ({ siteId })),
    );
  const purchaseCount = vi.fn().mockResolvedValue(overrides.purchaseCount ?? 0);
  const consumptionCount = vi
    .fn()
    .mockResolvedValue(overrides.consumptionCount ?? 0);
  const rmcAggregate = vi.fn().mockResolvedValue({
    _sum: { quantityM3: overrides.rmcSum ?? null },
  });
  const machineryCount = vi
    .fn()
    .mockResolvedValue(overrides.machineryCount ?? 0);
  const expenseAggregate = vi.fn().mockResolvedValue({
    _sum: { amount: overrides.expenseSum ?? null },
  });
  const siteFindMany = vi.fn().mockResolvedValue(overrides.activeSites ?? []);

  const prisma = {
    dailySiteReport: { findMany: dailySiteReportFindMany },
    purchase: { count: purchaseCount },
    consumption: { count: consumptionCount },
    rmcEntry: { aggregate: rmcAggregate },
    machinery: { count: machineryCount },
    expense: { aggregate: expenseAggregate },
    site: { findMany: siteFindMany },
  };

  const getTeamSummary = vi.fn().mockResolvedValue({
    totalTeamMembers: 99,
    todaysWorkingHeadcount: overrides.todaysWorkingHeadcount ?? 0,
    weeklyPaymentTotal: 0,
    monthlyPaymentTotal: 0,
  });
  const teamMembersService = { getTeamSummary };

  const service = new DashboardService(
    prisma as unknown as ConstructorParameters<typeof DashboardService>[0],
    teamMembersService as unknown as ConstructorParameters<
      typeof DashboardService
    >[1],
  );

  return {
    service,
    dailySiteReportFindMany,
    purchaseCount,
    consumptionCount,
    machineryCount,
    getTeamSummary,
  };
}

describe('DashboardService.getToday', () => {
  it('computes every figure correctly against a multi-Site fixture', async () => {
    const { service } = makeService({
      reportingSiteIds: ['s1', 's2'],
      todaysWorkingHeadcount: 42,
      purchaseCount: 6,
      consumptionCount: 18,
      rmcSum: new Prisma.Decimal(42),
      machineryCount: 8,
      expenseSum: new Prisma.Decimal(86400),
      activeSites: [
        { id: 's1', name: 'NH-48 Widening' },
        { id: 's2', name: 'Metro Depot' },
        { id: 's3', name: 'Riverside Bridge' },
      ],
    });

    const result = await service.getToday();

    expect(result.sitesReportingToday).toBe(2);
    expect(result.labourWorkingToday).toBe(42);
    expect(result.materialsReceivedToday).toBe(6);
    expect(result.materialsConsumedToday).toBe(18);
    expect(result.rmcUsedTodayM3).toBe(42);
    expect(result.machineryInUse).toBe(8);
    expect(result.expensesToday).toBe(86400);
  });

  it('reuses TeamMembersService.getTeamSummary for labour rather than recomputing it', async () => {
    const { service, getTeamSummary } = makeService({
      todaysWorkingHeadcount: 15,
    });
    const result = await service.getToday();
    expect(getTeamSummary).toHaveBeenCalledTimes(1);
    expect(result.labourWorkingToday).toBe(15);
  });

  it('names exactly the active Sites that did not report, excluding those that did', async () => {
    const { service } = makeService({
      reportingSiteIds: ['s1'],
      activeSites: [
        { id: 's1', name: 'NH-48 Widening' },
        { id: 's2', name: 'Metro Depot' },
        { id: 's3', name: 'Riverside Bridge' },
      ],
    });

    const result = await service.getToday();

    expect(result.sitesReportingToday).toBe(1);
    expect(result.sitesMissingDsrToday).toEqual([
      { siteId: 's2', name: 'Metro Depot' },
      { siteId: 's3', name: 'Riverside Bridge' },
    ]);
  });

  it('lists every active Site as missing when no DSR was submitted today', async () => {
    const { service } = makeService({
      reportingSiteIds: [],
      activeSites: [
        { id: 's1', name: 'NH-48 Widening' },
        { id: 's2', name: 'Metro Depot' },
      ],
    });

    const result = await service.getToday();

    expect(result.sitesReportingToday).toBe(0);
    expect(result.sitesMissingDsrToday).toEqual([
      { siteId: 's1', name: 'NH-48 Widening' },
      { siteId: 's2', name: 'Metro Depot' },
    ]);
  });

  it('reports 0 (not null) for RMC and Expenses when no rows match — a zero-activity day is valid', async () => {
    const { service } = makeService({ rmcSum: null, expenseSum: null });
    const result = await service.getToday();
    expect(result.rmcUsedTodayM3).toBe(0);
    expect(result.expensesToday).toBe(0);
  });

  it('counts DISTINCT reporting Sites, not raw DSR rows', async () => {
    const { service, dailySiteReportFindMany } = makeService({
      reportingSiteIds: ['s1', 's2'],
    });
    await service.getToday();
    expect(dailySiteReportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['siteId'] }),
    );
  });

  it('filters same-day queries on the local-timezone day boundary, not naive UTC midnight', async () => {
    const { service, dailySiteReportFindMany, purchaseCount } = makeService();

    // 2026-08-26T18:45:00Z is already 2026-08-27 00:15 in IST.
    await service.getToday(
      new Date('2026-08-26T18:45:00.000Z'),
      'Asia/Kolkata',
    );

    // reportDate (a @db.Date column) is matched against the *local* date.
    expect(dailySiteReportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reportDate: new Date('2026-08-27T00:00:00.000Z') },
      }),
    );
    // DateTime columns are filtered on [IST-midnight, next-IST-midnight) in UTC.
    expect(purchaseCount).toHaveBeenCalledWith({
      where: {
        purchasedAt: {
          gte: new Date('2026-08-26T18:30:00.000Z'),
          lt: new Date('2026-08-27T18:30:00.000Z'),
        },
      },
    });
  });

  it('pins the Labour figure to the same local day as the other tiles, not naive UTC', async () => {
    const { service, getTeamSummary } = makeService({
      todaysWorkingHeadcount: 42,
    });

    // 2026-08-26T18:45:00Z is 2026-08-27 00:15 IST — the Labour tile must read
    // the 27th, in step with the other six tiles, not the UTC 26th.
    const result = await service.getToday(
      new Date('2026-08-26T18:45:00.000Z'),
      'Asia/Kolkata',
    );

    expect(getTeamSummary).toHaveBeenCalledWith({
      today: new Date('2026-08-27T00:00:00.000Z'),
    });
    expect(result.labourWorkingToday).toBe(42);
  });

  it('queries live AT_SITE machinery, not a day-scoped count', async () => {
    const { service, machineryCount } = makeService({ machineryCount: 3 });
    const result = await service.getToday();
    expect(machineryCount).toHaveBeenCalledWith({
      where: { currentStatus: 'AT_SITE' },
    });
    expect(result.machineryInUse).toBe(3);
  });
});
