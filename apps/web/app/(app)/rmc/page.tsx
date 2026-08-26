import Link from "next/link";
import {
  BuildingIcon,
  CorrectAction,
  DataTable,
  DropletIcon,
  PlusIcon,
  ReceiptIcon,
  RotateCcwIcon,
  StatTile,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

interface RmcEntryRow {
  id: string;
  quantityM3: string;
  grade: string;
  ratePerM3: string;
  totalAmount: string;
  invoiceOrChallanNo: string | null;
  deliveredAt: string;
  site: { id: string; name: string };
  vendor: { id: string; name: string };
}

interface RmcStats {
  totalQuantityM3: number;
  totalCost: number;
  activeVendorCount: number;
}

async function getRmcEntries(): Promise<RmcEntryRow[]> {
  const res = await fetch(`${process.env.API_URL}/rmc-entries`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC deliveries (${res.status})`);
  }
  return res.json();
}

// Task 4's stat tiles are server-computed aggregates (RmcService.statsThisMonth),
// not a client-side reduction over the unbounded list() fetch above.
async function getRmcStats(): Promise<RmcStats> {
  const res = await fetch(`${process.env.API_URL}/rmc-entries/stats/this-month`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC stats (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

const columns: DataTableColumn<RmcEntryRow>[] = [
  { header: "Vendor", cell: (row) => <span className="font-semibold">{row.vendor.name}</span> },
  { header: "Site", cell: (row) => row.site.name },
  { header: "Date", cell: (row) => formatDate(row.deliveredAt) },
  { header: "Quantity", align: "right", cell: (row) => `${row.quantityM3} m³` },
  { header: "Grade", cell: (row) => row.grade },
  { header: "Rate / m³", align: "right", cell: (row) => formatMoney(Number(row.ratePerM3)) },
  {
    header: "Total",
    align: "right",
    cell: (row) => <span className="font-semibold text-gold-700">{formatMoney(Number(row.totalAmount))}</span>,
  },
  {
    header: "Invoice #",
    cell: (row) => row.invoiceOrChallanNo ?? <span className="text-ink-500">—</span>,
  },
  {
    header: "",
    cell: (row) => (
      <div className="flex items-center justify-end">
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/rmc/${row.id}/correct`} />
      </div>
    ),
  },
];

// AC #1: RMC deliveries are their own entity, not merged into the
// Material Catalog/Inventory Transactions tables. AC #3: the row action
// here is always "Correct", never Edit/Delete (AD-9).
export default async function RmcPage() {
  const [entries, stats] = await Promise.all([getRmcEntries(), getRmcStats()]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">RMC</h1>
          <p className="text-body-sm text-ink-500">Ready-Mix Concrete deliveries — tracked separately from Material inventory</p>
        </div>
        <Link href="/rmc/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add RMC Delivery
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={<DropletIcon />} value={`${stats.totalQuantityM3} m³`} label="Total RMC this month" />
        <StatTile
          icon={<ReceiptIcon />}
          value={formatMoney(stats.totalCost)}
          label="Total RMC cost this month"
          tint="gold"
        />
        <StatTile icon={<BuildingIcon />} value={stats.activeVendorCount} label="Active RMC vendors" tint="success" />
      </div>

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          entries.length === 0
            ? {
                status: "empty",
                icon: <DropletIcon />,
                message: "No RMC deliveries logged yet.",
                action: (
                  <Link href="/rmc/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Record your first RMC Delivery
                  </Link>
                ),
              }
            : { status: "success", rows: entries }
        }
      />
    </>
  );
}
