import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MovementsService } from './movements.service';

function makeService(overrides: {
  movementCreate?: ReturnType<typeof vi.fn>;
  movementFindUnique?: ReturnType<typeof vi.fn>;
  movementUpdateMany?: ReturnType<typeof vi.fn>;
  movementFindUniqueOrThrow?: ReturnType<typeof vi.fn>;
  godownStockUpdateMany?: ReturnType<typeof vi.fn>;
  siteStockUpdateMany?: ReturnType<typeof vi.fn>;
  siteStockUpsert?: ReturnType<typeof vi.fn>;
}) {
  const movementCreate =
    overrides.movementCreate ?? vi.fn().mockResolvedValue({ id: 'm1' });
  const movementFindUnique = overrides.movementFindUnique ?? vi.fn();
  const movementUpdateMany =
    overrides.movementUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const movementFindUniqueOrThrow =
    overrides.movementFindUniqueOrThrow ??
    vi.fn().mockResolvedValue({ id: 'm1' });
  const godownStockUpdateMany =
    overrides.godownStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const siteStockUpdateMany =
    overrides.siteStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const siteStockUpsert =
    overrides.siteStockUpsert ?? vi.fn().mockResolvedValue({});

  const tx = {
    movement: {
      create: movementCreate,
      updateMany: movementUpdateMany,
      findUniqueOrThrow: movementFindUniqueOrThrow,
    },
    godownStock: { updateMany: godownStockUpdateMany },
    siteStock: { updateMany: siteStockUpdateMany, upsert: siteStockUpsert },
  };

  const prisma = {
    movement: { findUnique: movementFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new MovementsService(
    prisma as unknown as ConstructorParameters<typeof MovementsService>[0],
  );

  return {
    service,
    prisma,
    movementCreate,
    movementFindUnique,
    movementUpdateMany,
    movementFindUniqueOrThrow,
    godownStockUpdateMany,
    siteStockUpdateMany,
    siteStockUpsert,
  };
}

const createInput = {
  kind: 'GODOWN_TO_SITE' as const,
  materialSizeId: 'ms1',
  destinationSiteId: 'site1',
  sentQuantity: 100,
  movedAt: '2026-08-13',
};

describe('MovementsService.create', () => {
  it('applies the stock-safety floor check via updateMany with a gte filter, inside a transaction', async () => {
    const { service, prisma, godownStockUpdateMany } = makeService({});

    await service.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(godownStockUpdateMany).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1', quantity: { gte: 100 } },
      data: { quantity: { decrement: 100 } },
    });
  });

  it('throws BadRequestException and rolls back the Movement insert when GodownStock is insufficient (count 0)', async () => {
    const godownStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service, prisma } = makeService({ godownStockUpdateMany });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
    // The transaction callback itself threw, so Prisma would roll back the
    // insert that already ran inside it — asserted at the unit level as
    // "the transaction rejected," matching Dev Notes' guidance not to
    // assert on two separate calls.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a correctsId that does not reference an existing Movement', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.create({ ...createInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose kind/materialSizeId/Site(s) don't match the original Movement — it would apply the delta to the wrong balance", async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'a-different-material-size',
      sourceSiteId: null,
      destinationSiteId: 'site1',
    });
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.create({ ...createInput, correctsId: 'orig', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('proceeds when correctsId references an existing Movement with a matching kind/materialSizeId/Site(s)', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
    });
    const { service, godownStockUpdateMany } = makeService({
      movementFindUnique,
    });

    await service.create({
      ...createInput,
      sentQuantity: -10,
      correctsId: 'orig',
      reason: 'Recount',
    });

    expect(godownStockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: { decrement: -10 } } }),
    );
  });

  it("Story 5.4: a SITE_TO_SITE create applies the floor check to the source Site's SiteStock, never GodownStock", async () => {
    const { service, godownStockUpdateMany, siteStockUpdateMany } = makeService(
      {},
    );

    await service.create({
      ...createInput,
      kind: 'SITE_TO_SITE',
      sourceSiteId: 'source-site',
    });

    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: {
        siteId: 'source-site',
        materialSizeId: 'ms1',
        quantity: { gte: 100 },
      },
      data: { quantity: { decrement: 100 } },
    });
    expect(godownStockUpdateMany).not.toHaveBeenCalled();
  });

  it('Story 5.4: rejects a SITE_TO_SITE create when the source Site has insufficient SiteStock (count 0)', async () => {
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({ siteStockUpdateMany });

    await expect(
      service.create({
        ...createInput,
        kind: 'SITE_TO_SITE',
        sourceSiteId: 'source-site',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('MovementsService.confirmReceipt', () => {
  it('increments SiteStock by receivedQuantity, not sentQuantity', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      receivedQuantity: null,
      destinationSiteId: 'site1',
      materialSizeId: 'ms1',
      sentQuantity: 100,
    });
    const { service, siteStockUpsert } = makeService({ movementFindUnique });

    await service.confirmReceipt('m1', { receivedQuantity: 90 });

    expect(siteStockUpsert).toHaveBeenCalledWith({
      where: {
        siteId_materialSizeId: { siteId: 'site1', materialSizeId: 'ms1' },
      },
      update: { quantity: { increment: 90 } },
      create: { siteId: 'site1', materialSizeId: 'ms1', quantity: 90 },
    });
  });

  it('throws NotFoundException for a Movement id that does not exist', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.confirmReceipt('missing', { receivedQuantity: 90 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects a second confirmation once receivedQuantity is already set', async () => {
    // The "already confirmed" guard now lives in updateMany's WHERE clause
    // (receivedQuantity: null), not a plain findUnique read — count: 0 is
    // how that guard reports "no row matched" here.
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      receivedQuantity: 90,
      destinationSiteId: 'site1',
      materialSizeId: 'ms1',
      sentQuantity: 100,
    });
    const movementUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service, siteStockUpsert } = makeService({
      movementFindUnique,
      movementUpdateMany,
    });

    await expect(
      service.confirmReceipt('m1', { receivedQuantity: 95 }),
    ).rejects.toThrow(BadRequestException);
    expect(siteStockUpsert).not.toHaveBeenCalled();
  });

  it('guards the "already confirmed" check with updateMany\'s WHERE clause (receivedQuantity: null), not a separate read-then-write', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      receivedQuantity: null,
      destinationSiteId: 'site1',
      materialSizeId: 'ms1',
      sentQuantity: 100,
    });
    const { service, movementUpdateMany } = makeService({ movementFindUnique });

    await service.confirmReceipt('m1', { receivedQuantity: 90 });

    expect(movementUpdateMany).toHaveBeenCalledWith({
      where: { id: 'm1', receivedQuantity: null },
      data: { receivedQuantity: 90 },
    });
  });
});

describe('MovementsService.searchCandidates', () => {
  it('matches the linked Material/source-Site/destination-Site name and free-text notes, all case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { movement: { findMany, count } };
    const service = new MovementsService(
      prisma as unknown as ConstructorParameters<typeof MovementsService>[0],
    );

    await service.searchCandidates('steel');

    const expectedWhere = {
      OR: [
        {
          materialSize: {
            material: { name: { contains: 'steel', mode: 'insensitive' } },
          },
        },
        { sourceSite: { name: { contains: 'steel', mode: 'insensitive' } } },
        {
          destinationSite: {
            name: { contains: 'steel', mode: 'insensitive' },
          },
        },
        { notes: { contains: 'steel', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
