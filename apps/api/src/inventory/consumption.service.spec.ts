import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ConsumptionService } from './consumption.service';

// A Decimal-like stub — every mocked Prisma row field this suite touches
// only ever needs `.toNumber()` (Consumption.quantity/siteStockQuantity/
// godownStockQuantity, SiteStock.quantity), never the rest of Decimal.js's
// surface.
const decimal = (value: number) => ({ toNumber: () => value });

function makeService(overrides: {
  consumptionCreate?: ReturnType<typeof vi.fn>;
  consumptionUpdate?: ReturnType<typeof vi.fn>;
  consumptionFindUnique?: ReturnType<typeof vi.fn>;
  consumptionFindFirst?: ReturnType<typeof vi.fn>;
  siteStockUpdateMany?: ReturnType<typeof vi.fn>;
  // Bugfix (2026-09-23): the plain-create path (no correctsId) now reads
  // the current SiteStock balance first (takeConsumptionStock) to decide
  // the Site-first/Godown-fallback split, before ever calling
  // siteStock.updateMany. Defaults to a large balance so the existing
  // "applies to Site Stock" tests below keep exercising the Site leg only,
  // exactly like before this change.
  siteStockFindUnique?: ReturnType<typeof vi.fn>;
  godownStockUpdateMany?: ReturnType<typeof vi.fn>;
  // Review loop 1: the correctsId-set branch's negative-delta (give-back)
  // leg now routes through giveBackConsumptionStock, which upserts rather
  // than updateMany's — needed once a correction's give-back must reach
  // Godown Stock too, not just Site Stock.
  siteStockUpsert?: ReturnType<typeof vi.fn>;
  godownStockUpsert?: ReturnType<typeof vi.fn>;
}) {
  const consumptionCreate =
    overrides.consumptionCreate ?? vi.fn().mockResolvedValue({ id: 'c1' });
  const consumptionUpdate =
    overrides.consumptionUpdate ?? vi.fn().mockResolvedValue({ id: 'c1' });
  const consumptionFindUnique = overrides.consumptionFindUnique ?? vi.fn();
  const consumptionFindFirst =
    overrides.consumptionFindFirst ?? vi.fn().mockResolvedValue(null);
  const siteStockUpdateMany =
    overrides.siteStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const siteStockFindUnique =
    overrides.siteStockFindUnique ??
    vi.fn().mockResolvedValue({ quantity: decimal(1000) });
  const godownStockUpdateMany =
    overrides.godownStockUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const siteStockUpsert =
    overrides.siteStockUpsert ?? vi.fn().mockResolvedValue({});
  const godownStockUpsert =
    overrides.godownStockUpsert ?? vi.fn().mockResolvedValue({});

  const tx = {
    consumption: { create: consumptionCreate, update: consumptionUpdate },
    siteStock: {
      updateMany: siteStockUpdateMany,
      findUnique: siteStockFindUnique,
      upsert: siteStockUpsert,
    },
    godownStock: {
      updateMany: godownStockUpdateMany,
      upsert: godownStockUpsert,
    },
  };

  const prisma = {
    consumption: {
      findUnique: consumptionFindUnique,
      findFirst: consumptionFindFirst,
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new ConsumptionService(
    prisma as unknown as ConstructorParameters<typeof ConsumptionService>[0],
  );

  return {
    service,
    prisma,
    consumptionCreate,
    consumptionUpdate,
    consumptionFindFirst,
    siteStockUpdateMany,
    siteStockFindUnique,
    godownStockUpdateMany,
    siteStockUpsert,
    godownStockUpsert,
  };
}

const createInput = {
  siteId: 'site1',
  materialSizeId: 'ms1',
  quantity: 10,
  consumedAt: '2026-08-13',
};

describe('ConsumptionService.create', () => {
  it("applies the stock-safety floor check to the Site's SiteStock, inside a transaction", async () => {
    const { service, prisma, siteStockUpdateMany } = makeService({});

    await service.create(createInput, 'user1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 10 } },
      data: { quantity: { decrement: 10 } },
    });
  });

  it('throws BadRequestException and rolls back the Consumption insert when SiteStock is insufficient (count 0)', async () => {
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service, prisma } = makeService({ siteStockUpdateMany });

    await expect(service.create(createInput, 'user1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  // Review loop 1: the Godown-fallback branch (Site short, Godown covers
  // the remainder) was never exercised by a mocked unit test — every case
  // above defaults siteStockFindUnique to a large balance, so the fallback
  // leg never actually ran.
  it('falls back to Godown Stock for the shortfall when Site Stock alone is short, and persists the split', async () => {
    const siteStockFindUnique = vi
      .fn()
      .mockResolvedValue({ quantity: decimal(4) });
    const {
      service,
      consumptionCreate,
      siteStockUpdateMany,
      godownStockUpdateMany,
    } = makeService({ siteStockFindUnique });

    await service.create({ ...createInput, quantity: 10 }, 'user1');

    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 4 } },
      data: { quantity: { decrement: 4 } },
    });
    expect(godownStockUpdateMany).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1', quantity: { gte: 6 } },
      data: { quantity: { decrement: 6 } },
    });
    expect(consumptionCreate).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
      data: expect.objectContaining({
        siteStockQuantity: 4,
        godownStockQuantity: 6,
      }),
    });
  });

  it('rejects a correctsId that does not reference an existing Consumption', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.create(
        { ...createInput, correctsId: 'missing', reason: 'x' },
        'user1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose siteId/materialSizeId don't match the original Consumption — it would apply the delta to the wrong balance", async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      materialSizeId: 'a-different-material-size',
      deletedAt: null,
    });
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.create(
        { ...createInput, correctsId: 'orig', reason: 'x' },
        'user1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // Review loop 1: a correction's signed delta used to always hit
  // Site Stock alone via decrementStockWithFloorCheck, regardless of where
  // the original row actually drew from. These cases cover the fix: a
  // decrease gives back proportionally to the *original* row's own
  // recorded split, and an increase draws site-first-then-Godown exactly
  // like a plain create.
  describe('correctsId — signed delta routes through the split primitives', () => {
    // Original consumption: quantity 20, drawn as {site:5, godown:15} —
    // the exact scenario the spec's I/O matrix uses.
    const original = {
      id: 'orig',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(20),
      siteStockQuantity: decimal(5),
      godownStockQuantity: decimal(15),
      deletedAt: null,
    };

    it('a decrease gives back proportionally to the original split (not all to Site), and persists the signed split', async () => {
      const consumptionFindUnique = vi.fn().mockResolvedValue(original);
      const { service, consumptionCreate, siteStockUpsert, godownStockUpsert } =
        makeService({ consumptionFindUnique });

      await service.create(
        { ...createInput, quantity: -8, correctsId: 'orig', reason: 'Recount' },
        'user1',
      );

      // 8 given back at the original 5:15 (1:3) ratio -> Site +2, Godown +6.
      expect(siteStockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: { increment: 2 } },
        }),
      );
      expect(godownStockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: { increment: 6 } },
        }),
      );
      expect(consumptionCreate).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        data: expect.objectContaining({
          siteStockQuantity: -2,
          godownStockQuantity: -6,
        }),
      });
    });

    it('an increase draws site-first-then-Godown exactly like a plain create, succeeding even when Site alone cannot cover it', async () => {
      const consumptionFindUnique = vi.fn().mockResolvedValue(original);
      // Site has only 3 left (post-original-draw scenario) — an increase
      // of 8 must spill 5 into Godown rather than being wrongly rejected
      // as "Not enough Site Stock".
      const siteStockFindUnique = vi
        .fn()
        .mockResolvedValue({ quantity: decimal(3) });
      const {
        service,
        consumptionCreate,
        siteStockUpdateMany,
        godownStockUpdateMany,
      } = makeService({ consumptionFindUnique, siteStockFindUnique });

      await service.create(
        { ...createInput, quantity: 8, correctsId: 'orig', reason: 'Recount' },
        'user1',
      );

      expect(siteStockUpdateMany).toHaveBeenCalledWith({
        where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 3 } },
        data: { quantity: { decrement: 3 } },
      });
      expect(godownStockUpdateMany).toHaveBeenCalledWith({
        where: { materialSizeId: 'ms1', quantity: { gte: 5 } },
        data: { quantity: { decrement: 5 } },
      });
      expect(consumptionCreate).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        data: expect.objectContaining({
          siteStockQuantity: 3,
          godownStockQuantity: 5,
        }),
      });
    });

    it('a decrease on a Site-only original (no Godown involvement) still gives everything back to Site, matching pre-fallback behavior', async () => {
      const siteOnlyOriginal = {
        ...original,
        quantity: decimal(20),
        siteStockQuantity: decimal(20),
        godownStockQuantity: decimal(0),
      };
      const consumptionFindUnique = vi.fn().mockResolvedValue(siteOnlyOriginal);
      const { service, siteStockUpsert, godownStockUpsert } = makeService({
        consumptionFindUnique,
      });

      await service.create(
        { ...createInput, quantity: -4, correctsId: 'orig', reason: 'Recount' },
        'user1',
      );

      expect(siteStockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { quantity: { increment: 4 } } }),
      );
      expect(godownStockUpsert).not.toHaveBeenCalled();
    });
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

describe('ConsumptionService.searchCandidates', () => {
  it('ANDs the caller-supplied superseded-DSR filter with its own text-match OR, never spreading one over the other', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { consumption: { findMany, count } };
    const service = new ConsumptionService(
      prisma as unknown as ConstructorParameters<typeof ConsumptionService>[0],
    );

    await service.searchCandidates('cement', ['superseded-dsr-1']);

    const expectedWhere = {
      deletedAt: null,
      AND: [
        {
          OR: [
            { dailySiteReportId: null },
            { dailySiteReportId: { notIn: ['superseded-dsr-1'] } },
          ],
        },
        {
          OR: [
            { site: { name: { contains: 'cement', mode: 'insensitive' } } },
            {
              materialSize: {
                material: {
                  name: { contains: 'cement', mode: 'insensitive' },
                },
              },
            },
            {
              activityReference: {
                contains: 'cement',
                mode: 'insensitive',
              },
            },
            { notes: { contains: 'cement', mode: 'insensitive' } },
          ],
        },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});

// AD-9 exception (approved 2026-10-05): soft-delete.
describe('ConsumptionService.remove', () => {
  const owner = { id: 'owner1', role: 'OWNER_ADMIN' };
  const engineer = { id: 'engineer1', role: 'SITE_SUPERVISOR' };

  it('throws NotFoundException when the id does not exist', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.remove('missing', owner, 'Duplicate entry'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects deleting an already-deleted Material Used entry', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      deletedAt: new Date('2026-10-01'),
    });
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.remove('c1', owner, 'Duplicate entry'),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a Site Engineer deleting a colleague's entry", async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(20),
      siteStockQuantity: decimal(20),
      godownStockQuantity: decimal(0),
      deletedAt: null,
      recordedByUserId: 'someone-else',
    });
    const { service } = makeService({ consumptionFindUnique });

    await expect(
      service.remove('c1', engineer, 'Duplicate entry'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects deleting a Material Used entry that has been corrected', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(20),
      siteStockQuantity: decimal(20),
      godownStockQuantity: decimal(0),
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const consumptionFindFirst = vi
      .fn()
      .mockResolvedValue({ id: 'correction1' });
    const { service, consumptionUpdate } = makeService({
      consumptionFindUnique,
      consumptionFindFirst,
    });

    await expect(
      service.remove('c1', owner, 'Duplicate entry'),
    ).rejects.toThrow(BadRequestException);
    expect(consumptionUpdate).not.toHaveBeenCalled();
  });

  it('gives back the exact recorded split (Site + Godown) when deleting a positive draw', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(20),
      siteStockQuantity: decimal(5),
      godownStockQuantity: decimal(15),
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const { service, siteStockUpsert, godownStockUpsert } = makeService({
      consumptionFindUnique,
    });

    await service.remove('c1', owner, 'Duplicate entry');

    expect(siteStockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 5 } } }),
    );
    expect(godownStockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { quantity: { increment: 15 } } }),
    );
  });

  it('takes back (floor-checked) the exact recorded split when deleting a give-back correction', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(-8),
      siteStockQuantity: decimal(-2),
      godownStockQuantity: decimal(-6),
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const { service, siteStockUpdateMany, godownStockUpdateMany } = makeService(
      {
        consumptionFindUnique,
      },
    );

    await service.remove('c1', owner, 'Correction was itself wrong');

    expect(siteStockUpdateMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', materialSizeId: 'ms1', quantity: { gte: 2 } },
      data: { quantity: { decrement: 2 } },
    });
    expect(godownStockUpdateMany).toHaveBeenCalledWith({
      where: { materialSizeId: 'ms1', quantity: { gte: 6 } },
      data: { quantity: { decrement: 6 } },
    });
  });

  it('rejects deleting a give-back correction whose stock was already drawn down elsewhere (count 0)', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(-8),
      siteStockQuantity: decimal(-2),
      godownStockQuantity: decimal(-6),
      deletedAt: null,
      recordedByUserId: 'owner1',
    });
    const siteStockUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      consumptionFindUnique,
      siteStockUpdateMany,
    });

    await expect(
      service.remove('c1', owner, 'Correction was itself wrong'),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows the Owner to delete any Material Used entry, including one recorded by someone else', async () => {
    const consumptionFindUnique = vi.fn().mockResolvedValue({
      id: 'c1',
      siteId: 'site1',
      materialSizeId: 'ms1',
      quantity: decimal(20),
      siteStockQuantity: decimal(20),
      godownStockQuantity: decimal(0),
      deletedAt: null,
      recordedByUserId: 'someone-else',
    });
    const { service, consumptionUpdate } = makeService({
      consumptionFindUnique,
    });

    await service.remove('c1', owner, 'Duplicate entry');

    expect(consumptionUpdate).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        deletedAt: expect.any(Date),
        deletedByUserId: 'owner1',
        deleteReason: 'Duplicate entry',
      },
    });
  });
});
