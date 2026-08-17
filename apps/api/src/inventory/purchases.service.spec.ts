import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { PurchasesService } from './purchases.service';

function makeService(overrides: {
  purchaseCreate?: ReturnType<typeof vi.fn>;
  purchaseFindUnique?: ReturnType<typeof vi.fn>;
  godownStockUpsert?: ReturnType<typeof vi.fn>;
  siteStockUpsert?: ReturnType<typeof vi.fn>;
}) {
  const purchaseCreate =
    overrides.purchaseCreate ?? vi.fn().mockResolvedValue({ id: 'p1' });
  const godownStockUpsert =
    overrides.godownStockUpsert ?? vi.fn().mockResolvedValue({});
  const siteStockUpsert =
    overrides.siteStockUpsert ?? vi.fn().mockResolvedValue({});
  const purchaseFindUnique = overrides.purchaseFindUnique ?? vi.fn();

  const tx = {
    purchase: { create: purchaseCreate },
    godownStock: { upsert: godownStockUpsert },
    siteStock: { upsert: siteStockUpsert },
  };

  const prisma = {
    purchase: { findUnique: purchaseFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new PurchasesService(
    prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
  );

  return {
    service,
    prisma,
    purchaseCreate,
    godownStockUpsert,
    siteStockUpsert,
  };
}

const godownInput = {
  vendorId: 'v1',
  materialSizeId: 'ms1',
  destination: 'GODOWN' as const,
  quantity: 100,
  rate: 50,
  totalAmount: 5000,
  paymentStatus: 'PAID' as const,
  purchasedAt: '2026-08-13',
};

const siteInput = {
  ...godownInput,
  destination: 'SITE' as const,
  siteId: 'site1',
};

describe('PurchasesService.create', () => {
  it('a GODOWN-destined create runs inside a transaction and increments godownStock, never touching siteStock', async () => {
    const { service, prisma, godownStockUpsert, siteStockUpsert } = makeService(
      {},
    );

    await service.create(godownInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(godownStockUpsert).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1' },
      update: { quantity: { increment: 100 } },
      create: { materialSizeId: 'ms1', quantity: 100 },
    });
    expect(siteStockUpsert).not.toHaveBeenCalled();
  });

  it('a SITE-destined create runs inside a transaction and increments siteStock, never touching godownStock', async () => {
    const { service, prisma, godownStockUpsert, siteStockUpsert } = makeService(
      {},
    );

    await service.create(siteInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(siteStockUpsert).toHaveBeenCalledWith({
      where: {
        siteId_materialSizeId: { siteId: 'site1', materialSizeId: 'ms1' },
      },
      update: { quantity: { increment: 100 } },
      create: { siteId: 'site1', materialSizeId: 'ms1', quantity: 100 },
    });
    expect(godownStockUpsert).not.toHaveBeenCalled();
  });

  it('rejects a correctsId that does not reference an existing Purchase', async () => {
    const purchaseFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ purchaseFindUnique });

    await expect(
      service.create({ ...godownInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('proceeds when correctsId references an existing Purchase with matching Material Size/destination/Site', async () => {
    const purchaseFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      materialSizeId: 'ms1',
      destination: 'GODOWN',
      siteId: null,
    });
    const { service, godownStockUpsert } = makeService({ purchaseFindUnique });

    await service.create({
      ...godownInput,
      quantity: -20,
      correctsId: 'orig',
      reason: 'Recount',
    });

    expect(godownStockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: -20 } } }),
    );
  });

  it('rejects a correction whose materialSizeId does not match the original Purchase — it would apply the delta to the wrong stock row', async () => {
    const purchaseFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      materialSizeId: 'a-different-material-size',
      destination: 'GODOWN',
      siteId: null,
    });
    const { service } = makeService({ purchaseFindUnique });

    await expect(
      service.create({
        ...godownInput,
        quantity: -20,
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
    const purchaseCreate = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ purchaseCreate });

    await expect(service.create(godownInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const purchaseCreate = vi.fn().mockRejectedValue(otherError);
    const { service } = makeService({ purchaseCreate });

    await expect(service.create(godownInput)).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('PurchasesService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { purchase: { findUnique } };
    return new PurchasesService(
      prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
    );
  }

  it('throws NotFoundException when no Purchase matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns the Purchase when found', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue({ id: 'p1' }));

    await expect(service.findOne('p1')).resolves.toEqual({ id: 'p1' });
  });
});

describe('PurchasesService.listByVendor', () => {
  it('scopes to the given vendorId, newest first', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'p1' }]);
    const prisma = { purchase: { findMany } };
    const service = new PurchasesService(
      prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
    );

    const result = await service.listByVendor('v1');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { vendorId: 'v1' },
        orderBy: { purchasedAt: 'desc' },
      }),
    );
    expect(result).toEqual([{ id: 'p1' }]);
  });
});

describe('PurchasesService.summaryForVendor', () => {
  it('computes totalThisYear and notFullyPaidTotal from separate aggregates', async () => {
    const aggregate = vi
      .fn<
        (args: {
          where: { vendorId: string; paymentStatus?: { not: string } };
        }) => Promise<{ _sum: { totalAmount: { toNumber: () => number } } }>
      >()
      .mockResolvedValueOnce({
        _sum: { totalAmount: { toNumber: () => 32600 } },
      })
      .mockResolvedValueOnce({
        _sum: { totalAmount: { toNumber: () => 12450 } },
      });
    const prisma = { purchase: { aggregate } };
    const service = new PurchasesService(
      prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
    );

    const result = await service.summaryForVendor('v1');

    expect(result).toEqual({ totalThisYear: 32600, notFullyPaidTotal: 12450 });
    expect(aggregate.mock.calls[0]![0].where.vendorId).toBe('v1');
    expect(aggregate.mock.calls[1]![0].where).toEqual({
      vendorId: 'v1',
      paymentStatus: { not: 'PAID' },
    });
  });

  it('reports 0/0 for a Vendor with zero Purchases, not an error', async () => {
    const aggregate = vi
      .fn()
      .mockResolvedValue({ _sum: { totalAmount: null } });
    const prisma = { purchase: { aggregate } };
    const service = new PurchasesService(
      prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
    );

    const result = await service.summaryForVendor('v1');

    expect(result).toEqual({ totalThisYear: 0, notFullyPaidTotal: 0 });
  });
});

describe('PurchasesService.countThisMonth', () => {
  it('scopes the count to purchasedAt within the current calendar month', async () => {
    const count = vi
      .fn<
        (args: {
          where: { purchasedAt: { gte: Date; lt: Date } };
        }) => Promise<number>
      >()
      .mockResolvedValue(14);
    const prisma = { purchase: { count } };
    const service = new PurchasesService(
      prisma as unknown as ConstructorParameters<typeof PurchasesService>[0],
    );

    const result = await service.countThisMonth();

    expect(result).toBe(14);
    const { gte, lt } = count.mock.calls[0]![0].where.purchasedAt;
    expect(gte.getDate()).toBe(1);
    expect(lt.getTime()).toBeGreaterThan(gte.getTime());
  });
});
