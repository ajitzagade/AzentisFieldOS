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
