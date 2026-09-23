import { describe, expect, it, vi } from 'vitest';
import { StockService } from './stock.service';

function makeService(overrides: {
  materialFindMany?: ReturnType<typeof vi.fn>;
  godownStockFindMany?: ReturnType<typeof vi.fn>;
  siteStockFindMany?: ReturnType<typeof vi.fn>;
}) {
  const materialFindMany =
    overrides.materialFindMany ?? vi.fn().mockResolvedValue([]);
  const godownStockFindMany =
    overrides.godownStockFindMany ?? vi.fn().mockResolvedValue([]);
  const siteStockFindMany =
    overrides.siteStockFindMany ?? vi.fn().mockResolvedValue([]);
  const prisma = {
    material: { findMany: materialFindMany },
    godownStock: { findMany: godownStockFindMany },
    siteStock: { findMany: siteStockFindMany },
  };
  const service = new StockService(
    prisma as unknown as ConstructorParameters<typeof StockService>[0],
  );
  return { service, materialFindMany, godownStockFindMany, siteStockFindMany };
}

describe('StockService.getLowStockMaterials', () => {
  it('queries only Materials with a non-null lowStockThreshold', async () => {
    const { service, materialFindMany } = makeService({});

    await service.getLowStockMaterials();

    expect(materialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { lowStockThreshold: { not: null } } }),
    );
  });

  it('includes a Material whose summed Godown balance across all its Sizes is below its threshold', async () => {
    const materialFindMany = vi.fn().mockResolvedValue([
      {
        id: 'mat-1',
        name: 'Cement',
        unit: { id: 'u1', name: 'Bags' },
        lowStockThreshold: { toString: () => '200' },
        sizes: [{ godownStock: [{ quantity: '120' }] }],
      },
    ]);
    const { service } = makeService({ materialFindMany });

    const result = await service.getLowStockMaterials();

    expect(result).toEqual([
      {
        id: 'mat-1',
        name: 'Cement',
        unit: { id: 'u1', name: 'Bags' },
        lowStockThreshold: '200',
        godownQuantity: '120',
      },
    ]);
  });

  it('excludes a Material whose summed Godown balance meets or exceeds its threshold', async () => {
    const materialFindMany = vi.fn().mockResolvedValue([
      {
        id: 'mat-1',
        name: 'Cement',
        unit: { id: 'u1', name: 'Bags' },
        lowStockThreshold: { toString: () => '200' },
        sizes: [{ godownStock: [{ quantity: '200' }] }],
      },
    ]);
    const { service } = makeService({ materialFindMany });

    const result = await service.getLowStockMaterials();

    expect(result).toEqual([]);
  });

  it('sums across multiple Sizes for the same Material before comparing against the threshold', async () => {
    const materialFindMany = vi.fn().mockResolvedValue([
      {
        id: 'mat-1',
        name: 'RCC Pipe',
        unit: { id: 'u1', name: 'Pcs' },
        lowStockThreshold: { toString: () => '50' },
        sizes: [
          { godownStock: [{ quantity: '20' }] },
          { godownStock: [{ quantity: '25' }] },
        ],
      },
    ]);
    const { service } = makeService({ materialFindMany });

    const result = await service.getLowStockMaterials();

    expect(result).toEqual([expect.objectContaining({ godownQuantity: '45' })]);
  });
});

describe('StockService.getAllSiteStock', () => {
  it('queries siteStock unscoped by siteId — one call for every Site, not one call per Site', async () => {
    const { service, siteStockFindMany } = makeService({});

    await service.getAllSiteStock();

    expect(siteStockFindMany).toHaveBeenCalledTimes(1);
    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { materialSize: undefined } }),
    );
  });

  it('narrows to one Material when materialId is given, still in a single query', async () => {
    const { service, siteStockFindMany } = makeService({});

    await service.getAllSiteStock('mat-1');

    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { materialSize: { materialId: 'mat-1' } },
      }),
    );
  });
});

describe('StockService.getStockByMaterial', () => {
  it('queries both Godown and Site balances for the Material, excluding zero-quantity rows', async () => {
    const { service, godownStockFindMany, siteStockFindMany } = makeService({});

    await service.getStockByMaterial('mat-1');

    expect(godownStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { materialSize: { materialId: 'mat-1' }, quantity: { gt: 0 } },
      }),
    );
    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { materialSize: { materialId: 'mat-1' }, quantity: { gt: 0 } },
      }),
    );
  });

  it('merges Godown and Site rows into one list, sorted by quantity descending', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([
      {
        materialSizeId: 'ms1',
        quantity: '40',
        materialSize: { label: '50kg', material: { unit: { name: 'Bags' } } },
      },
    ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([
      {
        materialSizeId: 'ms1',
        quantity: '120',
        site: { id: 'site-1', name: 'Nashik Metro' },
        materialSize: { label: '50kg', material: { unit: { name: 'Bags' } } },
      },
      {
        materialSizeId: 'ms2',
        quantity: '10',
        site: { id: 'site-2', name: 'Pune Bypass' },
        materialSize: { label: '25kg', material: { unit: { name: 'Bags' } } },
      },
    ]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.getStockByMaterial('mat-1');

    expect(result).toEqual([
      {
        location: { kind: 'site', id: 'site-1', name: 'Nashik Metro' },
        materialSizeId: 'ms1',
        sizeLabel: '50kg',
        quantity: '120',
        unit: 'Bags',
      },
      {
        location: { kind: 'godown' },
        materialSizeId: 'ms1',
        sizeLabel: '50kg',
        quantity: '40',
        unit: 'Bags',
      },
      {
        location: { kind: 'site', id: 'site-2', name: 'Pune Bypass' },
        materialSizeId: 'ms2',
        sizeLabel: '25kg',
        quantity: '10',
        unit: 'Bags',
      },
    ]);
  });

  it('returns an empty array when the Material has zero stock anywhere', async () => {
    const { service } = makeService({});

    const result = await service.getStockByMaterial('mat-1');

    expect(result).toEqual([]);
  });
});

describe('StockService.getOtherSiteStockForMaterialSize', () => {
  it('queries SiteStock excluding the given Site, zero-quantity rows, and Godown entirely', async () => {
    const { service, siteStockFindMany, godownStockFindMany } = makeService(
      {},
    );

    await service.getOtherSiteStockForMaterialSize('ms1', 'site-1');

    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          materialSizeId: 'ms1',
          siteId: { not: 'site-1' },
          quantity: { gt: 0 },
        },
      }),
    );
    expect(godownStockFindMany).not.toHaveBeenCalled();
  });

  it('returns matching Sites sorted by quantity descending, never including the excluded Site', async () => {
    const siteStockFindMany = vi.fn().mockResolvedValue([
      {
        quantity: '120',
        site: { id: 'site-2', name: 'Nashik Metro' },
        materialSize: { material: { unit: { name: 'Bags' } } },
      },
      {
        quantity: '10',
        site: { id: 'site-3', name: 'Pune Bypass' },
        materialSize: { material: { unit: { name: 'Bags' } } },
      },
    ]);
    const { service } = makeService({ siteStockFindMany });

    const result = await service.getOtherSiteStockForMaterialSize(
      'ms1',
      'site-1',
    );

    expect(result).toEqual([
      { siteId: 'site-2', siteName: 'Nashik Metro', quantity: '120', unit: 'Bags' },
      { siteId: 'site-3', siteName: 'Pune Bypass', quantity: '10', unit: 'Bags' },
    ]);
  });

  it('returns an empty array when no other Site holds a balance', async () => {
    const { service } = makeService({});

    const result = await service.getOtherSiteStockForMaterialSize(
      'ms1',
      'site-1',
    );

    expect(result).toEqual([]);
  });
});

describe('StockService.listInventory', () => {
  function godownRow(overrides: Record<string, unknown> = {}) {
    return {
      quantity: '120',
      updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      materialSize: {
        materialId: 'mat-cement',
        label: '50kg',
        material: {
          categoryId: 'cat-1',
          name: 'Cement OPC',
          category: { name: 'Cement' },
          unit: { name: 'Bags' },
        },
      },
      ...overrides,
    };
  }

  function siteRow(overrides: Record<string, unknown> = {}) {
    return {
      siteId: 'site-1',
      site: { id: 'site-1', name: 'NH-48 Highway Widening' },
      quantity: '40',
      updatedAt: new Date('2026-09-02T10:00:00.000Z'),
      materialSize: {
        materialId: 'mat-cement',
        label: '50kg',
        material: {
          categoryId: 'cat-1',
          name: 'Cement OPC',
          category: { name: 'Cement' },
          unit: { name: 'Bags' },
        },
      },
      ...overrides,
    };
  }

  it('search only: matches rows (any location) whose Material name contains the term', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ q: 'cement' });

    expect(godownStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          materialSize: {
            material: { name: { contains: 'cement', mode: 'insensitive' } },
          },
        },
      }),
    );
    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          materialSize: {
            material: { name: { contains: 'cement', mode: 'insensitive' } },
          },
        },
      }),
    );
    expect(result.rows).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('locationType=GODOWN: only Godown rows, and never even queries SiteStock', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ locationType: 'GODOWN' });

    expect(siteStockFindMany).not.toHaveBeenCalled();
    expect(result.rows).toEqual([
      expect.objectContaining({ locationType: 'GODOWN' }),
    ]);
  });

  it('locationType=SITE: only Site rows, and never even queries GodownStock', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ locationType: 'SITE' });

    expect(godownStockFindMany).not.toHaveBeenCalled();
    expect(result.rows).toEqual([
      expect.objectContaining({ locationType: 'SITE' }),
    ]);
  });

  it('locationType=GODOWN combined with a conflicting real siteId: locationType wins, still returns Godown rows (not an always-empty result)', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({
      locationType: 'GODOWN',
      siteId: 'site-1',
    });

    expect(siteStockFindMany).not.toHaveBeenCalled();
    expect(godownStockFindMany).toHaveBeenCalled();
    expect(result.rows).toEqual([
      expect.objectContaining({ locationType: 'GODOWN' }),
    ]);
  });

  it('locationType=SITE combined with the conflicting siteId="GODOWN" sentinel: locationType wins, still returns Site rows (not an always-empty result)', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({
      locationType: 'SITE',
      siteId: 'GODOWN',
    });

    expect(godownStockFindMany).not.toHaveBeenCalled();
    expect(siteStockFindMany).toHaveBeenCalled();
    expect(result.rows).toEqual([
      expect.objectContaining({ locationType: 'SITE' }),
    ]);
  });

  it("stockLevel=LOW: rows whose Material is in today's FR-36 low-stock set, even a well-stocked Site row", async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([
      godownRow({
        materialSize: {
          materialId: 'mat-low',
          label: '',
          material: {
            categoryId: 'cat-1',
            name: 'Low Cement',
            category: { name: 'Cement' },
            unit: { name: 'Bags' },
          },
        },
      }),
    ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([
      // Well-stocked at this Site, but its Material is under threshold at
      // the Godown — Design Notes: still flagged LOW (Material-level, not
      // per-row).
      siteRow({
        quantity: '999',
        materialSize: {
          materialId: 'mat-low',
          label: '',
          material: {
            categoryId: 'cat-1',
            name: 'Low Cement',
            category: { name: 'Cement' },
            unit: { name: 'Bags' },
          },
        },
      }),
    ]);
    const materialFindMany = vi.fn().mockResolvedValue([
      {
        id: 'mat-low',
        name: 'Low Cement',
        unit: { id: 'u1', name: 'Bags' },
        lowStockThreshold: { toString: () => '200' },
        sizes: [{ godownStock: [{ quantity: '120' }] }],
      },
    ]);
    const { service } = makeService({
      godownStockFindMany,
      siteStockFindMany,
      materialFindMany,
    });

    const result = await service.listInventory({ stockLevel: 'LOW' });

    expect(result.rows).toHaveLength(2);
    expect(result.rows.every((r) => r.materialId === 'mat-low')).toBe(true);
  });

  it('stockLevel=LOW excludes a Material at/above its threshold', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const materialFindMany = vi.fn().mockResolvedValue([]); // nothing below threshold
    const { service } = makeService({
      godownStockFindMany,
      siteStockFindMany,
      materialFindMany,
    });

    const result = await service.listInventory({ stockLevel: 'LOW' });

    expect(result.rows).toEqual([]);
  });

  it('stockLevel=ZERO: only rows with quantity === 0 at that location', async () => {
    const godownStockFindMany = vi
      .fn()
      .mockResolvedValue([
        godownRow({ quantity: '0' }),
        godownRow({ quantity: '5' }),
      ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ stockLevel: 'ZERO' });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.quantity).toBe('0');
  });

  it('stockLevel=AVAILABLE: only rows with quantity > 0', async () => {
    const godownStockFindMany = vi
      .fn()
      .mockResolvedValue([
        godownRow({ quantity: '0' }),
        godownRow({ quantity: '5' }),
      ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ stockLevel: 'AVAILABLE' });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.quantity).toBe('5');
  });

  it('siteId="GODOWN" sentinel: narrows to Godown rows only, same as locationType=GODOWN', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ siteId: 'GODOWN' });

    expect(siteStockFindMany).not.toHaveBeenCalled();
    expect(result.rows).toEqual([
      expect.objectContaining({ locationType: 'GODOWN' }),
    ]);
  });

  it('siteId=<real id>: narrows SiteStock to that Site and skips GodownStock entirely', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([godownRow()]);
    const siteStockFindMany = vi.fn().mockResolvedValue([siteRow()]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    await service.listInventory({ siteId: 'site-1' });

    expect(godownStockFindMany).not.toHaveBeenCalled();
    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 'site-1', materialSize: { material: {} } },
      }),
    );
  });

  it('combined filters + pagination: q + categoryId + siteId AND-combine, then slice to the requested page', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([]);
    const siteStockFindMany = vi.fn().mockResolvedValue(
      Array.from({ length: 3 }, (_, i) =>
        siteRow({
          quantity: String(i),
          materialSize: {
            materialId: `mat-${i}`,
            label: '',
            material: {
              categoryId: 'cat-1',
              name: `Sand ${i}`,
              category: { name: 'Aggregates' },
              unit: { name: 'Brass' },
            },
          },
        }),
      ),
    );
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({
      q: 'sand',
      categoryId: 'cat-1',
      siteId: 'site-1',
      page: '2',
      pageSize: '2',
    });

    expect(siteStockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          siteId: 'site-1',
          materialSize: {
            material: {
              name: { contains: 'sand', mode: 'insensitive' },
              categoryId: 'cat-1',
            },
          },
        },
      }),
    );
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
    expect(result.rows).toHaveLength(1);
  });

  it('nothing recorded anywhere: an empty result, not an error', async () => {
    const { service } = makeService({});

    const result = await service.listInventory({});

    expect(result).toEqual({ rows: [], total: 0, page: 1, pageSize: 25 });
  });

  it('filters match nothing: an empty result for a non-matching search', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({ q: 'xyz' });

    expect(result.rows).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('sorts by materialName ascending by default', async () => {
    const godownStockFindMany = vi.fn().mockResolvedValue([
      godownRow({
        materialSize: {
          materialId: 'm-z',
          label: '',
          material: {
            categoryId: 'cat-1',
            name: 'Zinc Sheet',
            category: { name: 'Metal' },
            unit: { name: 'Pcs' },
          },
        },
      }),
      godownRow({
        materialSize: {
          materialId: 'm-a',
          label: '',
          material: {
            categoryId: 'cat-1',
            name: 'Aggregate',
            category: { name: 'Aggregates' },
            unit: { name: 'Brass' },
          },
        },
      }),
    ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({});

    expect(result.rows.map((r) => r.materialName)).toEqual([
      'Aggregate',
      'Zinc Sheet',
    ]);
  });

  it('sorts by quantity descending when requested', async () => {
    const godownStockFindMany = vi
      .fn()
      .mockResolvedValue([
        godownRow({ quantity: '5' }),
        godownRow({ quantity: '50' }),
      ]);
    const siteStockFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ godownStockFindMany, siteStockFindMany });

    const result = await service.listInventory({
      sort: 'quantity',
      order: 'desc',
    });

    expect(result.rows.map((r) => r.quantity)).toEqual(['50', '5']);
  });
});
