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
  // Story 12.2 overrides — each stands in for the owning service's method.
  sitesList?: { id: string; name: string; location: string; status: string }[];
  activeSitesList?: { id: string; name: string }[];
  lowStockMaterials?: unknown[];
  outstandingAdvances?: {
    total: number;
    byTeamMember: { teamMemberId: string; name: string }[];
  };
  pendingCount?: number;
  // Command Center (2026-09-08) overrides.
  supersededIds?: string[];
  breakdownDsrRows?: { siteId: string; createdAt: Date }[];
  workRows?: { siteId: string; teamMemberId: string }[];
  purchaseGroups?: { siteId: string | null; _count: { _all: number } }[];
  consumptionGroups?: { siteId: string; _count: { _all: number } }[];
  expenseGroups?: { siteId: string; _sum: { amount: Prisma.Decimal | null } }[];
  trendDsrRows?: { siteId: string; reportDate: Date }[];
  trendWorkRows?: { teamMemberId: string; workDate: Date }[];
  trendExpenseRows?: { amount: Prisma.Decimal; incurredAt: Date }[];
}

function makeService(overrides: Overrides = {}) {
  // One mock serves four distinct call shapes: supersededDsrIds()'s
  // correctsId scan, getToday's distinct-siteId reporting query,
  // getSiteBreakdown's siteId+createdAt select, and getTrends's
  // (siteId, reportDate) distinct — dispatched on the arguments.
  const dailySiteReportFindMany = vi.fn(
    (args?: {
      where?: { correctsId?: unknown };
      select?: { createdAt?: boolean };
      distinct?: string[];
    }) => {
      if (args?.where?.correctsId) {
        return Promise.resolve(
          (overrides.supersededIds ?? []).map((correctsId) => ({
            correctsId,
          })),
        );
      }
      if (args?.select?.createdAt) {
        return Promise.resolve(overrides.breakdownDsrRows ?? []);
      }
      if (args?.distinct?.includes('reportDate')) {
        return Promise.resolve(overrides.trendDsrRows ?? []);
      }
      return Promise.resolve(
        (overrides.reportingSiteIds ?? []).map((siteId) => ({ siteId })),
      );
    },
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
  // getSiteBreakdown selects (siteId, teamMemberId); getTrends selects
  // (teamMemberId, workDate).
  const workRecordFindMany = vi.fn((args?: { select?: { siteId?: boolean } }) =>
    Promise.resolve(
      args?.select?.siteId
        ? (overrides.workRows ?? [])
        : (overrides.trendWorkRows ?? []),
    ),
  );
  const purchaseGroupBy = vi
    .fn()
    .mockResolvedValue(overrides.purchaseGroups ?? []);
  const consumptionGroupBy = vi
    .fn()
    .mockResolvedValue(overrides.consumptionGroups ?? []);
  const expenseGroupBy = vi
    .fn()
    .mockResolvedValue(overrides.expenseGroups ?? []);
  const expenseFindMany = vi
    .fn()
    .mockResolvedValue(overrides.trendExpenseRows ?? []);

  const prisma = {
    dailySiteReport: { findMany: dailySiteReportFindMany },
    purchase: { count: purchaseCount, groupBy: purchaseGroupBy },
    consumption: { count: consumptionCount, groupBy: consumptionGroupBy },
    rmcEntry: { aggregate: rmcAggregate },
    machinery: { count: machineryCount },
    expense: {
      aggregate: expenseAggregate,
      groupBy: expenseGroupBy,
      findMany: expenseFindMany,
    },
    site: { findMany: siteFindMany },
    workRecord: { findMany: workRecordFindMany },
  };

  const getTeamSummary = vi.fn().mockResolvedValue({
    totalTeamMembers: 99,
    todaysWorkingHeadcount: overrides.todaysWorkingHeadcount ?? 0,
    weeklyPaymentTotal: 0,
    monthlyPaymentTotal: 0,
  });
  const getOutstandingAdvances = vi
    .fn()
    .mockResolvedValue(
      overrides.outstandingAdvances ?? { total: 0, byTeamMember: [] },
    );
  const teamMembersService = { getTeamSummary, getOutstandingAdvances };

  // SitesService.list(query?) — returns the ACTIVE-filtered subset when
  // called with { status: 'ACTIVE' } (getOverall), the full list otherwise
  // (sites preview).
  const sitesList = vi.fn((query?: { status?: string }) =>
    Promise.resolve(
      query?.status === 'ACTIVE'
        ? (overrides.activeSitesList ?? [])
        : (overrides.sitesList ?? []),
    ),
  );
  const sitesService = { list: sitesList };

  const getLowStockMaterials = vi
    .fn()
    .mockResolvedValue(overrides.lowStockMaterials ?? []);
  const stockService = { getLowStockMaterials };

  const countPending = vi.fn().mockResolvedValue(overrides.pendingCount ?? 0);
  const paymentsService = { countPending };

  const service = new DashboardService(
    prisma as unknown as ConstructorParameters<typeof DashboardService>[0],
    teamMembersService as unknown as ConstructorParameters<
      typeof DashboardService
    >[1],
    sitesService as unknown as ConstructorParameters<
      typeof DashboardService
    >[2],
    stockService as unknown as ConstructorParameters<
      typeof DashboardService
    >[3],
    paymentsService as unknown as ConstructorParameters<
      typeof DashboardService
    >[4],
  );

  return {
    service,
    dailySiteReportFindMany,
    purchaseCount,
    consumptionCount,
    machineryCount,
    getTeamSummary,
    sitesList,
    getLowStockMaterials,
    getOutstandingAdvances,
    countPending,
    siteFindMany,
    workRecordFindMany,
    purchaseGroupBy,
    consumptionGroupBy,
    expenseGroupBy,
    expenseFindMany,
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

describe('DashboardService.getOverall', () => {
  it('composes every figure from its owning service (AC #2), not a re-query', async () => {
    const {
      service,
      sitesList,
      getLowStockMaterials,
      getOutstandingAdvances,
      countPending,
      siteFindMany,
    } = makeService({
      activeSitesList: [
        { id: 's1', name: 'NH-48 Widening' },
        { id: 's2', name: 'Metro Depot' },
      ],
      lowStockMaterials: [{}, {}, {}],
      outstandingAdvances: {
        total: 314200,
        byTeamMember: [
          { teamMemberId: 't1', name: 'A' },
          { teamMemberId: 't2', name: 'B' },
          { teamMemberId: 't3', name: 'C' },
        ],
      },
      pendingCount: 4,
    });

    const result = await service.getOverall();

    expect(result).toEqual({
      activeSites: { count: 2, names: ['NH-48 Widening', 'Metro Depot'] },
      inventory: { lowStockCount: 3 },
      outstandingAdvances: { total: 314200, teamMemberCount: 3 },
      pendingPayments: { count: 4 },
    });

    // Active Sites come through SitesService.list({ status: 'ACTIVE' }),
    // never a direct `Site` query from DashboardService.
    expect(sitesList).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(siteFindMany).not.toHaveBeenCalled();
    // Low-stock reuses Story 5.7's service method.
    expect(getLowStockMaterials).toHaveBeenCalledTimes(1);
    // Advances reuse Story 7.4's response as-is.
    expect(getOutstandingAdvances).toHaveBeenCalledTimes(1);
    // Pending count comes from the new PaymentsService method (Story 7.3).
    expect(countPending).toHaveBeenCalledTimes(1);
  });

  it('reports an empty, zeroed rollup for a Tenant with no data — valid, not an error', async () => {
    const { service } = makeService();
    const result = await service.getOverall();
    expect(result).toEqual({
      activeSites: { count: 0, names: [] },
      inventory: { lowStockCount: 0 },
      outstandingAdvances: { total: 0, teamMemberCount: 0 },
      pendingPayments: { count: 0 },
    });
  });
});

describe('DashboardService.getSitesPreview', () => {
  it('reuses SitesService.list() (unfiltered, newest-first) rather than a new query shape', async () => {
    const { service, sitesList } = makeService({
      sitesList: [
        {
          id: 's1',
          name: 'NH-48 Widening',
          location: 'Nashik',
          status: 'ACTIVE',
        },
        { id: 's2', name: 'Metro Depot', location: 'Pune', status: 'ON_HOLD' },
      ],
    });

    const result = await service.getSitesPreview();

    expect(sitesList).toHaveBeenCalledWith();
    expect(result).toEqual([
      {
        id: 's1',
        name: 'NH-48 Widening',
        location: 'Nashik',
        status: 'ACTIVE',
      },
      { id: 's2', name: 'Metro Depot', location: 'Pune', status: 'ON_HOLD' },
    ]);
  });

  it('caps the preview at six Sites, leaving the full roster to /sites', async () => {
    const sitesList = Array.from({ length: 9 }, (_, i) => ({
      id: `s${i}`,
      name: `Site ${i}`,
      location: 'Somewhere',
      status: 'ACTIVE',
    }));
    const { service } = makeService({ sitesList });
    const result = await service.getSitesPreview();
    expect(result).toHaveLength(6);
    expect(result[0]?.id).toBe('s0');
  });

  it('returns an empty preview for a Tenant with zero Sites (drives AC #1 whole-page empty state)', async () => {
    const { service } = makeService({ sitesList: [] });
    await expect(service.getSitesPreview()).resolves.toEqual([]);
  });
});

describe('DashboardService.getSiteBreakdown', () => {
  const roster = [
    { id: 's1', name: 'NH-48 Widening', location: 'Nashik', status: 'ACTIVE' },
    { id: 's2', name: 'Metro Depot', location: 'Pune', status: 'ACTIVE' },
    { id: 's3', name: 'MIDC Shed', location: 'Bhosari', status: 'ON_HOLD' },
    // Excluded from the operations view (spec amendment, review
    // 2026-09-08): completed Sites accumulate forever and would bury the
    // live rows in dashes.
    {
      id: 's4',
      name: 'Old Handover Tower',
      location: 'Wakad',
      status: 'COMPLETED',
    },
  ];

  it('buckets today per Site — report time, distinct labour, received, consumed, expenses — plus the Godown received bucket', async () => {
    const { service } = makeService({
      sitesList: roster,
      breakdownDsrRows: [
        { siteId: 's1', createdAt: new Date('2026-09-08T04:12:00.000Z') },
      ],
      workRows: [
        { siteId: 's1', teamMemberId: 't1' },
        { siteId: 's1', teamMemberId: 't2' },
        { siteId: 's2', teamMemberId: 't3' },
      ],
      purchaseGroups: [
        { siteId: 's1', _count: { _all: 2 } },
        { siteId: null, _count: { _all: 1 } },
      ],
      consumptionGroups: [{ siteId: 's1', _count: { _all: 4 } }],
      expenseGroups: [
        { siteId: 's1', _sum: { amount: new Prisma.Decimal(9880) } },
      ],
    });

    const result = await service.getSiteBreakdown();

    expect(result).toEqual({
      sites: [
        {
          id: 's1',
          name: 'NH-48 Widening',
          location: 'Nashik',
          status: 'ACTIVE',
          report: {
            submitted: true,
            submittedAt: '2026-09-08T04:12:00.000Z',
          },
          labour: 2,
          received: 2,
          consumed: 4,
          expenses: 9880,
        },
        {
          id: 's2',
          name: 'Metro Depot',
          location: 'Pune',
          status: 'ACTIVE',
          report: { submitted: false, submittedAt: null },
          labour: 1,
          received: 0,
          consumed: 0,
          expenses: 0,
        },
        {
          id: 's3',
          name: 'MIDC Shed',
          location: 'Bhosari',
          status: 'ON_HOLD',
          report: { submitted: false, submittedAt: null },
          labour: null,
          received: 0,
          consumed: 0,
          expenses: 0,
        },
      ],
      godown: { received: 1 },
    });
  });

  it('keeps the original submission time when a correction DSR lands later the same day', async () => {
    const { service } = makeService({
      sitesList: [roster[0]!],
      breakdownDsrRows: [
        // orderBy createdAt asc — the query returns oldest first; the
        // service must keep the first (original) row per Site.
        { siteId: 's1', createdAt: new Date('2026-09-08T04:12:00.000Z') },
        { siteId: 's1', createdAt: new Date('2026-09-08T09:30:00.000Z') },
      ],
    });

    const result = await service.getSiteBreakdown();
    expect(result.sites[0]?.report).toEqual({
      submitted: true,
      submittedAt: '2026-09-08T04:12:00.000Z',
    });
  });

  it('reports null labour (never a fabricated 0) for a Site with no attended Work Record today', async () => {
    const { service } = makeService({ sitesList: [roster[1]!] });
    const result = await service.getSiteBreakdown();
    expect(result.sites[0]?.labour).toBeNull();
  });

  it('excludes COMPLETED Sites but keeps ACTIVE and ON_HOLD rows', async () => {
    const { service } = makeService({ sitesList: roster });
    const result = await service.getSiteBreakdown();
    expect(result.sites.map((site) => site.id)).toEqual(['s1', 's2', 's3']);
    expect(result.sites.some((site) => site.status === 'COMPLETED')).toBe(
      false,
    );
  });

  it('counts a member attending two Sites once per Site — the global once-only figure is the band KPI, not a sum of these rows', async () => {
    const { service } = makeService({
      sitesList: roster,
      workRows: [
        // The distinct (siteId, teamMemberId) query yields one row per
        // Site for the same member.
        { siteId: 's1', teamMemberId: 't1' },
        { siteId: 's2', teamMemberId: 't1' },
      ],
    });

    const result = await service.getSiteBreakdown();

    expect(result.sites.find((site) => site.id === 's1')?.labour).toBe(1);
    expect(result.sites.find((site) => site.id === 's2')?.labour).toBe(1);
    // Summing the rows would say 2; the true distinct headcount (1) is
    // getToday's labourWorkingToday — which is why the frontend's totals
    // row takes the band figure instead of summing.
  });

  it('buckets a null-siteId Purchase into the Godown, never into any Site row', async () => {
    const { service } = makeService({
      sitesList: roster,
      purchaseGroups: [{ siteId: null, _count: { _all: 3 } }],
    });

    const result = await service.getSiteBreakdown();
    expect(result.godown.received).toBe(3);
    expect(result.sites.every((site) => site.received === 0)).toBe(true);
  });

  it('excludes superseded-DSR rows from consumed/expenses (AD-9 double-count guard)', async () => {
    const { service, consumptionGroupBy, expenseGroupBy } = makeService({
      sitesList: roster,
      supersededIds: ['dsr-old'],
    });

    // Fixed now (2026-09-08 12:00 IST) so the day window is deterministic
    // and the whole call shape can be pinned exactly.
    await service.getSiteBreakdown(
      new Date('2026-09-08T06:30:00.000Z'),
      'Asia/Kolkata',
    );

    const dayRange = {
      gte: new Date('2026-09-07T18:30:00.000Z'),
      lt: new Date('2026-09-08T18:30:00.000Z'),
    };
    const currentRows = {
      OR: [
        { dailySiteReportId: null },
        { dailySiteReportId: { notIn: ['dsr-old'] } },
      ],
    };
    expect(consumptionGroupBy).toHaveBeenCalledWith({
      by: ['siteId'],
      where: { consumedAt: dayRange, ...currentRows },
      _count: { _all: true },
    });
    expect(expenseGroupBy).toHaveBeenCalledWith({
      by: ['siteId'],
      where: { incurredAt: dayRange, ...currentRows },
      _sum: { amount: true },
    });
  });

  it('filters on the local-timezone day boundary, not naive UTC midnight', async () => {
    const { service, workRecordFindMany, purchaseGroupBy } = makeService({
      sitesList: roster,
    });

    // 2026-08-26T18:45:00Z is already 2026-08-27 00:15 in IST.
    await service.getSiteBreakdown(
      new Date('2026-08-26T18:45:00.000Z'),
      'Asia/Kolkata',
    );

    expect(workRecordFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workDate: new Date('2026-08-27T00:00:00.000Z'),
          attended: true,
        },
      }),
    );
    expect(purchaseGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          purchasedAt: {
            gte: new Date('2026-08-26T18:30:00.000Z'),
            lt: new Date('2026-08-27T18:30:00.000Z'),
          },
        },
      }),
    );
  });
});

describe('DashboardService.getTrends', () => {
  // Fixed "now": 2026-09-08 12:00 IST (06:30 UTC).
  const now = new Date('2026-09-08T06:30:00.000Z');
  const tz = 'Asia/Kolkata';

  it('returns 7 local days ending today, each bucketed from the full-window queries', async () => {
    const { service, expenseFindMany } = makeService({
      trendDsrRows: [
        { siteId: 's1', reportDate: new Date('2026-09-08T00:00:00.000Z') },
        { siteId: 's2', reportDate: new Date('2026-09-08T00:00:00.000Z') },
        { siteId: 's1', reportDate: new Date('2026-09-06T00:00:00.000Z') },
      ],
      trendWorkRows: [
        { teamMemberId: 't1', workDate: new Date('2026-09-08T00:00:00.000Z') },
        { teamMemberId: 't2', workDate: new Date('2026-09-08T00:00:00.000Z') },
        { teamMemberId: 't1', workDate: new Date('2026-09-02T00:00:00.000Z') },
      ],
      trendExpenseRows: [
        // 2026-09-08 10:00 IST.
        {
          amount: new Prisma.Decimal(18450),
          incurredAt: new Date('2026-09-08T04:30:00.000Z'),
        },
        // 2026-09-07 23:30 IST (18:00 UTC on the 7th) — previous local day.
        {
          amount: new Prisma.Decimal(8000),
          incurredAt: new Date('2026-09-07T18:00:00.000Z'),
        },
      ],
    });

    const result = await service.getTrends(now, tz);

    expect(result.days).toHaveLength(7);
    expect(result.days.map((day) => day.date)).toEqual([
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
    ]);
    expect(result.days[6]).toEqual({
      date: '2026-09-08',
      sitesReporting: 2,
      labourWorking: 2,
      expensesTotal: 18450,
    });
    expect(result.days[5]).toEqual({
      date: '2026-09-07',
      sitesReporting: 0,
      labourWorking: 0,
      expensesTotal: 8000,
    });
    expect(result.days[4]).toEqual({
      date: '2026-09-06',
      sitesReporting: 1,
      labourWorking: 0,
      expensesTotal: 0,
    });
    expect(result.days[0]).toEqual({
      date: '2026-09-02',
      sitesReporting: 0,
      labourWorking: 1,
      expensesTotal: 0,
    });

    // One full-window expense query bucketed in JS — never one per day.
    expect(expenseFindMany).toHaveBeenCalledTimes(1);
    expect(expenseFindMany).toHaveBeenCalledWith({
      where: {
        incurredAt: {
          // 2026-09-02 00:00 IST .. 2026-09-09 00:00 IST, in UTC.
          gte: new Date('2026-09-01T18:30:00.000Z'),
          lt: new Date('2026-09-08T18:30:00.000Z'),
        },
        OR: [{ dailySiteReportId: null }, { dailySiteReportId: { notIn: [] } }],
      },
      select: { amount: true, incurredAt: true },
    });
  });

  it("ends the series on the local-timezone today, not UTC's", async () => {
    const { service } = makeService();
    // 18:45 UTC on the 26th is already the 27th in IST.
    const result = await service.getTrends(
      new Date('2026-08-26T18:45:00.000Z'),
      tz,
    );
    expect(result.days[6]?.date).toBe('2026-08-27');
    expect(result.days[0]?.date).toBe('2026-08-21');
  });

  it('excludes superseded-DSR expense rows from the trend totals', async () => {
    const { service, expenseFindMany } = makeService({
      supersededIds: ['dsr-old'],
    });

    await service.getTrends(now, tz);

    expect(expenseFindMany).toHaveBeenCalledWith({
      where: {
        incurredAt: {
          gte: new Date('2026-09-01T18:30:00.000Z'),
          lt: new Date('2026-09-08T18:30:00.000Z'),
        },
        OR: [
          { dailySiteReportId: null },
          { dailySiteReportId: { notIn: ['dsr-old'] } },
        ],
      },
      select: { amount: true, incurredAt: true },
    });
  });

  it('counts a Site reporting once per day even when a correction adds a second DSR row', async () => {
    const { service, dailySiteReportFindMany } = makeService();
    await service.getTrends(now, tz);
    // The distinct (siteId, reportDate) query is what collapses corrections.
    expect(dailySiteReportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['siteId', 'reportDate'] }),
    );
  });
});
