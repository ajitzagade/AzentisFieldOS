import Link from "next/link";
import {
  AlertTriangleIcon,
  Badge,
  BoxIcon,
  DataTable,
  GapFlag,
  MapPinIcon,
  ReceiptIcon,
  StatTile,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

interface GodownStockRow {
  materialSizeId: string;
  quantity: string;
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface SiteStockRow {
  materialSizeId: string;
  quantity: string;
  site: { id: string; name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface LowStockMaterial {
  id: string;
  name: string;
  unit: { name: string };
  lowStockThreshold: string;
  godownQuantity: string;
}

interface SiteOption {
  id: string;
  name: string;
}

async function getGodownStock(): Promise<GodownStockRow[]> {
  const res = await fetch(`${process.env.API_URL}/stock/godown`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Godown Stock (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

// No combined "all Sites" stock endpoint exists (Task 2 scopes GET
// /stock/site/:siteId to one Site at a time) — fetch each Site's stock in
// parallel and flatten, reusing only the specified endpoints.
async function getAllSiteStock(sites: SiteOption[]): Promise<SiteStockRow[]> {
  const perSite = await Promise.all(
    sites.map(async (site) => {
      const res = await fetch(`${process.env.API_URL}/stock/site/${site.id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load Site Stock for ${site.name} (${res.status})`);
      }
      return res.json() as Promise<SiteStockRow[]>;
    }),
  );
  return perSite.flat();
}

async function getLowStockMaterials(): Promise<LowStockMaterial[]> {
  const res = await fetch(`${process.env.API_URL}/stock/low-stock`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load low-stock Materials (${res.status})`);
  }
  return res.json();
}

async function getPurchasesThisMonthCount(): Promise<number> {
  const res = await fetch(`${process.env.API_URL}/purchases/count/this-month`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Purchases This Month count (${res.status})`);
  }
  return res.json();
}

const godownColumns: DataTableColumn<GodownStockRow & { isLow: boolean }>[] = [
  { header: "Material", cell: (r) => r.materialSize.material.name },
  {
    header: "Size / Spec",
    cell: (r) => (r.materialSize.label ? r.materialSize.label : <span className="text-ink-500">—</span>),
  },
  { header: "Unit", cell: (r) => r.materialSize.material.unit.name },
  {
    header: "Qty on Hand",
    align: "right",
    cell: (r) => (
      <span className="inline-flex items-center gap-1.5">
        {r.quantity}
        {r.isLow ? <Badge variant="warning">Low</Badge> : null}
      </span>
    ),
  },
];

const siteColumns: DataTableColumn<SiteStockRow>[] = [
  { header: "Site", cell: (r) => r.site.name },
  { header: "Material", cell: (r) => `${r.materialSize.material.name}${r.materialSize.label ? ` (${r.materialSize.label})` : ""}` },
  { header: "Qty", align: "right", cell: (r) => `${r.quantity} ${r.materialSize.material.unit.name}` },
];

export default async function InventoryPage() {
  const sites = await getSites();
  const [godownStock, siteStock, lowStockMaterials, purchasesThisMonth] = await Promise.all([
    getGodownStock(),
    getAllSiteStock(sites),
    getLowStockMaterials(),
    getPurchasesThisMonthCount(),
  ]);

  const lowMaterialNames = new Set(lowStockMaterials.map((m) => m.name));
  const godownRows = godownStock.map((row) => ({
    ...row,
    isLow: lowMaterialNames.has(row.materialSize.material.name),
  }));

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Inventory</h1>
          <p className="text-body-sm text-ink-500">Godown and site-wise material stock across all Sites</p>
        </div>
        <Link href="/movements/godown-to-site/new" className={cn(buttonVariants({ variant: "secondary" }))}>
          Record Movement
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <Link href="/movements/godown-to-site/new" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
                  Transfer Stock
                </Link>
              }
            />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-card-title text-ink-900">Stock Levels</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DataTable
          columns={godownColumns}
          rowKey={(r) => r.materialSizeId}
          state={
            godownRows.length === 0
              ? { status: "empty", icon: <BoxIcon />, message: "No Godown Stock recorded yet." }
              : { status: "success", rows: godownRows }
          }
        />
        <DataTable
          columns={siteColumns}
          rowKey={(r) => `${r.site.id}-${r.materialSizeId}`}
          state={
            siteStock.length === 0
              ? { status: "empty", icon: <MapPinIcon />, message: "No Site Stock recorded yet." }
              : { status: "success", rows: siteStock }
          }
        />
      </div>
    </>
  );
}
