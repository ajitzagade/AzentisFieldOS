import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { RmcService } from './rmc.service';

// This service's entire reason for existing (per the epic's Implementation
// Notes) is that RMC deliveries never touch GodownStock/SiteStock — the
// mock prisma client below deliberately has no `godownStock`/`siteStock`
// keys at all, so any accidental call would throw "Cannot read properties
// of undefined", making that boundary a concrete, automatable check.
function makeService(overrides: {
  rmcEntryCreate?: ReturnType<typeof vi.fn>;
  rmcEntryFindUnique?: ReturnType<typeof vi.fn>;
  rmcEntryFindMany?: ReturnType<typeof vi.fn>;
  rmcEntryAggregate?: ReturnType<typeof vi.fn>;
}) {
  const rmcEntryCreate =
    overrides.rmcEntryCreate ?? vi.fn().mockResolvedValue({ id: 'r1' });
  const rmcEntryFindUnique = overrides.rmcEntryFindUnique ?? vi.fn();
  const rmcEntryFindMany =
    overrides.rmcEntryFindMany ?? vi.fn().mockResolvedValue([]);
  const rmcEntryAggregate = overrides.rmcEntryAggregate ?? vi.fn();

  const prisma = {
    rmcEntry: {
      create: rmcEntryCreate,
      findUnique: rmcEntryFindUnique,
      findMany: rmcEntryFindMany,
      aggregate: rmcEntryAggregate,
    },
  };

  const service = new RmcService(
    prisma as unknown as ConstructorParameters<typeof RmcService>[0],
  );

  return {
    service,
    prisma,
    rmcEntryCreate,
    rmcEntryFindUnique,
    rmcEntryFindMany,
  };
}

const baseInput = {
  siteId: 'site1',
  vendorId: 'vendor1',
  quantityM3: 42,
  grade: 'M25',
  ratePerM3: 6200,
  totalAmount: 260400,
  deliveredAt: new Date('2026-08-13'),
};

describe('RmcService.create', () => {
  it('creates the RmcEntry row directly — no stock upsert, no transaction wrapping', async () => {
    const { service, rmcEntryCreate } = makeService({});

    await service.create(baseInput);

    expect(rmcEntryCreate).toHaveBeenCalledWith({
      data: { ...baseInput, deliveredAt: new Date(baseInput.deliveredAt) },
    });
  });

  it('rejects a correctsId that does not reference an existing RMC delivery', async () => {
    const rmcEntryFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ rmcEntryFindUnique });

    await expect(
      service.create({ ...baseInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('proceeds when correctsId references an existing RMC delivery with matching Site/Vendor/Grade', async () => {
    const rmcEntryFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      vendorId: 'vendor1',
      grade: 'M25',
    });
    const { service, rmcEntryCreate } = makeService({ rmcEntryFindUnique });

    await service.create({
      ...baseInput,
      quantityM3: -6,
      correctsId: 'orig',
      reason: 'Recount',
    });

    expect(rmcEntryCreate).toHaveBeenCalledWith({
      data: {
        ...baseInput,
        quantityM3: -6,
        correctsId: 'orig',
        reason: 'Recount',
        deliveredAt: new Date(baseInput.deliveredAt),
      },
    });
  });

  it('rejects a correction whose Site does not match the original delivery', async () => {
    const rmcEntryFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'a-different-site',
      vendorId: 'vendor1',
      grade: 'M25',
    });
    const { service } = makeService({ rmcEntryFindUnique });

    await expect(
      service.create({
        ...baseInput,
        quantityM3: -6,
        correctsId: 'orig',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a correction whose Vendor does not match the original delivery', async () => {
    const rmcEntryFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      vendorId: 'a-different-vendor',
      grade: 'M25',
    });
    const { service } = makeService({ rmcEntryFindUnique });

    await expect(
      service.create({
        ...baseInput,
        quantityM3: -6,
        correctsId: 'orig',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a correction whose Grade does not match the original delivery', async () => {
    const rmcEntryFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      vendorId: 'vendor1',
      grade: 'M30',
    });
    const { service } = makeService({ rmcEntryFindUnique });

    await expect(
      service.create({
        ...baseInput,
        quantityM3: -6,
        correctsId: 'orig',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('translates a foreign-key violation (P2003) into a clear 400, not a raw 500', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2003', message: 'FK violation' });
    const rmcEntryCreate = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ rmcEntryCreate });

    await expect(service.create(baseInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const rmcEntryCreate = vi.fn().mockRejectedValue(otherError);
    const { service } = makeService({ rmcEntryCreate });

    await expect(service.create(baseInput)).rejects.toThrow('connection lost');
  });
});

describe('RmcService.list', () => {
  it('passes no where filter when no filters are given', async () => {
    const { service, rmcEntryFindMany } = makeService({});

    await service.list();

    expect(rmcEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('filters by siteId and vendorId (AC #2)', async () => {
    const { service, rmcEntryFindMany } = makeService({});

    await service.list({ siteId: 'site1', vendorId: 'vendor1' });

    expect(rmcEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 'site1', vendorId: 'vendor1' },
      }),
    );
  });

  it('filters by a single calendar day when date is given (AC #2)', async () => {
    const { service, rmcEntryFindMany } = makeService({});

    await service.list({ date: '2026-08-13' });

    const call = rmcEntryFindMany.mock.calls[0]![0] as {
      where: { deliveredAt: { gte: Date; lt: Date } };
    };
    expect(call.where.deliveredAt.gte).toEqual(new Date('2026-08-13'));
    expect(call.where.deliveredAt.lt.getTime()).toBeGreaterThan(
      call.where.deliveredAt.gte.getTime(),
    );
  });

  it('includes site and vendor relations for display', async () => {
    const { service, rmcEntryFindMany } = makeService({});

    await service.list();

    expect(rmcEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { site: true, vendor: true } }),
    );
  });
});

// Prisma Decimal stand-in — only .toNumber() is exercised by report().
function dec(n: number) {
  return {
    toNumber: () => n,
  } as unknown as import('../generated/prisma/client').Prisma.Decimal;
}

// A multi-Site / multi-Vendor / multi-date fixture set including a
// negative-quantity correction (AD-9). Grand total: qty 95, cost 583000,
// 4 entries — every groupBy slice must reconcile back to exactly this.
const reportFixtures = [
  {
    id: 'e1',
    siteId: 'siteA',
    vendorId: 'vendorX',
    grade: 'M25',
    deliveredAt: new Date('2026-08-10T09:00:00Z'),
    quantityM3: dec(30),
    totalAmount: dec(180000),
    site: { name: 'Alpha Site' },
    vendor: { name: 'X Concrete' },
  },
  {
    id: 'e2',
    siteId: 'siteA',
    vendorId: 'vendorY',
    grade: 'M25',
    deliveredAt: new Date('2026-08-10T14:00:00Z'),
    quantityM3: dec(20),
    totalAmount: dec(124000),
    site: { name: 'Alpha Site' },
    vendor: { name: 'Y Concrete' },
  },
  {
    id: 'e3',
    siteId: 'siteB',
    vendorId: 'vendorX',
    grade: 'M30',
    deliveredAt: new Date('2026-08-11T10:00:00Z'),
    quantityM3: dec(50),
    totalAmount: dec(310000),
    site: { name: 'Bravo Site' },
    vendor: { name: 'X Concrete' },
  },
  {
    id: 'e4',
    siteId: 'siteB',
    vendorId: 'vendorX',
    grade: 'M30',
    deliveredAt: new Date('2026-08-11T16:00:00Z'),
    quantityM3: dec(-5),
    totalAmount: dec(-31000),
    site: { name: 'Bravo Site' },
    vendor: { name: 'X Concrete' },
  },
];

const GRAND_QTY = 95;
const GRAND_COST = 583000;
const GRAND_COUNT = 4;

function makeReportService() {
  const rmcEntryFindMany = vi.fn().mockResolvedValue(reportFixtures);
  return { ...makeService({ rmcEntryFindMany }), rmcEntryFindMany };
}

describe('RmcService.report', () => {
  it('groups the daily slice by calendar day, summing qty/cost/count per day', async () => {
    const { service } = makeReportService();

    const rows = await service.report('day');

    // Sorted most-recent-first.
    expect(rows.map((r) => r.key)).toEqual(['2026-08-11', '2026-08-10']);
    expect(rows).toEqual([
      {
        key: '2026-08-11',
        label: '2026-08-11',
        totalQuantityM3: 45,
        totalCost: 279000,
        entryCount: 2,
      },
      {
        key: '2026-08-10',
        label: '2026-08-10',
        totalQuantityM3: 50,
        totalCost: 304000,
        entryCount: 2,
      },
    ]);
  });

  it('groups the Site-wise slice by siteId, labelled by Site name and sorted by name', async () => {
    const { service } = makeReportService();

    const rows = await service.report('site');

    expect(rows).toEqual([
      {
        key: 'siteA',
        label: 'Alpha Site',
        totalQuantityM3: 50,
        totalCost: 304000,
        entryCount: 2,
      },
      {
        key: 'siteB',
        label: 'Bravo Site',
        totalQuantityM3: 45,
        totalCost: 279000,
        entryCount: 2,
      },
    ]);
  });

  it('groups the Vendor-wise slice by vendorId, netting a correction into its vendor bucket', async () => {
    const { service } = makeReportService();

    const rows = await service.report('vendor');

    expect(rows).toEqual([
      {
        key: 'vendorX',
        label: 'X Concrete',
        totalQuantityM3: 75,
        totalCost: 459000,
        entryCount: 3,
      },
      {
        key: 'vendorY',
        label: 'Y Concrete',
        totalQuantityM3: 20,
        totalCost: 124000,
        entryCount: 1,
      },
    ]);
  });

  // AC #1: the concrete proof — all three slices reconcile to one grand total.
  it('reconciles all three slices to the same grand total (AC #1)', async () => {
    const { service } = makeReportService();

    const [day, site, vendor] = await Promise.all([
      service.report('day'),
      service.report('site'),
      service.report('vendor'),
    ]);

    for (const rows of [day, site, vendor]) {
      const qty = rows.reduce((sum, r) => sum + r.totalQuantityM3, 0);
      const cost = rows.reduce((sum, r) => sum + r.totalCost, 0);
      const count = rows.reduce((sum, r) => sum + r.entryCount, 0);
      expect(qty).toBe(GRAND_QTY);
      expect(cost).toBe(GRAND_COST);
      expect(count).toBe(GRAND_COUNT);
    }
  });

  it('passes a deliveredAt gte/lt window when from/to are given (to is inclusive of the whole day)', async () => {
    const { service, rmcEntryFindMany } = makeReportService();

    await service.report('day', { from: '2026-08-01', to: '2026-08-31' });

    const call = rmcEntryFindMany.mock.calls[0]![0] as {
      where: { deliveredAt: { gte: Date; lt: Date } };
    };
    expect(call.where.deliveredAt.gte).toEqual(new Date('2026-08-01'));
    const expectedLt = new Date('2026-08-31');
    expectedLt.setDate(expectedLt.getDate() + 1);
    expect(call.where.deliveredAt.lt).toEqual(expectedLt);
  });

  it('passes no deliveredAt filter when no range is given', async () => {
    const { service, rmcEntryFindMany } = makeReportService();

    await service.report('day');

    expect(rmcEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('returns an empty array for a Tenant/range with no RMC deliveries (empty state, not an error)', async () => {
    const rmcEntryFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ rmcEntryFindMany });

    await expect(service.report('site')).resolves.toEqual([]);
  });
});

describe('RmcService.findOne', () => {
  it('throws NotFoundException when no RmcEntry matches the id', async () => {
    const { service } = makeService({
      rmcEntryFindUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns the RmcEntry when found', async () => {
    const { service } = makeService({
      rmcEntryFindUnique: vi.fn().mockResolvedValue({ id: 'r1' }),
    });

    await expect(service.findOne('r1')).resolves.toEqual({ id: 'r1' });
  });
});

describe('RmcService.statsThisMonth', () => {
  it('computes totalQuantityM3/totalCost from the aggregate and activeVendorCount from a distinct vendorId query', async () => {
    const rmcEntryAggregate = vi.fn().mockResolvedValue({
      _sum: {
        quantityM3: { toNumber: () => 196 },
        totalAmount: { toNumber: () => 1244900 },
      },
    });
    const rmcEntryFindMany = vi
      .fn()
      .mockResolvedValue([{ vendorId: 'vendor1' }]);
    const { service } = makeService({
      rmcEntryAggregate,
      rmcEntryFindMany,
    });

    const result = await service.statsThisMonth();

    expect(result).toEqual({
      totalQuantityM3: 196,
      totalCost: 1244900,
      activeVendorCount: 1,
    });
  });

  it('reports zeroes for a month with zero RMC deliveries, not an error', async () => {
    const rmcEntryAggregate = vi.fn().mockResolvedValue({
      _sum: { quantityM3: null, totalAmount: null },
    });
    const { service } = makeService({ rmcEntryAggregate });

    const result = await service.statsThisMonth();

    expect(result).toEqual({
      totalQuantityM3: 0,
      totalCost: 0,
      activeVendorCount: 0,
    });
  });
});
