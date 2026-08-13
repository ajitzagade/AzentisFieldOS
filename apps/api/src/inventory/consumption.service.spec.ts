import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ConsumptionService } from './consumption.service';

function makeService(overrides: {
  consumptionCreate?: ReturnType<typeof vi.fn>;
  consumptionFindUnique?: ReturnType<typeof vi.fn>;
  siteStockUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const consumptionCreate =
    overrides.consumptionCreate ?? vi.fn().mockResolvedValue({ id: 'c1' });
  const consumptionFindUnique = overrides.consumptionFindUnique ?? vi.fn();
  const siteStockUpdateMany =
    overrides.siteStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    consumption: { create: consumptionCreate },
    siteStock: { updateMany: siteStockUpdateMany },
  };

  const prisma = {
    consumption: { findUnique: consumptionFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new ConsumptionService(
    prisma as unknown as ConstructorParameters<typeof ConsumptionService>[0],
  );

  return { service, prisma, consumptionCreate, siteStockUpdateMany };
}

const createInput = {
  siteId: 'site1',
  materialSizeId: 'ms1',
  quantity: 10,
  consumedAt: '2026-08-13',
  recordedByUserId: 'user1',
};

describe('ConsumptionService.create', () => {
  it("applies the stock-safety floor check to the Site's SiteStock, inside a transaction", async () => {
    const { service, prisma, siteStockUpdateMany } = makeService({});

    await service.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 10 } },
      data: { quantity: { decrement: 10 } },
    });
  });

  it('throws BadRequestException and rolls back the Consumption insert when SiteStock is insufficient (count 0)', async () => {
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service, prisma } = makeService({ siteStockUpdateMany });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a correctsId that does not reference an existing Consumption', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.create({ ...createInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('ConsumptionService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { consumption: { findUnique } };
    return new ConsumptionService(
      prisma as unknown as ConstructorParameters<typeof ConsumptionService>[0],
    );
  }

  it('throws NotFoundException when no Consumption matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
