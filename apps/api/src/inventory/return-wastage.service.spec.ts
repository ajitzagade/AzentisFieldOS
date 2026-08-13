import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ReturnWastageService } from './return-wastage.service';

function makeService(overrides: {
  returnWastageCreate?: ReturnType<typeof vi.fn>;
  returnWastageFindUnique?: ReturnType<typeof vi.fn>;
  siteStockUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const returnWastageCreate =
    overrides.returnWastageCreate ?? vi.fn().mockResolvedValue({ id: 'rw1' });
  const returnWastageFindUnique = overrides.returnWastageFindUnique ?? vi.fn();
  const siteStockUpdateMany =
    overrides.siteStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    returnWastage: { create: returnWastageCreate },
    siteStock: { updateMany: siteStockUpdateMany },
  };

  const prisma = {
    returnWastage: { findUnique: returnWastageFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new ReturnWastageService(
    prisma as unknown as ConstructorParameters<typeof ReturnWastageService>[0],
  );

  return { service, prisma, returnWastageCreate, siteStockUpdateMany };
}

const wastageInput = {
  siteId: 'site1',
  materialSizeId: 'ms1',
  kind: 'WASTAGE' as const,
  quantity: 5,
  recordedAt: '2026-08-13',
};

const returnInput = { ...wastageInput, kind: 'RETURN' as const };

describe('ReturnWastageService.create', () => {
  it('a WASTAGE entry decrements SiteStock via the floor-check helper, inside a transaction', async () => {
    const { service, prisma, siteStockUpdateMany } = makeService({});

    await service.create(wastageInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 5 } },
      data: { quantity: { decrement: 5 } },
    });
  });

  it('a RETURN entry decrements SiteStock identically to WASTAGE — never increases it (Dev Notes "RETURN direction")', async () => {
    const { service, siteStockUpdateMany } = makeService({});

    await service.create(returnInput);

    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 5 } },
      data: { quantity: { decrement: 5 } },
    });
  });

  it('throws BadRequestException and rolls back the insert when SiteStock is insufficient (count 0)', async () => {
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service, prisma } = makeService({ siteStockUpdateMany });

    await expect(service.create(wastageInput)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a correctsId that does not reference an existing Return/Wastage entry', async () => {
    const returnWastageFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ returnWastageFindUnique });

    await expect(
      service.create({ ...wastageInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('ReturnWastageService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { returnWastage: { findUnique } };
    return new ReturnWastageService(
      prisma as unknown as ConstructorParameters<
        typeof ReturnWastageService
      >[0],
    );
  }

  it('throws NotFoundException when no Return/Wastage entry matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
