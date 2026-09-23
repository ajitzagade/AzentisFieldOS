import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ConsumptionService } from './consumption.service';

// A Decimal-like stub — every mocked Prisma row field this suite touches
// only ever needs `.toNumber()` (Consumption.quantity/siteStockQuantity/
// godownStockQuantity, SiteStock.quantity), never the rest of Decimal.js's
// surface.
const decimal = (value: number) => ({ toNumber: () => value });

function makeService(overrides: {
  consumptionCreate?: ReturnType<typeof vi.fn>;
  consumptionFindUnique?: ReturnType<typeof vi.fn>;
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
  const consumptionFindUnique = overrides.consumptionFindUnique ?? vi.fn();
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
    consumption: { create: consumptionCreate },
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
    consumption: { findUnique: consumptionFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new ConsumptionService(
    prisma as unknown as ConstructorParameters<typeof ConsumptionService>[0],
  );

  return {
    service,
    prisma,
    consumptionCreate,
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
