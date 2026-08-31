import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// FR-14: stock is never a manually-editable field — GodownStock/SiteStock
// are materialized balances written only by the same transaction as the
// Purchase/Movement/Consumption/ReturnWastage row that caused the change
// (Stories 5.1-5.6). This service only reads them.
@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // Story 13.2 (FR-43): the optional `materialId` lets the Inventory Reports
  // view narrow the current-stock snapshot to a single Material. Stock is a
  // materialized *current* balance, so it carries no from/to window — only
  // the transaction history below is date-ranged. Unfiltered it is unchanged.
  getGodownStock(materialId?: string) {
    return this.prisma.godownStock.findMany({
      where: materialId ? { materialSize: { materialId } } : undefined,
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { materialSize: { material: { name: 'asc' } } },
    });
  }

  getSiteStock(siteId: string, materialId?: string) {
    return this.prisma.siteStock.findMany({
      where: {
        siteId,
        materialSize: materialId ? { materialId } : undefined,
      },
      include: {
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { materialSize: { material: { name: 'asc' } } },
    });
  }

  // Story 16.3 (AC #1): every location — the Godown and every Site — that
  // currently holds a balance of any Size of this Material, in one flat,
  // sorted list. Two plain findMany calls in parallel, never a per-Site
  // loop (the exact N+1 pattern the 2026-08-29 product review flagged).
  // `quantity: { gt: 0 }` excludes a location with a stock row but a zero
  // balance — "holding a balance" per the AC wording, and what makes a
  // truly empty result (AC #6's empty state) reachable at all.
  async getStockByMaterial(materialId: string) {
    const [godownRows, siteRows] = await Promise.all([
      this.prisma.godownStock.findMany({
        where: { materialSize: { materialId }, quantity: { gt: 0 } },
        include: {
          materialSize: { include: { material: { include: { unit: true } } } },
        },
      }),
      this.prisma.siteStock.findMany({
        where: { materialSize: { materialId }, quantity: { gt: 0 } },
        include: {
          site: true,
          materialSize: { include: { material: { include: { unit: true } } } },
        },
      }),
    ]);

    const rows = [
      ...godownRows.map((row) => ({
        location: { kind: 'godown' as const },
        materialSizeId: row.materialSizeId,
        sizeLabel: row.materialSize.label,
        quantity: row.quantity,
        unit: row.materialSize.material.unit.name,
      })),
      ...siteRows.map((row) => ({
        location: {
          kind: 'site' as const,
          id: row.site.id,
          name: row.site.name,
        },
        materialSizeId: row.materialSizeId,
        sizeLabel: row.materialSize.label,
        quantity: row.quantity,
        unit: row.materialSize.material.unit.name,
      })),
    ];

    return rows.sort((a, b) => Number(b.quantity) - Number(a.quantity));
  }

  // FR-36: a Material's Godown balance summed across all its Sizes,
  // compared against its own admin-configured threshold — never a
  // per-Size threshold (Dev Notes "Per-Material vs per-Size threshold").
  // A Material with lowStockThreshold: null is never flagged.
  async getLowStockMaterials() {
    const materials = await this.prisma.material.findMany({
      where: { lowStockThreshold: { not: null } },
      include: {
        unit: true,
        sizes: { include: { godownStock: true } },
      },
    });

    return materials
      .map((material) => {
        const godownQuantity = material.sizes.reduce(
          (sum, size) =>
            sum +
            size.godownStock.reduce(
              (s, stock) => s + Number(stock.quantity),
              0,
            ),
          0,
        );
        return {
          id: material.id,
          name: material.name,
          unit: { id: material.unit.id, name: material.unit.name },
          lowStockThreshold: material.lowStockThreshold!.toString(),
          godownQuantity: godownQuantity.toString(),
        };
      })
      .filter(
        (material) =>
          Number(material.godownQuantity) < Number(material.lowStockThreshold),
      );
  }
}
