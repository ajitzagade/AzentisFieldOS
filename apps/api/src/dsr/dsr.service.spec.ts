import { describe, expect, it, vi } from 'vitest';
import { DsrService } from './dsr.service';

// Focused unit coverage for Story 13.2's listBySiteInRange (the DailySiteReport
// query the Site Reports view reuses) — the fuller create/correct paths are
// exercised in dsr.service.integration.spec.ts against a real DB.
function makeService(rows: unknown[]) {
  const findMany = vi.fn().mockResolvedValue(rows);
  const prisma = { dailySiteReport: { findMany } };
  const storage = {};
  const pushNotifications = {};
  const service = new DsrService(
    prisma as never,
    storage as never,
    pushNotifications as never,
  );
  return { service, findMany };
}

describe('DsrService.listBySiteInRange (FR-42)', () => {
  it('scopes to the Site and threads the date window onto reportDate', async () => {
    const { service, findMany } = makeService([]);

    await service.listBySiteInRange('site1', '2026-08-01', '2026-08-31');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          siteId: 'site1',
          reportDate: {
            gte: new Date('2026-08-01T00:00:00.000Z'),
            lt: new Date('2026-09-01T00:00:00.000Z'),
          },
          // spec-dsr-drafts: Site Reports show SUBMITTED only.
          status: 'SUBMITTED',
        },
        orderBy: { reportDate: 'desc' },
      }),
    );
  });

  it('passes an undefined reportDate filter through when no window is given', async () => {
    const { service, findMany } = makeService([]);

    await service.listBySiteInRange('site1');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 'site1', reportDate: undefined, status: 'SUBMITTED' },
      }),
    );
  });

  it('drops any report a later correction supersedes, keeping only current versions', async () => {
    // original <- correction: the correction points at the original via
    // correctsId, so only the correction (the tip) survives.
    const { service } = makeService([
      { id: 'original', correctsId: null },
      { id: 'correction', correctsId: 'original' },
    ]);

    const result = await service.listBySiteInRange('site1');

    expect(result.map((r) => r.id)).toEqual(['correction']);
  });

  it('returns an empty array (not an error) when the window matches nothing', async () => {
    const { service } = makeService([]);

    await expect(service.listBySiteInRange('site1')).resolves.toEqual([]);
  });
});

// spec-daily-reports-list-and-edit: the cross-Site "Submitted Daily
// Reports" history list. Call order inside listAllSubmitted is fixed:
// supersededDsrIds() calls findMany once (correction rows), then the page
// query's Promise.all calls findMany once more (page rows) followed by
// count() — mockResolvedValueOnce/mockResolvedValueOnce below relies on
// that exact order.
function makeHistoryService({
  correctionRows = [],
  pageRows = [],
  total = 0,
  ancestorsById = {},
}: {
  correctionRows?: { correctsId: string }[];
  pageRows?: unknown[];
  total?: number;
  ancestorsById?: Record<string, unknown>;
}) {
  const findMany = vi
    .fn()
    .mockResolvedValueOnce(correctionRows)
    .mockResolvedValueOnce(pageRows);
  const count = vi.fn().mockResolvedValue(total);
  const findUnique = vi.fn(({ where }: { where: { id: string } }) =>
    Promise.resolve(ancestorsById[where.id] ?? null),
  );
  const prisma = {
    dailySiteReport: { findMany, count, findUnique },
  };
  const storage = {};
  const pushNotifications = {};
  const service = new DsrService(
    prisma as never,
    storage as never,
    pushNotifications as never,
  );
  return { service, findMany, count, findUnique };
}

describe('DsrService.listAllSubmitted', () => {
  it('never edited: Submitted Time equals Last Updated Time, Status "ORIGINAL"', async () => {
    const createdAt = new Date('2026-09-01T08:00:00.000Z');
    const { service } = makeHistoryService({
      pageRows: [
        {
          id: 'O',
          createdAt,
          correctsId: null,
          reason: null,
          reportDate: new Date('2026-09-01T00:00:00.000Z'),
          site: { id: 's1', name: 'NH-48' },
          submittedBy: { name: 'Asha' },
        },
      ],
      total: 1,
    });

    const result = await service.listAllSubmitted({});

    expect(result.rows).toEqual([
      {
        id: 'O',
        site: { id: 's1', name: 'NH-48' },
        submittedBy: { name: 'Asha' },
        reportDate: new Date('2026-09-01T00:00:00.000Z'),
        submittedAt: createdAt,
        lastUpdatedAt: createdAt,
        status: 'ORIGINAL',
      },
    ]);
  });

  it('edited once: Submitted Time is the original\'s createdAt, Last Updated is the current row\'s, Status "EDITED"', async () => {
    const originalCreatedAt = new Date('2026-09-01T08:00:00.000Z');
    const correctionCreatedAt = new Date('2026-09-05T10:00:00.000Z');
    const { service } = makeHistoryService({
      correctionRows: [{ correctsId: 'O' }],
      pageRows: [
        {
          id: 'C1',
          createdAt: correctionCreatedAt,
          correctsId: 'O',
          reason: 'Fixed crew count',
          reportDate: new Date('2026-09-01T00:00:00.000Z'),
          site: { id: 's1', name: 'NH-48' },
          submittedBy: { name: 'Ravi' },
        },
      ],
      total: 1,
      ancestorsById: {
        O: {
          id: 'O',
          createdAt: originalCreatedAt,
          correctsId: null,
          reason: null,
          submittedBy: { name: 'Asha' },
        },
      },
    });

    const result = await service.listAllSubmitted({});

    expect(result.rows[0]).toMatchObject({
      submittedAt: originalCreatedAt,
      lastUpdatedAt: correctionCreatedAt,
      status: 'EDITED',
    });
  });

  it('edited twice: a 2-hop walk still resolves the original submission time', async () => {
    const originalCreatedAt = new Date('2026-09-01T08:00:00.000Z');
    const c1CreatedAt = new Date('2026-09-03T08:00:00.000Z');
    const c2CreatedAt = new Date('2026-09-05T08:00:00.000Z');
    const { service } = makeHistoryService({
      correctionRows: [{ correctsId: 'O' }, { correctsId: 'C1' }],
      pageRows: [
        {
          id: 'C2',
          createdAt: c2CreatedAt,
          correctsId: 'C1',
          reason: 'Fixed materials',
          reportDate: new Date('2026-09-01T00:00:00.000Z'),
          site: { id: 's1', name: 'NH-48' },
          submittedBy: { name: 'Priya' },
        },
      ],
      total: 1,
      ancestorsById: {
        O: {
          id: 'O',
          createdAt: originalCreatedAt,
          correctsId: null,
          reason: null,
          submittedBy: { name: 'Asha' },
        },
        C1: {
          id: 'C1',
          createdAt: c1CreatedAt,
          correctsId: 'O',
          reason: 'Fixed crew count',
          submittedBy: { name: 'Ravi' },
        },
      },
    });

    const result = await service.listAllSubmitted({});

    expect(result.rows[0]).toMatchObject({
      submittedAt: originalCreatedAt,
      lastUpdatedAt: c2CreatedAt,
      status: 'EDITED',
    });
  });

  it('AND-combines siteId/from/to/q filters and excludes superseded rows, SUBMITTED only', async () => {
    const { service, findMany } = makeHistoryService({
      correctionRows: [{ correctsId: 'superseded-1' }],
      pageRows: [],
      total: 0,
    });

    await service.listAllSubmitted({
      siteId: 'site1',
      from: '2026-08-01',
      to: '2026-08-31',
      q: 'slip hazard',
    });

    // Second call is the page query (first is supersededDsrIds' own scan).
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          status: 'SUBMITTED',
          id: { notIn: ['superseded-1'] },
          siteId: 'site1',
          reportDate: {
            gte: new Date('2026-08-01T00:00:00.000Z'),
            lt: new Date('2026-09-01T00:00:00.000Z'),
          },
          OR: [
            {
              site: { name: { contains: 'slip hazard', mode: 'insensitive' } },
            },
            {
              submittedBy: {
                name: { contains: 'slip hazard', mode: 'insensitive' },
              },
            },
          ],
        },
      }),
    );
  });

  it('defaults to reportDate desc when no sort is given, and honors an explicit sort/order', async () => {
    const { service, findMany } = makeHistoryService({
      pageRows: [],
      total: 0,
    });
    await service.listAllSubmitted({});
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ orderBy: { reportDate: 'desc' } }),
    );

    const { service: service2, findMany: findMany2 } = makeHistoryService({
      pageRows: [],
      total: 0,
    });
    await service2.listAllSubmitted({ sort: 'createdAt', order: 'asc' });
    expect(findMany2).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
  });

  it('paginates: defaults to page 1/pageSize 25, and passes through explicit values', async () => {
    const { service, findMany } = makeHistoryService({
      pageRows: [],
      total: 0,
    });
    const result = await service.listAllSubmitted({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ skip: 0, take: 25 }),
    );

    const { service: service2, findMany: findMany2 } = makeHistoryService({
      pageRows: [],
      total: 0,
    });
    const result2 = await service2.listAllSubmitted({
      page: '3',
      pageSize: '10',
    });
    expect(result2.page).toBe(3);
    expect(result2.pageSize).toBe(10);
    expect(findMany2).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it('returns the empty-list shape (not an error) when nothing matches', async () => {
    const { service } = makeHistoryService({ pageRows: [], total: 0 });
    await expect(service.listAllSubmitted({ q: 'xyz' })).resolves.toEqual({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });
  });
});

describe('DsrService.searchCandidates', () => {
  it('excludes superseded reports (caller-supplied) and matches every narrative field, including safetyObservations', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { dailySiteReport: { findMany, count } };
    const storage = {};
    const pushNotifications = {};
    const service = new DsrService(
      prisma as never,
      storage as never,
      pushNotifications as never,
    );

    await service.searchCandidates('slip hazard', ['superseded-dsr-1']);

    const expectedWhere = {
      id: { notIn: ['superseded-dsr-1'] },
      // spec-dsr-drafts: a private DRAFT never surfaces in global search.
      status: 'SUBMITTED',
      OR: [
        { site: { name: { contains: 'slip hazard', mode: 'insensitive' } } },
        {
          submittedBy: {
            name: { contains: 'slip hazard', mode: 'insensitive' },
          },
        },
        { workCompleted: { contains: 'slip hazard', mode: 'insensitive' } },
        { workInProgress: { contains: 'slip hazard', mode: 'insensitive' } },
        { plannedWork: { contains: 'slip hazard', mode: 'insensitive' } },
        { issuesBlockers: { contains: 'slip hazard', mode: 'insensitive' } },
        {
          safetyObservations: {
            contains: 'slip hazard',
            mode: 'insensitive',
          },
        },
        { notes: { contains: 'slip hazard', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});

// Review fix: findOne(id) can be asked for ANY version in a chain, not just
// the current tip — viewing a middle version's detail page must still show
// the COMPLETE version history (every version, not just that version and
// its ancestors). findOne also drives getSiteActivityFeed/
// getSiteMaterialActivity (a dozen+ other Prisma models) — a generic model
// stub (empty findMany/count/findFirst/findUnique by default) keeps this
// test resilient to those unrelated read paths and focused on the one thing
// under test: submissionChain wiring.
describe('DsrService.findOne — version history (review fix)', () => {
  function genericModel() {
    return {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _sum: {} }),
      groupBy: vi.fn().mockResolvedValue([]),
    };
  }

  // O -> C1 -> C2: a 3-version chain. findOne is called with C1 (the
  // MIDDLE version) below.
  function makeChainRows() {
    const O = {
      id: 'O',
      createdAt: new Date('2026-09-01T08:00:00.000Z'),
      correctsId: null,
      reason: null,
      submittedBy: { name: 'Asha' },
    };
    const C1Full = {
      id: 'C1',
      siteId: 'site-1',
      status: 'SUBMITTED',
      createdAt: new Date('2026-09-02T08:00:00.000Z'),
      reportDate: new Date('2026-09-01T00:00:00.000Z'),
      correctsId: 'O',
      reason: 'Fixed crew count',
      site: { id: 'site-1', name: 'NH-48' },
      submittedBy: { name: 'Ravi' },
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      wasteDisposalEntries: [],
      subcontractorWorkEntries: [],
      photos: [],
    };
    const C2 = {
      id: 'C2',
      createdAt: new Date('2026-09-03T08:00:00.000Z'),
      correctsId: 'C1',
      reason: 'Fixed materials',
      submittedBy: { name: 'Priya' },
    };
    return { O, C1Full, C2 };
  }

  function makeFindOneService() {
    const { O, C1Full, C2 } = makeChainRows();
    const chainRowsById: Record<string, unknown> = { O, C1: C1Full, C2 };

    // Prisma dispatches on the shape of the call: findOne's own initial
    // fetch passes `include` (the full nested read); the chain-walk's
    // backward step passes `select` (the lightweight ChainRow shape).
    const dsrFindUnique = vi.fn(
      (args: { where: { id: string }; include?: unknown }) => {
        if (args.include) {
          return Promise.resolve(args.where.id === 'C1' ? C1Full : null);
        }
        return Promise.resolve(chainRowsById[args.where.id] ?? null);
      },
    );
    // findFirst is used both for the plain "did something correct me"
    // lookup (`correctsId: id`) and the chain-walk's forward step (same
    // shape) — resolving by scanning correctsId across all three rows
    // covers both.
    const dsrFindFirst = vi.fn(
      ({ where }: { where: { correctsId: string } }) => {
        const match = [O, C1Full, C2].find(
          (r) => (r as { correctsId?: string }).correctsId === where.correctsId,
        );
        return Promise.resolve(match ?? null);
      },
    );

    const modelCache: Record<string, ReturnType<typeof genericModel>> = {};
    const prisma = new Proxy(
      {},
      {
        get(_target, prop: string) {
          if (prop === 'dailySiteReport') {
            return {
              ...genericModel(),
              findUnique: dsrFindUnique,
              findFirst: dsrFindFirst,
            };
          }
          if (!modelCache[prop]) modelCache[prop] = genericModel();
          return modelCache[prop];
        },
      },
    );

    const storage = {};
    const pushNotifications = {};
    const service = new DsrService(
      prisma as never,
      storage as never,
      pushNotifications as never,
    );
    return { service };
  }

  it('returns the COMPLETE chain [O, C1, C2] when asked for the MIDDLE version (C1), not just C1 and its ancestors', async () => {
    const { service } = makeFindOneService();

    const result = await service.findOne('C1');

    expect(result.versionHistory.map((v: { id: string }) => v.id)).toEqual([
      'O',
      'C1',
      'C2',
    ]);
  });
});

// spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" — a narrow,
// sanctioned AD-9 exception (same class as D7's Purchase-pricing
// completion). Unit-covers the two guard checks (correction history,
// target collision) plus the happy path; the DB round-trip itself is left
// to the integration suite, same division of labour as the rest of this
// file.
describe('DsrService.reassignSiteDate', () => {
  function makeReassignService({
    report,
    correction = null,
    existingAtTarget = [],
  }: {
    report: { id: string; status: string; correctsId: string | null } | null;
    correction?: { id: string } | null;
    existingAtTarget?: { id: string; correctsId: string | null }[];
  }) {
    const findUnique = vi.fn().mockResolvedValue(report);
    const findFirst = vi.fn().mockResolvedValue(correction);
    const findMany = vi.fn().mockResolvedValue(existingAtTarget);
    const update = vi
      .fn()
      .mockImplementation(
        ({
          where,
          data,
        }: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => Promise.resolve({ id: where.id, ...data }),
      );
    const prisma = {
      dailySiteReport: { findUnique, findFirst, findMany, update },
    };
    const storage = {};
    const pushNotifications = {};
    const service = new DsrService(
      prisma as never,
      storage as never,
      pushNotifications as never,
    );
    return { service, findUnique, findFirst, findMany, update };
  }

  it('rejects a report that is not found', async () => {
    const { service } = makeReassignService({ report: null });

    await expect(
      service.reassignSiteDate('missing', {
        siteId: 'site-2',
        reportDate: '2026-09-24',
      }),
    ).rejects.toThrow('Daily Site Report missing not found');
  });

  it('rejects a report that is itself a correction', async () => {
    const { service } = makeReassignService({
      report: { id: 'c1', status: 'SUBMITTED', correctsId: 'o1' },
    });

    await expect(
      service.reassignSiteDate('c1', {
        siteId: 'site-2',
        reportDate: '2026-09-24',
      }),
    ).rejects.toThrow(
      "This report has correction history and can't be reassigned",
    );
  });

  it('rejects a report that has since been corrected', async () => {
    const { service } = makeReassignService({
      report: { id: 'o1', status: 'SUBMITTED', correctsId: null },
      correction: { id: 'c1' },
    });

    await expect(
      service.reassignSiteDate('o1', {
        siteId: 'site-2',
        reportDate: '2026-09-24',
      }),
    ).rejects.toThrow(
      "This report has correction history and can't be reassigned",
    );
  });

  it('rejects a target Site+date that already has a different report', async () => {
    const { service } = makeReassignService({
      report: { id: 'o1', status: 'SUBMITTED', correctsId: null },
      existingAtTarget: [{ id: 'other-report', correctsId: null }],
    });

    await expect(
      service.reassignSiteDate('o1', {
        siteId: 'site-2',
        reportDate: '2026-09-24',
      }),
    ).rejects.toThrow('A report already exists for that Site and Date');
  });

  it('updates siteId/reportDate in place on the happy path', async () => {
    const { service, update } = makeReassignService({
      report: { id: 'o1', status: 'SUBMITTED', correctsId: null },
      existingAtTarget: [],
    });

    const result = await service.reassignSiteDate('o1', {
      siteId: 'site-2',
      reportDate: '2026-09-24',
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { siteId: 'site-2', reportDate: new Date('2026-09-24') },
    });
    expect(result).toEqual({
      id: 'o1',
      siteId: 'site-2',
      reportDate: new Date('2026-09-24'),
    });
  });

  it('does not treat the report colliding with itself at its own current Site+date as a collision', async () => {
    const { service, update } = makeReassignService({
      report: { id: 'o1', status: 'SUBMITTED', correctsId: null },
      existingAtTarget: [{ id: 'o1', correctsId: null }],
    });

    await service.reassignSiteDate('o1', {
      siteId: 'site-1',
      reportDate: '2026-09-24',
    });

    expect(update).toHaveBeenCalled();
  });
});
