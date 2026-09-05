import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BoxIcon,
  buttonVariants,
  cn,
  DataTable,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";

interface MaterialListItem {
  id: string;
  name: string;
  unit: { name: string };
  sizes: { id: string; label: string }[];
}

type StockLocation = { kind: "godown" } | { kind: "site"; id: string; name: string };

interface StockRow {
  location: StockLocation;
  materialSizeId: string;
  sizeLabel: string;
  quantity: string;
  unit: string;
}

// Materials has no findOne endpoint — the full (bounded, catalog-sized)
// list is already fetched-then-found-by-id by every Movement "new" page's
// Material picker; this mirrors that same reuse-first pattern rather than
// adding a new endpoint just for this page's header.
async function getMaterial(id: string): Promise<MaterialListItem | null> {
  const res = await authedFetch(`/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  const materials = (await res.json()) as MaterialListItem[];
  return materials.find((material) => material.id === id) ?? null;
}

async function getStockByMaterial(id: string): Promise<StockRow[]> {
  const res = await authedFetch(`/stock/material/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load stock (${res.status})`);
  }
  return res.json();
}

function locationLabel(location: StockLocation): string {
  return location.kind === "godown" ? "Godown" : location.name;
}

// Story 16.3 AC #2/#3: reuses the existing Movement form/create path
// exactly — a Godown row opens the GODOWN_TO_SITE form, a Site row opens
// SITE_TO_SITE with that Site pre-filled as the source. No new transfer
// mechanism, no new Movement kind.
function transferHref(row: StockRow): string {
  if (row.location.kind === "godown") {
    return `/movements/godown-to-site/new?materialSizeId=${row.materialSizeId}`;
  }
  return `/movements/site-to-site/new?materialSizeId=${row.materialSizeId}&sourceSiteId=${row.location.id}`;
}

function columns(): DataTableColumn<StockRow>[] {
  return [
    { header: "Location", cell: (row) => locationLabel(row.location) },
    { header: "Size", cell: (row) => row.sizeLabel },
    {
      header: "Quantity",
      cell: (row) => `${Number(row.quantity).toLocaleString("en-IN")} ${row.unit}`,
    },
    {
      header: "",
      cell: (row) => (
        <Link href={transferHref(row)} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
          Transfer from here
        </Link>
      ),
      align: "right",
    },
  ];
}

const mobileCard: DataTableMobileCard<StockRow> = {
  primary: (row) => locationLabel(row.location),
  omitHeaders: ["Location"],
  action: (row) => (
    <Link href={transferHref(row)} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
      Transfer
    </Link>
  ),
};

export default async function MaterialAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [material, rows] = await Promise.all([getMaterial(id), getStockByMaterial(id)]);
  if (!material) {
    notFound();
  }

  return (
    <div className="max-w-200">
      <h1 className="mb-1 text-page-title text-ink-900">{material.name} — Availability</h1>
      <p className="mb-6 text-body-sm text-ink-500">
        Current balance across the Godown and every Site, sorted by quantity.
      </p>

      <DataTable
        columns={columns()}
        mobileCard={mobileCard}
        rowKey={(row) => `${row.location.kind === "godown" ? "godown" : row.location.id}-${row.materialSizeId}`}
        state={
          rows.length === 0
            ? { status: "empty", icon: <BoxIcon />, message: "Not currently in stock at any location" }
            : { status: "success", rows }
        }
      />
    </div>
  );
}
