import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';

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
// field addition only needs editing in one place. `category: true` (added
// for the unified /inventory screen, Story below getLowStockMaterials) is
// additive — every existing consumer of these includes ignores the extra
// field, none destructure/assert an exact include shape.
const GODOWN_STOCK_INCLUDE = {
  materialSize: {
    include: { material: { include: { unit: true, category: true } } },
  },
} satisfies Prisma.GodownStockInclude;

const SITE_STOCK_INCLUDE = {
  site: true,
  materialSize: {
    include: { material: { include: { unit: true, category: true } } },
  },
} satisfies Prisma.SiteStockInclude;

// Named payload types for the two conditionally-fetched sources below —
// without these, the `wantGodown ? findMany(...) : Promise.resolve([])`
// ternary's untyped `[]` fallback widens to `never[]`, and TS's inference
// through the Promise.all/array-literal + `satisfies`-typed include loses
// the real element shape (surfacing as `any` at every `.materialSize`
// access below, an eslint no-unsafe-* error, not a real runtime issue —
// but worth avoiding rather than suppressing).
type GodownStockWithMaterial = Prisma.GodownStockGetPayload<{
  include: typeof GODOWN_STOCK_INCLUDE;
}>;
type SiteStockWithMaterial = Prisma.SiteStockGetPayload<{
  include: typeof SITE_STOCK_INCLUDE;
}>;

export type InventoryLocationType = 'GODOWN' | 'SITE';

// Unfiltered/omitted means "ALL" (no restriction) for every one of these —
// same "absence is meaningful, never a changed default" discipline as
// ListQuery (packages/shared/src/types/list-query.ts).
export interface InventoryQuery {
  q?: string;
  categoryId?: string;
  /** A real Site id (narrows to that Site's rows only), the literal
   * sentinel `"GODOWN"` (narrows to Godown rows only), or omitted (no
   * location narrowing) — independent of, and AND-combined with,
   * `locationType` below. */
  siteId?: string;
  locationType?: string;
  /** `ALL` (default) | `AVAILABLE` (quantity > 0) | `LOW` (this row's
   * Material is under its own Godown-balance threshold, FR-36 — see the
   * spec's Design Notes: this is a Material-level flag, not a per-row
   * quantity check) | `ZERO` (quantity === 0). */
  stockLevel?: string;
  /** `materialName` (default) | `quantity` | `updatedAt`. */
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
}

export interface InventoryRow {
  materialId: string;
  materialName: string;
  categoryId: string;
  categoryName: string;
  sizeLabel: string;
  unit: string;
  locationType: InventoryLocationType;
  siteId: string | null;
  siteName: string | null;
  quantity: string;
  updatedAt: Date;
}

const INVENTORY_STOCK_LEVELS = ['ALL', 'AVAILABLE', 'LOW', 'ZERO'] as const;
type InventoryStockLevel = (typeof INVENTORY_STOCK_LEVELS)[number];

function isInventoryStockLevel(
  value: string | undefined,
): value is InventoryStockLevel {
  return (
    Boolean(value) &&
    (INVENTORY_STOCK_LEVELS as readonly string[]).includes(value as string)
  );
}

const INVENTORY_SORT_KEYS = ['materialName', 'quantity', 'updatedAt'] as const;
type InventorySortKey = (typeof INVENTORY_SORT_KEYS)[number];

function isInventorySortKey(
  value: string | undefined,
): value is InventorySortKey {
  return (
    Boolean(value) &&
    (INVENTORY_SORT_KEYS as readonly string[]).includes(value as string)
  );
}

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

  // Informational-only "is this Material sitting at some other Site"
  // lookup for the DSR/Consumption stock hint (2026-09-23) — deliberately
  // separate from every write path. Consumption's actual stock-safety
  // floor check (takeConsumptionStock) only ever reads/decrements the
  // current Site's own SiteStock row and GodownStock — it has no code path
  // that touches another Site's balance at all, and this method's result
  // is never passed into that check. A Site Engineer cannot use a number
  // shown here to submit beyond what their own Site + Godown genuinely
  // hold; using this stock still requires a real, separately-recorded
  // Site-to-Site Transfer first. `quantity: { gt: 0 }` matches
  // getStockByMaterial's "holding a balance" convention; the requesting
  // Site itself is excluded since "elsewhere" only means somewhere else.
  async getOtherSiteStockForMaterialSize(materialSizeId: string, excludeSiteId: string) {
    const rows = await this.prisma.siteStock.findMany({
      where: {
        materialSizeId,
        siteId: { not: excludeSiteId },
        quantity: { gt: 0 },
      },
      include: SITE_STOCK_INCLUDE,
      orderBy: { quantity: 'desc' },
    });
    return rows.map((row) => ({
      siteId: row.site.id,
      siteName: row.site.name,
      quantity: row.quantity,
      unit: row.materialSize.material.unit.name,
    }));
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

  // Story: unified Inventory / Available Stock screen. GodownStock and
  // SiteStock are both small, current-balance tables (bounded by
  // MaterialSize × Location, never growing per transaction the way
  // Purchase/Movement/etc. do) — so, same precedent as getStockByMaterial/
  // searchCandidates above, this fetches the (already Prisma-filtered)
  // rows in full and merges/filters/sorts/paginates in application code,
  // rather than MovementsLogService's top-N-per-source merge (that trick
  // exists only because ITS sources are unbounded transaction history).
  async listInventory(
    query: InventoryQuery,
  ): Promise<PaginatedResult<InventoryRow>> {
    const { q, categoryId, siteId, locationType, stockLevel } = query;

    const knownLocationType =
      locationType === 'GODOWN' || locationType === 'SITE'
        ? locationType
        : undefined;
    const knownStockLevel = isInventoryStockLevel(stockLevel)
      ? stockLevel
      : 'ALL';

    // `siteId` doubles as a unified Location filter (a real Site id, or the
    // "GODOWN" sentinel) — AND-combined with `locationType` when they agree,
    // but an explicit `locationType` is authoritative over a *conflicting*
    // `siteId` rather than the two silently canceling each other out to an
    // always-empty result (e.g. locationType=GODOWN + a real siteId used to
    // make both wantGodown and wantSite false — nothing queried, no error).
    const wantGodown =
      knownLocationType === 'SITE'
        ? false
        : knownLocationType === 'GODOWN'
          ? true
          : !siteId || siteId === 'GODOWN';
    const wantSite =
      knownLocationType === 'GODOWN'
        ? false
        : knownLocationType === 'SITE'
          ? true
          : siteId !== 'GODOWN';
    const realSiteId = siteId && siteId !== 'GODOWN' ? siteId : undefined;

    const materialWhere: Prisma.MaterialWhereInput = {
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const [godownRows, siteRows, lowStockMaterialIds] = await Promise.all([
      wantGodown
        ? this.prisma.godownStock.findMany({
            where: { materialSize: { material: materialWhere } },
            include: GODOWN_STOCK_INCLUDE,
          })
        : Promise.resolve<GodownStockWithMaterial[]>([]),
      wantSite
        ? this.prisma.siteStock.findMany({
            where: {
              ...(realSiteId ? { siteId: realSiteId } : {}),
              materialSize: { material: materialWhere },
            },
            include: SITE_STOCK_INCLUDE,
          })
        : Promise.resolve<SiteStockWithMaterial[]>([]),
      // Only needed for the LOW quick filter — skip the extra query/work
      // otherwise (mirrors wantConsumption's superseded-lookup guard in
      // MovementsLogService).
      knownStockLevel === 'LOW'
        ? this.getLowStockMaterials().then(
            (materials) => new Set(materials.map((m) => m.id)),
          )
        : Promise.resolve(undefined),
    ]);

    let merged: InventoryRow[] = [
      ...godownRows.map((row) => ({
        materialId: row.materialSize.materialId,
        materialName: row.materialSize.material.name,
        categoryId: row.materialSize.material.categoryId,
        categoryName: row.materialSize.material.category.name,
        sizeLabel: row.materialSize.label,
        unit: row.materialSize.material.unit.name,
        locationType: 'GODOWN' as const,
        siteId: null,
        siteName: null,
        quantity: row.quantity.toString(),
        updatedAt: row.updatedAt,
      })),
      ...siteRows.map((row) => ({
        materialId: row.materialSize.materialId,
        materialName: row.materialSize.material.name,
        categoryId: row.materialSize.material.categoryId,
        categoryName: row.materialSize.material.category.name,
        sizeLabel: row.materialSize.label,
        unit: row.materialSize.material.unit.name,
        locationType: 'SITE' as const,
        siteId: row.siteId,
        siteName: row.site.name,
        quantity: row.quantity.toString(),
        updatedAt: row.updatedAt,
      })),
    ];

    // Design Notes: LOW flags a row by whether its *Material* is under
    // the Godown-balance threshold (FR-36) — never a per-row quantity
    // check. A Site-only row for a below-threshold Material stays in the
    // LOW list even if that particular row is well-stocked.
    if (knownStockLevel === 'LOW' && lowStockMaterialIds) {
      merged = merged.filter((row) => lowStockMaterialIds.has(row.materialId));
    } else if (knownStockLevel === 'AVAILABLE') {
      merged = merged.filter((row) => Number(row.quantity) > 0);
    } else if (knownStockLevel === 'ZERO') {
      merged = merged.filter((row) => Number(row.quantity) === 0);
    }

    const sortKey = isInventorySortKey(query.sort)
      ? query.sort
      : 'materialName';
    const order = query.order === 'desc' ? -1 : 1;
    merged.sort((a, b) => {
      switch (sortKey) {
        case 'quantity':
          return order * (Number(a.quantity) - Number(b.quantity));
        case 'updatedAt':
          return order * (a.updatedAt.getTime() - b.updatedAt.getTime());
        case 'materialName':
        default:
          return order * a.materialName.localeCompare(b.materialName);
      }
    });

    const pagination = paginationParams(query.page, query.pageSize);
    // Unlike paginationParams' own documented "no page/pageSize param ==
    // full unbounded result" contract (there to protect existing callers
    // of pre-existing endpoints), this is a brand-new endpoint with no
    // existing unpaginated caller to preserve — it defaults to a real page
    // the same way MovementsLogService.list does, rather than ever
    // returning every row in one response.
    const page = pagination.paginated ? pagination.page : 1;
    const pageSize = pagination.paginated ? pagination.pageSize : 25;
    const skip = pagination.paginated ? pagination.skip : 0;
    const take = pagination.paginated ? pagination.take : pageSize;

    return {
      rows: merged.slice(skip, skip + take),
      total: merged.length,
      page,
      pageSize,
    };
  }
}
