import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface InventoryCandidate {
  id: string;
  materialId: string;
  materialName: string;
  sizeLabel: string;
  quantity: number;
  unit: string;
  location: { kind: 'godown' } | { kind: 'site'; id: string; name: string };
}

// Shared by every method below that reads GodownStock/SiteStock — a Stock
// row is never useful without its Material/Size/Unit label, so every query
// against these tables includes the same nested shape (repeated 5 times
// across this file before being pulled out here). Defined once so a future
// field addition only needs editing in one place.
const GODOWN_STOCK_INCLUDE = {
  materialSize: { include: { material: { include: { unit: true } } } },
} satisfies Prisma.GodownStockInclude;

const SITE_STOCK_INCLUDE = {
  site: true,
  materialSize: { include: { material: { include: { unit: true } } } },
} satisfies Prisma.SiteStockInclude;

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
      include: GODOWN_STOCK_INCLUDE,
      orderBy: { materialSize: { material: { name: 'asc' } } },
    });
  }

  getSiteStock(siteId: string, materialId?: string) {
    return this.prisma.siteStock.findMany({
      where: {
        siteId,
        materialSize: materialId ? { materialId } : undefined,
      },
      include: SITE_STOCK_INCLUDE,
      orderBy: { materialSize: { material: { name: 'asc' } } },
    });
  }

  // The Inventory page's "Site Stock" table used to fetch this one Site at
  // a time (one HTTP round trip per Site) and flatten the results — this is
  // the same query, unscoped, in one call. Ordered by Site name first so
  // rows for the same Site stay grouped together in the flattened list.
  getAllSiteStock(materialId?: string) {
    return this.prisma.siteStock.findMany({
      where: {
        materialSize: materialId ? { materialId } : undefined,
      },
      include: SITE_STOCK_INCLUDE,
      orderBy: [
        { site: { name: 'asc' } },
        { materialSize: { material: { name: 'asc' } } },
      ],
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
        include: GODOWN_STOCK_INCLUDE,
      }),
      this.prisma.siteStock.findMany({
        where: { materialSize: { materialId }, quantity: { gt: 0 } },
        include: SITE_STOCK_INCLUDE,
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

  // Story 16.x global search's "Inventory" group (product feedback
  // 2026-09-03): a Material's *available stock* — Godown and every Site
  // balance, "crushed sand 6 brass"-style — shown distinctly from the
  // Material master-data catalog search (MaterialsService.searchCandidates),
  // which only knows a Material's name/category, never a quantity.
  // `quantity: { gt: 0 }` mirrors getStockByMaterial's "holding a balance"
  // filter — a zero-balance row is not "available" and would be a
  // misleading search result. Two plain findMany/count calls in parallel,
  // never a per-location loop, same discipline as getStockByMaterial.
  async searchCandidates(
    q: string,
  ): Promise<{ candidates: InventoryCandidate[]; total: number }> {
    // GodownStockWhereInput and SiteStockWhereInput are structurally
    // identical for the fields used here (`quantity`, `materialSize`) —
    // one shared literal for all 4 calls below, not two independently
    // maintained copies that could drift out of sync.
    const where: Prisma.GodownStockWhereInput & Prisma.SiteStockWhereInput = {
      quantity: { gt: 0 },
      materialSize: {
        material: { name: { contains: q, mode: 'insensitive' } },
      },
    };

    const [godownRows, siteRows, godownTotal, siteTotal] = await Promise.all([
      this.prisma.godownStock.findMany({
        where,
        include: GODOWN_STOCK_INCLUDE,
        take: 200,
      }),
      this.prisma.siteStock.findMany({
        where,
        include: SITE_STOCK_INCLUDE,
        take: 200,
      }),
      this.prisma.godownStock.count({ where }),
      this.prisma.siteStock.count({ where }),
    ]);

    const candidates: InventoryCandidate[] = [
      ...godownRows.map((row) => ({
        id: `godown:${row.materialSizeId}`,
        materialId: row.materialSize.materialId,
        materialName: row.materialSize.material.name,
        sizeLabel: row.materialSize.label,
        quantity: Number(row.quantity),
        unit: row.materialSize.material.unit.name,
        location: { kind: 'godown' as const },
      })),
      ...siteRows.map((row) => ({
        id: `site:${row.siteId}:${row.materialSizeId}`,
        materialId: row.materialSize.materialId,
        materialName: row.materialSize.material.name,
        sizeLabel: row.materialSize.label,
        quantity: Number(row.quantity),
        unit: row.materialSize.material.unit.name,
        location: {
          kind: 'site' as const,
          id: row.siteId,
          name: row.site.name,
        },
      })),
    ];

    return { candidates, total: godownTotal + siteTotal };
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
