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
