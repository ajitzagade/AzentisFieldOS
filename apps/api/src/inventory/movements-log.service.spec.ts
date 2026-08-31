import { describe, expect, it, vi } from 'vitest';
import { MovementsLogService } from './movements-log.service';

function makePrisma(overrides: {
  purchase?: unknown[];
  movement?: unknown[];
  consumption?: unknown[];
  returnWastage?: unknown[];
  purchaseCount?: number;
  movementCount?: number;
  consumptionCount?: number;
  returnWastageCount?: number;
  correctedDsrIds?: string[];
}) {
  const findManyFor = (rows: unknown[] = []) => vi.fn().mockResolvedValue(rows);
  const countFor = (n = 0) => vi.fn().mockResolvedValue(n);

  return {
    purchase: {
      findMany: findManyFor(overrides.purchase),
      count: countFor(overrides.purchaseCount),
    },
    movement: {
      findMany: findManyFor(overrides.movement),
      count: countFor(overrides.movementCount),
    },
    consumption: {
      findMany: findManyFor(overrides.consumption),
      count: countFor(overrides.consumptionCount),
    },
    returnWastage: {
      findMany: findManyFor(overrides.returnWastage),
      count: countFor(overrides.returnWastageCount),
    },
    // No corrected DSRs by default — the superseded-DSR exclusion this
    // service applies to Consumption (mirroring ConsumptionService.list())
    // is a no-op unless a test opts in via `correctedDsrIds`.
    dailySiteReport: {
      findMany: vi.fn().mockResolvedValue(
        (overrides.correctedDsrIds ?? []).map((correctsId) => ({
          correctsId,
        })),
      ),
    },
  };
}

function makeService(prisma: ReturnType<typeof makePrisma>) {
  return new MovementsLogService(
    prisma as unknown as ConstructorParameters<typeof MovementsLogService>[0],
  );
}

const purchaseRow = (id: string, purchasedAt: string) => ({
  id,
  purchasedAt: new Date(purchasedAt),
  destination: 'GODOWN',
  quantity: '10',
  site: null,
  materialSize: {
    label: '50kg',
    material: { name: 'Cement', unit: { name: 'Bags' } },
  },
});

const movementRow = (id: string, movedAt: string) => ({
  id,
  movedAt: new Date(movedAt),
  sentQuantity: '5',
  receivedQuantity: null,
  sourceSite: null,
  destinationSite: { id: 's1', name: 'Site A' },
  materialSize: {
    label: '12mm',
    material: { name: 'TMT Steel', unit: { name: 'kg' } },
  },
});

describe('MovementsLogService.list', () => {
  it('merges all four sources sorted by date descending', async () => {
    const prisma = makePrisma({
      purchase: [purchaseRow('p1', '2026-08-10')],
      movement: [movementRow('m1', '2026-08-12')],
      purchaseCount: 1,
      movementCount: 1,
    });
    const service = makeService(prisma);

    const result = await service.list({ page: '1', pageSize: '25' });

    expect(result.rows.map((r) => r.type)).toEqual(['MOVEMENT', 'PURCHASE']);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('fetches top (skip+take) rows from every source, never the entire table — the top-k-merge bound', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ page: '2', pageSize: '10' });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { purchasedAt: 'desc' } }),
    );
    expect(prisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { movedAt: 'desc' } }),
    );
  });

  it('slices the merged, sorted result to exactly the requested page', async () => {
    const prisma = makePrisma({
      purchase: [
        purchaseRow('p1', '2026-08-01'),
        purchaseRow('p2', '2026-08-05'),
      ],
      movement: [
        movementRow('m1', '2026-08-03'),
        movementRow('m2', '2026-08-07'),
      ],
      purchaseCount: 2,
      movementCount: 2,
    });
    const service = makeService(prisma);

    const result = await service.list({ page: '1', pageSize: '2' });

    // Merged desc by date: m2(08-07), p2(08-05), m1(08-03), p1(08-01) — page 1 of size 2 is the first two.
    expect(result.rows.map((r) => r.id)).toEqual(['m2', 'p2']);
  });

  it('treats an unrecognized type value as "all" rather than silently zeroing every source', async () => {
    const prisma = makePrisma({
      purchase: [purchaseRow('p1', '2026-08-10')],
      purchaseCount: 1,
    });
    const service = makeService(prisma);

    const result = await service.list({
      page: '1',
      pageSize: '25',
      type: 'NOT_A_REAL_TYPE',
    });

    expect(prisma.purchase.findMany).toHaveBeenCalled();
    expect(prisma.movement.findMany).toHaveBeenCalled();
    expect(prisma.consumption.findMany).toHaveBeenCalled();
    expect(prisma.returnWastage.findMany).toHaveBeenCalled();
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('only queries the requested table when a type filter is set', async () => {
    const prisma = makePrisma({
      purchase: [purchaseRow('p1', '2026-08-10')],
      purchaseCount: 1,
    });
    const service = makeService(prisma);

    const result = await service.list({
      page: '1',
      pageSize: '25',
      type: 'PURCHASE',
    });

    expect(prisma.movement.findMany).not.toHaveBeenCalled();
    expect(prisma.consumption.findMany).not.toHaveBeenCalled();
    expect(prisma.returnWastage.findMany).not.toHaveBeenCalled();
    expect(result.rows.every((r) => r.type === 'PURCHASE')).toBe(true);
  });

  it("applies a siteId filter across each table's own site field(s)", async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ page: '1', pageSize: '25', siteId: 's1' });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteId: 's1' }),
      }),
    );
    expect(prisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [{ sourceSiteId: 's1' }, { destinationSiteId: 's1' }],
        }),
      }),
    );
    expect(prisma.consumption.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteId: 's1' }),
      }),
    );
    expect(prisma.returnWastage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteId: 's1' }),
      }),
    );
  });

  it('searches by Material name or Site name, case-insensitively, across each table', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ page: '1', pageSize: '25', q: 'cement' });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [
            {
              materialSize: {
                material: { name: { contains: 'cement', mode: 'insensitive' } },
              },
            },
            { site: { name: { contains: 'cement', mode: 'insensitive' } } },
          ],
        }),
      }),
    );
  });

  it('applies the search filter to count() too, not just findMany — otherwise total is inflated for any searched Movement/Consumption/ReturnWastage', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ page: '1', pageSize: '25', q: 'cement' });

    expect(prisma.movement.count).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [
            {
              materialSize: {
                material: { name: { contains: 'cement', mode: 'insensitive' } },
              },
            },
            {
              sourceSite: { name: { contains: 'cement', mode: 'insensitive' } },
            },
            {
              destinationSite: {
                name: { contains: 'cement', mode: 'insensitive' },
              },
            },
          ],
        }),
      }),
    );
    // Consumption's own superseded-DSR exclusion already occupies the
    // top-level `OR` key (see the dedicated test below), so the search
    // clause is composed via `AND: [{ OR: [...] }]` instead — same
    // composition Story 16.1 already used for Expenses/RMC.
    expect(prisma.consumption.count).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          AND: [
            {
              OR: [
                {
                  materialSize: {
                    material: {
                      name: { contains: 'cement', mode: 'insensitive' },
                    },
                  },
                },
                { site: { name: { contains: 'cement', mode: 'insensitive' } } },
              ],
            },
          ],
        }),
      }),
    );
    expect(prisma.returnWastage.count).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [
            {
              materialSize: {
                material: { name: { contains: 'cement', mode: 'insensitive' } },
              },
            },
            { site: { name: { contains: 'cement', mode: 'insensitive' } } },
          ],
        }),
      }),
    );
  });

  it('excludes Consumption rows belonging to a superseded (corrected) DSR — same rule as ConsumptionService.list()', async () => {
    const prisma = makePrisma({ correctedDsrIds: ['dsr-old'] });
    const service = makeService(prisma);

    await service.list({ page: '1', pageSize: '25' });

    expect(prisma.consumption.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [
            { dailySiteReportId: null },
            { dailySiteReportId: { notIn: ['dsr-old'] } },
          ],
        }),
      }),
    );
    expect(prisma.consumption.count).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          OR: [
            { dailySiteReportId: null },
            { dailySiteReportId: { notIn: ['dsr-old'] } },
          ],
        }),
      }),
    );
    // Purchase/Movement/ReturnWastage's own dedicated list() methods carry
    // no such exclusion, so none is added for them here either.
    expect(prisma.purchase.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ OR: expect.anything() }),
      }),
    );
  });

  it('defaults to page 1 / pageSize 25 when neither is passed — this is a brand-new endpoint with no prior unpaginated callers to preserve', async () => {
    const prisma = makePrisma({
      purchase: [purchaseRow('p1', '2026-08-10')],
      purchaseCount: 1,
    });
    const service = makeService(prisma);

    const result = await service.list({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('sorts every source ascending by date and re-merges ascending when sort=date/order=asc is requested', async () => {
    const prisma = makePrisma({
      purchase: [
        purchaseRow('p1', '2026-08-01'),
        purchaseRow('p2', '2026-08-05'),
      ],
      movement: [
        movementRow('m1', '2026-08-03'),
        movementRow('m2', '2026-08-07'),
      ],
      purchaseCount: 2,
      movementCount: 2,
    });
    const service = makeService(prisma);

    const result = await service.list({
      page: '1',
      pageSize: '2',
      sort: 'date',
      order: 'asc',
    });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { purchasedAt: 'asc' } }),
    );
    expect(prisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { movedAt: 'asc' } }),
    );
    // Merged asc by date: p1(08-01), m1(08-03), p2(08-05), m2(08-07) — page 1 of size 2 is the first two.
    expect(result.rows.map((r) => r.id)).toEqual(['p1', 'm1']);
  });

  it('ignores an unrecognized sort field and keeps the default date-descending order', async () => {
    const prisma = makePrisma({
      purchase: [purchaseRow('p1', '2026-08-10')],
      purchaseCount: 1,
    });
    const service = makeService(prisma);

    await service.list({ sort: 'material' });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { purchasedAt: 'desc' } }),
    );
  });
});
