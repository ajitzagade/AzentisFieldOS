import { describe, expect, it, vi } from 'vitest';
import { StockService } from './stock.service';

function makeService(overrides: {
  materialFindMany?: ReturnType<typeof vi.fn>;
}) {
  const materialFindMany =
    overrides.materialFindMany ?? vi.fn().mockResolvedValue([]);
  const prisma = { material: { findMany: materialFindMany } };
  const service = new StockService(
    prisma as unknown as ConstructorParameters<typeof StockService>[0],
  );
  return { service, materialFindMany };
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
