import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MovementsService } from './movements.service';

function makeService(overrides: {
  movementCreate?: ReturnType<typeof vi.fn>;
  movementFindUnique?: ReturnType<typeof vi.fn>;
  movementFindFirst?: ReturnType<typeof vi.fn>;
  movementUpdate?: ReturnType<typeof vi.fn>;
  movementUpdateMany?: ReturnType<typeof vi.fn>;
  movementFindUniqueOrThrow?: ReturnType<typeof vi.fn>;
  godownStockUpdateMany?: ReturnType<typeof vi.fn>;
  godownStockUpsert?: ReturnType<typeof vi.fn>;
  siteStockUpdateMany?: ReturnType<typeof vi.fn>;
  siteStockUpsert?: ReturnType<typeof vi.fn>;
}) {
  const movementCreate =
    overrides.movementCreate ?? vi.fn().mockResolvedValue({ id: 'm1' });
  const movementUpdate =
    overrides.movementUpdate ?? vi.fn().mockResolvedValue({ id: 'm1' });
  const movementFindUnique = overrides.movementFindUnique ?? vi.fn();
  const movementFindFirst =
    overrides.movementFindFirst ?? vi.fn().mockResolvedValue(null);
  const movementUpdateMany =
    overrides.movementUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const movementFindUniqueOrThrow =
    overrides.movementFindUniqueOrThrow ??
    vi.fn().mockResolvedValue({ id: 'm1' });
  const godownStockUpdateMany =
    overrides.godownStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const godownStockUpsert =
    overrides.godownStockUpsert ?? vi.fn().mockResolvedValue({});
  const siteStockUpdateMany =
    overrides.siteStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const siteStockUpsert =
    overrides.siteStockUpsert ?? vi.fn().mockResolvedValue({});

  const tx = {
    movement: {
      create: movementCreate,
      update: movementUpdate,
      updateMany: movementUpdateMany,
      findUniqueOrThrow: movementFindUniqueOrThrow,
    },
    godownStock: {
      updateMany: godownStockUpdateMany,
      upsert: godownStockUpsert,
    },
    siteStock: { updateMany: siteStockUpdateMany, upsert: siteStockUpsert },
  };

  const prisma = {
    movement: { findUnique: movementFindUnique, findFirst: movementFindFirst },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new MovementsService(
    prisma as unknown as ConstructorParameters<typeof MovementsService>[0],
  );

  return {
    service,
    prisma,
    movementCreate,
    movementUpdate,
    movementFindUnique,
    movementFindFirst,
    movementUpdateMany,
    movementFindUniqueOrThrow,
    godownStockUpdateMany,
    godownStockUpsert,
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
      deletedAt: null,
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
      deletedAt: null,
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

  // Regression (2026-09-22): a mandatory separate "Confirm Receipt" step
  // used to gate every Movement's destination credit — removed as
  // unnecessary friction (reported directly). create() now credits the
  // destination immediately, the same transaction as the row insert and
  // the source-side floor check.
  it('immediately credits the destination Site — receivedQuantity = sentQuantity on the row, and a SiteStock upsert with the same amount', async () => {
    const { service, movementCreate, siteStockUpsert } = makeService({});

    await service.create(createInput);

    expect(movementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ receivedQuantity: 100 }) as object,
    });
    expect(siteStockUpsert).toHaveBeenCalledWith({
      where: {
        siteId_materialSizeId: { siteId: 'site1', materialSizeId: 'ms1' },
      },
      update: { quantity: { increment: 100 } },
      create: { siteId: 'site1', materialSizeId: 'ms1', quantity: 100 },
    });
  });

  it("a correction's signed delta mirrors onto the destination credit too, not just the source decrement", async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      deletedAt: null,
    });
    const { service, siteStockUpdateMany } = makeService({
      movementFindUnique,
    });

    await service.create({
      ...createInput,
      sentQuantity: -10,
      correctsId: 'orig',
      reason: 'Recount',
    });

    // A negative correction delta is a floor-checked decrement on the
    // destination now (bugfix), not a bare upsert increment — the same
    // technique the source leg already used, so a downward correction can
    // never drive either side of the transfer negative.
    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: {
        siteId: 'site1',
        materialSizeId: 'ms1',
        quantity: { gte: 10 },
      },
      data: { quantity: { decrement: 10 } },
    });
  });

  it('a negative correction delta that would drive the destination Site negative is rejected (count 0)', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      deletedAt: null,
    });
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      movementFindUnique,
      siteStockUpdateMany,
    });

    await expect(
      service.create({
        ...createInput,
        sentQuantity: -10,
        correctsId: 'orig',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // SITE_TO_GODOWN mirrors the GODOWN_TO_SITE tests above — the destination
  // is GodownStock instead of SiteStock here, so the same floor-check fix
  // needs its own coverage on this branch (code review finding: the fix
  // was previously only exercised via GODOWN_TO_SITE's SiteStock
  // destination, leaving the GodownStock destination branch unverified).
  it('a SITE_TO_GODOWN create immediately credits GodownStock via upsert', async () => {
    const { service, godownStockUpsert } = makeService({});

    await service.create({
      ...createInput,
      kind: 'SITE_TO_GODOWN',
      sourceSiteId: 'source-site',
      destinationSiteId: undefined,
    });

    expect(godownStockUpsert).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1' },
      update: { quantity: { increment: 100 } },
      create: { materialSizeId: 'ms1', quantity: 100 },
    });
  });

  it("a SITE_TO_GODOWN correction's negative delta floor-checks a decrement on GodownStock, not a bare upsert", async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'SITE_TO_GODOWN',
      materialSizeId: 'ms1',
      sourceSiteId: 'source-site',
      destinationSiteId: null,
      deletedAt: null,
    });
    const { service, godownStockUpdateMany, godownStockUpsert } = makeService({
      movementFindUnique,
    });

    await service.create({
      ...createInput,
      kind: 'SITE_TO_GODOWN',
      sourceSiteId: 'source-site',
      destinationSiteId: undefined,
      sentQuantity: -10,
      correctsId: 'orig',
      reason: 'Recount',
    });

    expect(godownStockUpdateMany).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1', quantity: { gte: 10 } },
      data: { quantity: { decrement: 10 } },
    });
    expect(godownStockUpsert).not.toHaveBeenCalled();
  });

  it('a SITE_TO_GODOWN negative correction that would drive GodownStock negative is rejected (count 0)', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      kind: 'SITE_TO_GODOWN',
      materialSizeId: 'ms1',
      sourceSiteId: 'source-site',
      destinationSiteId: null,
      deletedAt: null,
    });
    // Both legs target GodownStock for a correcting SITE_TO_GODOWN only
    // when the source is also a Godown, which it never is here — the
    // source leg targets SiteStock (source-site), so only the destination
    // (GodownStock) floor check needs to fail for this assertion.
    const godownStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      movementFindUnique,
      godownStockUpdateMany,
    });

    await expect(
      service.create({
        ...createInput,
        kind: 'SITE_TO_GODOWN',
        sourceSiteId: 'source-site',
        destinationSiteId: undefined,
        sentQuantity: -10,
        correctsId: 'orig',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

// No longer reachable from create() (which now credits the destination
// itself) — kept only to resolve the (shrinking, never growing) set of
// Movement rows created before this change that are still sitting at
// receivedQuantity: null.
describe('MovementsService.confirmReceipt', () => {
  it('increments SiteStock by receivedQuantity, not sentQuantity', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      receivedQuantity: null,
      destinationSiteId: 'site1',
      materialSizeId: 'ms1',
      sentQuantity: 100,
      deletedAt: null,
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
      deletedAt: null,
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
      deletedAt: null,
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
      deletedAt: null,
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

// AD-9 exception (approved 2026-10-05): soft-delete.
describe('MovementsService.remove', () => {
  const owner = { id: 'owner1', role: 'OWNER_ADMIN' };
  const engineer = { id: 'engineer1', role: 'SITE_SUPERVISOR' };

  it('throws NotFoundException when the id does not exist', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.remove('missing', owner, 'Duplicate entry'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects deleting an already-deleted Movement', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      deletedAt: new Date('2026-10-01'),
    });
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.remove('m1', owner, 'Duplicate entry'),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a Site Engineer deleting a colleague's Movement", async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      sentQuantity: { toNumber: () => 100 },
      deletedAt: null,
      recordedByUserId: 'someone-else',
    });
    const { service } = makeService({ movementFindUnique });

    await expect(
      service.remove('m1', engineer, 'Duplicate entry'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects deleting a Movement that has been corrected', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      sentQuantity: { toNumber: () => 100 },
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const movementFindFirst = vi.fn().mockResolvedValue({ id: 'correction1' });
    const { service, movementUpdate } = makeService({
      movementFindUnique,
      movementFindFirst,
    });

    await expect(
      service.remove('m1', owner, 'Duplicate entry'),
    ).rejects.toThrow(BadRequestException);
    expect(movementUpdate).not.toHaveBeenCalled();
  });

  it('reverses both legs — gives back the source, floor-checks a decrement on the destination', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      sentQuantity: { toNumber: () => 100 },
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const { service, godownStockUpdateMany, siteStockUpdateMany } = makeService(
      {
        movementFindUnique,
      },
    );

    await service.remove('m1', owner, 'Duplicate entry');

    // Source (Godown) gets its 100 back — a negated decrement is a
    // trivially-floor-checked increment.
    expect(godownStockUpdateMany).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1', quantity: { gte: -100 } },
      data: { quantity: { decrement: -100 } },
    });
    // Destination (Site) loses the 100 it was credited — floor-checked.
    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 100 } },
      data: { quantity: { decrement: 100 } },
    });
  });

  it('rejects deleting a Movement whose destination stock was already drawn down elsewhere (count 0)', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      sentQuantity: { toNumber: () => 100 },
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      movementFindUnique,
      siteStockUpdateMany,
    });

    await expect(
      service.remove('m1', owner, 'Duplicate entry'),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows a Site Engineer to delete a Movement they recorded themselves', async () => {
    const movementFindUnique = vi.fn().mockResolvedValue({
      id: 'm1',
      kind: 'GODOWN_TO_SITE',
      materialSizeId: 'ms1',
      sourceSiteId: null,
      destinationSiteId: 'site1',
      sentQuantity: { toNumber: () => 100 },
      deletedAt: null,
      recordedByUserId: 'engineer1',
    });
    const { service, movementUpdate } = makeService({ movementFindUnique });

    await service.remove('m1', engineer, 'Duplicate entry — entered twice');

    expect(movementUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        deletedAt: expect.any(Date),
        deletedByUserId: 'engineer1',
        deleteReason: 'Duplicate entry — entered twice',
      },
    });
  });
});
