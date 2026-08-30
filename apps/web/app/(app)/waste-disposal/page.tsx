import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  ArrowsIcon,
  Badge,
  Button,
  BuildingIcon,
  CorrectAction,
  DataTable,
  HashIcon,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  StatTile,
  TextField,
  TruckIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

interface SiteOption {
  id: string;
  name: string;
}

interface WasteDisposalRow {
  id: string;
  wasteType: string;
  quantityDetails: string | null;
  ownership: "OWN" | "HIRED";
  vehicleDetails: string | null;
  tripCount: number;
  ratePerTrip: string;
  otherCharges: string;
  totalAmount: string;
  disposalLocation: string | null;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | null;
  disposedAt: string;
  correctsId: string | null;
  site: { id: string; name: string };
  vendor: { id: string; name: string } | null;
  machinery: { id: string; name: string } | null;
  vehicle: { id: string; number: string } | null;
}

interface WasteDisposalSummary {
  totalCost: number;
  totalTrips: number;
  own: { cost: number; trips: number };
  hired: { cost: number; trips: number };
  byVendor: { vendorId: string; name: string; cost: number; trips: number }[];
  byWasteType: { wasteType: string; cost: number; trips: number }[];
  bySite: { siteId: string; name: string; cost: number; trips: number }[];
}

interface Filters {
  siteId?: string;
  from?: string;
  to?: string;
}

function queryString(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.siteId) params.set("siteId", filters.siteId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await authedFetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

const PAYMENT_BADGE: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  PAID: { variant: "success", label: "Paid" },
  PARTIAL: { variant: "warning", label: "Partial" },
  UNPAID: { variant: "danger", label: "Unpaid" },
};

const columns: DataTableColumn<WasteDisposalRow>[] = [
  { header: "Date", cell: (r) => <span className="text-ink-500">{formatDate(r.disposedAt)}</span> },
  { header: "Site", cell: (r) => r.site.name },
  {
    header: "Waste type",
    cell: (r) => (
      <span className="flex items-center gap-1.5">
        <span className="font-semibold">{r.wasteType}</span>
        {r.correctsId ? <Badge variant="warning">Correction</Badge> : null}
      </span>
    ),
  },
  {
    header: "Own / Hired",
    cell: (r) =>
      r.ownership === "OWN" ? <Badge variant="neutral">Own</Badge> : <Badge variant="gold">Hired</Badge>,
  },
  {
    header: "Vehicle / Party",
    cell: (r) => {
      const asset = r.machinery?.name ?? r.vehicle?.number ?? r.vehicleDetails;
      const parts = [r.vendor?.name, asset].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : <span className="text-ink-500">—</span>;
    },
  },
  { header: "Trips", align: "right", cell: (r) => <span className="tabular-nums">{r.tripCount}</span> },
  {
    header: "Total",
    align: "right",
    cell: (r) => (
      <span className="font-semibold text-gold-700 tabular-nums">
        ₹{Number(r.totalAmount).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    header: "Payment",
    cell: (r) => {
      if (!r.paymentStatus) return <span className="text-ink-500">—</span>;
      const badge = PAYMENT_BADGE[r.paymentStatus] ?? { variant: "warning" as const, label: r.paymentStatus };
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  {
    header: "",
    align: "right",
    cell: (r) => <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/waste-disposal/${r.id}/correct`} />,
  },
];

const breakdownColumns = <T,>(
  label: string,
  name: (row: T) => string,
): DataTableColumn<T>[] => [
  { header: label, cell: (r) => <span className="font-semibold">{name(r)}</span> },
  {
    header: "Trips",
    align: "right",
    cell: (r) => <span className="tabular-nums">{(r as { trips: number }).trips}</span>,
  },
  {
    header: "Cost",
    align: "right",
    cell: (r) => (
      <span className="font-semibold text-gold-700 tabular-nums">
        {formatMoney((r as { cost: number }).cost)}
      </span>
    ),
  },
];

export default async function WasteDisposalPage({
  searchParams,
}: {
  searchParams?: Promise<Filters>;
} = {}) {
  const filters = (await searchParams) ?? {};
  const qs = queryString(filters);
  const [sites, rows, summary] = await Promise.all([
    getJSON<SiteOption[]>(`/sites`),
    getJSON<WasteDisposalRow[]>(`/waste-disposals${qs}`),
    getJSON<WasteDisposalSummary>(`/waste-disposals/summary${qs}`),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Waste &amp; Disposal</h1>
          <p className="text-body-sm text-ink-500">
            Debris and waste-material removal — per-trip disposal cost by Site
          </p>
        </div>
        <Link href="/waste-disposal/new">
          <Button>
            <PlusIcon className="size-4" />
            Record Disposal
          </Button>
        </Link>
      </div>

      {/* URL-driven GET filters — same no-JS pattern as the Reports tabs, so
          every tile and table below reflects exactly the same window. */}
      <form method="GET" action="/waste-disposal" className="mb-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Site"
          name="siteId"
          defaultValue={filters.siteId ?? ""}
          options={[{ value: "", label: "All Sites" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <TextField label="From" name="from" type="date" defaultValue={filters.from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={filters.to ?? ""} />
        <div className="mb-4">
          <Button type="submit" variant="secondary" className="w-full justify-center">
            Apply filters
          </Button>
        </div>
      </form>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={<ArrowsIcon />} tint="gold" value={formatMoney(summary.totalCost)} label="Total Disposal Cost" />
        <StatTile icon={<HashIcon />} value={summary.totalTrips} label="Total Trips" />
        <StatTile
          icon={<BuildingIcon />}
          tint="gold"
          value={formatMoney(summary.hired.cost)}
          label={`Hired (${summary.hired.trips} trips)`}
        />
        <StatTile
          icon={<TruckIcon />}
          value={formatMoney(summary.own.cost)}
          label={`Own vehicles (${summary.own.trips} trips)`}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-card-title text-ink-900">By Vendor</h2>
          <DataTable
            columns={breakdownColumns<WasteDisposalSummary["byVendor"][number]>("Vendor", (r) => r.name)}
            rowKey={(r) => r.vendorId}
            state={
              summary.byVendor.length === 0
                ? { status: "empty", icon: <BuildingIcon />, message: "No hired disposals in this window." }
                : { status: "success", rows: summary.byVendor }
            }
          />
        </div>
        <div>
          <h2 className="mb-3 text-card-title text-ink-900">By Waste Type</h2>
          <DataTable
            columns={breakdownColumns<WasteDisposalSummary["byWasteType"][number]>("Waste type", (r) => r.wasteType)}
            rowKey={(r) => r.wasteType}
            state={
              summary.byWasteType.length === 0
                ? { status: "empty", icon: <ArrowsIcon />, message: "No disposals in this window." }
                : { status: "success", rows: summary.byWasteType }
            }
          />
        </div>
      </div>

      {filters.siteId ? null : (
        <div className="mb-8">
          <h2 className="mb-3 text-card-title text-ink-900">By Site</h2>
          <DataTable
            columns={breakdownColumns<WasteDisposalSummary["bySite"][number]>("Site", (r) => r.name)}
            rowKey={(r) => r.siteId}
            state={
              summary.bySite.length === 0
                ? { status: "empty", icon: <TruckIcon />, message: "No disposals in this window." }
                : { status: "success", rows: summary.bySite }
            }
          />
        </div>
      )}

      <h2 className="mb-3 text-card-title text-ink-900">Disposal Entries</h2>
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={
          rows.length === 0
            ? {
                status: "empty",
                icon: <TruckIcon />,
                message: "No Waste Disposal entries yet.",
                action: (
                  <Link href="/waste-disposal/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Record your first Disposal
                  </Link>
                ),
              }
            : { status: "success", rows }
        }
      />
    </>
  );
}
