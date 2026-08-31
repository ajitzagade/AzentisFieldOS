import { authedFetch } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import {
  BuildingIcon,
  DataTable,
  DropletIcon,
  PlusIcon,
  ReceiptIcon,
  StatTile,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { RmcEntriesListClient, type RmcEntryRow } from "./rmc-entries-list-client";

interface RmcStats {
  totalQuantityM3: number;
  totalCost: number;
  activeVendorCount: number;
}

// Story 10.2 (FR-27): daily / Site-wise / Vendor-wise reporting slices.
interface RmcReportRow {
  key: string;
  label: string;
  totalQuantityM3: number;
  totalCost: number;
  entryCount: number;
}

type ReportGroupBy = "day" | "site" | "vendor";

const REPORT_TABS: { groupBy: ReportGroupBy; label: string }[] = [
  { groupBy: "day", label: "Daily" },
  { groupBy: "site", label: "By Site" },
  { groupBy: "vendor", label: "By Vendor" },
];

function resolveGroupBy(value: string | undefined): ReportGroupBy {
  return value === "site" || value === "vendor" ? value : "day";
}

interface RmcPageSearchParams {
  report?: string;
  q?: string;
  page?: string;
  pageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getRmcEntries(params: RmcPageSearchParams): Promise<PaginatedResult<RmcEntryRow>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/rmc-entries?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC deliveries (${res.status})`);
  }
  return res.json();
}

// Server-computed grouped aggregate (RmcService.report) — the totals here
// reconcile exactly to the sum of individual RmcEntry rows (AC #1).
async function getRmcReport(groupBy: ReportGroupBy): Promise<RmcReportRow[]> {
  const res = await authedFetch(`/rmc-entries/report?groupBy=${groupBy}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC report (${res.status})`);
  }
  return res.json();
}

// Task 4's stat tiles are server-computed aggregates (RmcService.statsThisMonth),
// not a client-side reduction over the unbounded list() fetch above.
async function getRmcStats(): Promise<RmcStats> {
  const res = await authedFetch(`/rmc-entries/stats/this-month`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load RMC stats (${res.status})`);
  }
  return res.json();
}

function reportColumns(groupBy: ReportGroupBy): DataTableColumn<RmcReportRow>[] {
  const firstHeader = groupBy === "day" ? "Date" : groupBy === "site" ? "Site" : "Vendor";
  return [
    {
      header: firstHeader,
      cell: (row) => (
        <span className="font-semibold">{groupBy === "day" ? formatDate(row.label) : row.label}</span>
      ),
    },
    { header: "Deliveries", align: "right", cell: (row) => row.entryCount },
    { header: "Quantity", align: "right", cell: (row) => `${row.totalQuantityM3} m³` },
    {
      header: "Total Cost",
      align: "right",
      cell: (row) => <span className="font-semibold text-gold-700">{formatMoney(row.totalCost)}</span>,
    },
  ];
}

// AC #1: RMC deliveries are their own entity, not merged into the
// Material Catalog/Inventory Transactions tables. AC #3: the row action
// here is always "Correct", never Edit/Delete (AD-9).
export default async function RmcPage({
  searchParams,
}: {
  searchParams: Promise<RmcPageSearchParams>;
}) {
  const params = await searchParams;
  const groupBy = resolveGroupBy(params.report);
  const [entriesResult, stats, report] = await Promise.all([
    getRmcEntries(params),
    getRmcStats(),
    getRmcReport(groupBy),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
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

      <RmcEntriesListClient
        rows={entriesResult.rows}
        total={entriesResult.total}
        page={entriesResult.page}
        pageSize={entriesResult.pageSize}
      />

      {/* Story 10.2 (FR-27): daily / Site-wise / Vendor-wise reporting. The
          groupBy toggle is URL-driven (?report=) so the slice stays a real
          navigable state, rendered as tab-chips (07-movements.html pattern). */}
      <section className="mt-12">
        <h2 className="mb-2 text-section-header text-ink-900">RMC Reporting</h2>
        <p className="mb-6 text-body-sm text-ink-500">
          Consumption and cost, sliced by day, Site, or Vendor — every total reconciles to the individual deliveries above.
        </p>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Group RMC reporting by">
          {REPORT_TABS.map((tab) => {
            const active = tab.groupBy === groupBy;
            return (
              <Link
                key={tab.groupBy}
                href={tab.groupBy === "day" ? "/rmc" : `/rmc?report=${tab.groupBy}`}
                role="tab"
                aria-selected={active}
                className={cn(
                  "rounded-full border px-4 py-2 text-body-sm font-semibold transition-colors duration-fast ease-(--ease-standard)",
                  active
                    ? "border-accent-teal-700 bg-accent-teal-700 text-white"
                    : "border-border-hairline bg-surface-1 text-ink-700 hover:bg-surface-2",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <DataTable
          columns={reportColumns(groupBy)}
          rowKey={(row) => row.key}
          state={
            report.length === 0
              ? {
                  status: "empty",
                  icon: <DropletIcon />,
                  message: "No RMC deliveries to report on yet.",
                }
              : { status: "success", rows: report }
          }
        />
      </section>
    </>
  );
}
