import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import {
  AlertTriangleIcon,
  ArrowsIcon,
  BoxIcon,
  GapFlag,
  MapPinIcon,
  PlusIcon,
  ReceiptIcon,
  StatTile,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";
import { InventoryListClient, type InventoryRow } from "./inventory-list-client";

interface LowStockMaterial {
  id: string;
  name: string;
  unit: { name: string };
  lowStockThreshold: string;
  godownQuantity: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface InventoryPageSearchParams {
  q?: string;
  categoryId?: string;
  siteId?: string;
  locationType?: string;
  stockLevel?: string;
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
}

async function getLowStockMaterials(): Promise<LowStockMaterial[]> {
  const res = await authedFetch(`/stock/low-stock`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load low-stock Materials (${res.status})`);
  }
  return res.json();
}

async function getPurchasesThisMonthCount(): Promise<number> {
  const res = await authedFetch(`/purchases/count/this-month`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Purchases This Month count (${res.status})`);
  }
  return res.json();
}

async function getCategories(): Promise<CategoryOption[]> {
  const res = await authedFetch(`/material-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Material Categories (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getInventory(params: InventoryPageSearchParams): Promise<PaginatedResult<InventoryRow>> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  if (!query.has("page")) query.set("page", "1");

  const res = await authedFetch(`/stock/inventory?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Inventory (${res.status})`);
  }
  return res.json();
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<InventoryPageSearchParams>;
}) {
  const params = await searchParams;
  const [inventory, lowStockMaterials, purchasesThisMonth, categories, sites] = await Promise.all([
    getInventory(params),
    getLowStockMaterials(),
    getPurchasesThisMonthCount(),
    getCategories(),
    getSites(),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Inventory</h1>
          <p className="text-body-sm text-ink-500">Godown and site-wise material stock across all Sites</p>
        </div>
        <div className="action-button-row">
          <Link href="/movements/godown-to-site/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <ArrowsIcon className="size-4" />
            Godown to Site
          </Link>
          <Link href="/movements/purchases/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Record Material Purchase
          </Link>
        </div>
      </div>

      {/* Hidden below sm: on a phone these four cards (two of them permanent
          "not yet available" placeholders) filled the entire viewport above
          the actual Stock Levels list the user came here for — confirmed via
          screenshot. Kept as a compact row on tablet/desktop where they don't
          crowd out the list below. */}
      <div className="mb-8 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<BoxIcon />}
          value={<span className="text-ink-500">—</span>}
          label="Godown Stock Value (not yet available)"
        />
        <StatTile
          icon={<MapPinIcon />}
          value={<span className="text-ink-500">—</span>}
          label="Site Stock Value (not yet available)"
          tint="gold"
        />
        <StatTile icon={<AlertTriangleIcon />} value={lowStockMaterials.length} label="Low-stock Materials" tint="danger" />
        <StatTile icon={<ReceiptIcon />} value={purchasesThisMonth} label="Purchases This Month" />
      </div>

      <h2 className="mb-3 text-card-title text-ink-900">Alerts</h2>
      {lowStockMaterials.length === 0 ? (
        <p className="mb-8 text-body-sm text-ink-500">No Materials are currently below their configured threshold.</p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {lowStockMaterials.map((material) => (
            <GapFlag
              key={material.id}
              icon={<AlertTriangleIcon />}
              message={`${material.name} is low in Godown stock — ${material.godownQuantity} ${material.unit.name} on hand against a ${material.lowStockThreshold} ${material.unit.name} configured threshold.`}
              action={
                <Link
                  // ?materialId= pre-fills the movement form's Material
                  // picker (when the Material has a single size) — the flag
                  // already knows what's low; don't make the user re-find it.
                  href={`/movements/godown-to-site/new?materialId=${material.id}`}
                  className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                >
                  <ArrowsIcon className="size-4" />
                  Transfer Stock
                </Link>
              }
            />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-card-title text-ink-900">Stock Levels</h2>
      <InventoryListClient
        rows={inventory.rows}
        total={inventory.total}
        page={inventory.page}
        pageSize={inventory.pageSize}
        categories={categories}
        sites={sites}
      />
    </>
  );
}
