import { DataTable, DropletIcon, type DataTableColumn } from "@azentisfieldos/ui";

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

async function getRmcEntries(): Promise<RmcEntryRow[]> {
  const res = await fetch(`${process.env.API_URL}/rmc-entries`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC deliveries (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const columns: DataTableColumn<RmcEntryRow>[] = [
  { header: "Date", cell: (row) => formatDate(row.deliveredAt) },
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Vendor", cell: (row) => row.vendor.name },
  { header: "Grade", cell: (row) => row.grade },
  { header: "Quantity", align: "right", cell: (row) => `${row.quantityM3} m³` },
  { header: "Rate / m³", align: "right", cell: (row) => `₹${Number(row.ratePerM3).toLocaleString("en-IN")}` },
  {
    header: "Total",
    align: "right",
    cell: (row) => (
      <span className="font-semibold text-gold-700">₹{Number(row.totalAmount).toLocaleString("en-IN")}</span>
    ),
  },
  {
    header: "Invoice / Challan",
    cell: (row) => row.invoiceOrChallanNo ?? <span className="text-ink-500">—</span>,
  },
];

export default async function RmcPage() {
  const entries = await getRmcEntries();
  const totalThisMonth = entries
    .filter((e) => new Date(e.deliveredAt).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + Number(e.totalAmount), 0);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">RMC Deliveries</h1>
        <p className="text-body-sm text-ink-500">
          Ready-mix concrete deliveries logged across all Sites
          {totalThisMonth > 0 ? (
            <>
              {" "}
              — <span className="font-semibold text-ink-700">₹{totalThisMonth.toLocaleString("en-IN")}</span> this
              month
            </>
          ) : null}
        </p>
      </div>

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          entries.length === 0
            ? {
                status: "empty",
                icon: <DropletIcon />,
                message: "No RMC deliveries logged yet. They're recorded as part of a Daily Site Report.",
              }
            : { status: "success", rows: entries }
        }
      />

      <p className="mt-4 text-caption text-ink-500">
        RMC deliveries are currently logged through the Daily Site Report form. A dedicated entry form is planned.
      </p>
    </>
  );
}
