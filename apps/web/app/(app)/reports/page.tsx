import type { ReactNode } from "react";
import Link from "next/link";
import type { FeedItem, PhotoGalleryItem } from "@azentisfieldos/shared";
import {
  AlertTriangleIcon,
  ArrowsIcon,
  BarChartIcon,
  Button,
  ClipboardIcon,
  DataTable,
  GapFlag,
  SelectField,
  TextField,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { PhotoGalleryGrid } from "../_components/photo-gallery-grid";
import {
  DeliveryStatusBadge,
  type DeliverySummary,
} from "./delivery-status-badge";

// Story 13.1: the "Recent Reports" auto-delivery log. Story 13.2 (FR-42/FR-43)
// adds the chip-row tab selector (16-reports.html) with the filterable Site and
// Inventory report views; the tab + its filters are URL-driven (?tab=&siteId=&…)
// so every slice is a real navigable state (the 07-movements.html / RMC pattern),
// rendered server-side with no client fetch. Stories 13.3/13.4 fill the Labour
// and Financial tabs on this same selector.
//
// There is deliberately NO "Send Report" control anywhere (UX-DR19): reports
// compile and deliver on a schedule with no manual send step.

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
type ReportTab = "site" | "inventory" | "labour" | "financial";

const REPORT_TABS: { tab: ReportTab; label: string }[] = [
  { tab: "site", label: "Site Reports" },
  { tab: "inventory", label: "Inventory Reports" },
  { tab: "labour", label: "Labour Reports" },
  { tab: "financial", label: "Financial Reports" },
];

function resolveTab(value: string | undefined): ReportTab {
  return value === "inventory" || value === "labour" || value === "financial"
    ? value
    : "site";
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------
interface DailyReportRow {
  id: string;
  reportType: string;
  siteId: string;
  siteName: string;
  reportDate: string;
  generatedAt: string;
  deliveries: DeliverySummary[];
}

interface SiteOption {
  id: string;
  name: string;
}

interface MaterialOption {
  id: string;
  name: string;
}

interface DsrHistoryRow {
  id: string;
  reportDate: string;
  submittedBy: { name: string };
  workCompleted: string | null;
  _count: { workRecords: number; consumptions: number };
}

interface SiteReport {
  site: { id: string; name: string; location: string; status: string } | null;
  dsrs: DsrHistoryRow[];
  photos: PhotoGalleryItem[];
  feed: FeedItem[];
}

interface StockRow {
  materialSizeId: string;
  quantity: string;
  site?: { id: string; name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface LowStockMaterial {
  id: string;
  name: string;
  unit: { name: string };
  lowStockThreshold: string;
  godownQuantity: string;
}

interface MaterialSizeRef {
  label: string;
  material: { name: string; unit: { name: string } };
}

interface PurchaseTxn {
  id: string;
  purchasedAt: string;
  quantity: string;
  site: { name: string } | null;
  materialSize: MaterialSizeRef;
}
interface MovementTxn {
  id: string;
  movedAt: string;
  sentQuantity: string;
  sourceSite: { name: string } | null;
  destinationSite: { name: string };
  materialSize: MaterialSizeRef;
}
interface ConsumptionTxn {
  id: string;
  consumedAt: string;
  quantity: string;
  site: { name: string };
  materialSize: MaterialSizeRef;
}
interface ReturnWastageTxn {
  id: string;
  recordedAt: string;
  kind: "RETURN" | "WASTAGE";
  quantity: string;
  site: { name: string };
  materialSize: MaterialSizeRef;
}

interface InventoryReport {
  godownStock: StockRow[];
  siteStock: StockRow[];
  lowStock: LowStockMaterial[];
  purchases: PurchaseTxn[];
  movements: MovementTxn[];
  consumptions: ConsumptionTxn[];
  returnWastages: ReturnWastageTxn[];
}

// ---------------------------------------------------------------------------
// Fetchers (all through apps/api over HTTP — AD-3)
// ---------------------------------------------------------------------------
function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function getDailyReports(): Promise<DailyReportRow[]> {
  const res = await fetch(`${process.env.API_URL}/reports/daily`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reports (${res.status})`);
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

async function getMaterials(): Promise<MaterialOption[]> {
  const res = await fetch(`${process.env.API_URL}/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

async function getSiteReport(params: {
  siteId?: string;
  from?: string;
  to?: string;
}): Promise<SiteReport> {
  const res = await fetch(`${process.env.API_URL}/reports/sites${query(params)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Site report (${res.status})`);
  }
  return res.json();
}

async function getInventoryReport(params: {
  siteId?: string;
  materialId?: string;
  from?: string;
  to?: string;
}): Promise<InventoryReport> {
  const res = await fetch(`${process.env.API_URL}/reports/inventory${query(params)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Inventory report (${res.status})`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const dailyReportColumns: DataTableColumn<DailyReportRow>[] = [
  { header: "Report", cell: (row) => <span className="font-semibold">{row.reportType}</span> },
  { header: "Site", cell: (row) => row.siteName },
  { header: "Period", cell: (row) => <span className="text-ink-500">{formatDate(row.reportDate)}</span> },
  {
    header: "Generated",
    cell: (row) => <span className="text-ink-500">{formatDateTime(row.generatedAt)}</span>,
  },
  {
    header: "Delivery Status",
    cell: (row) => <DeliveryStatusBadge deliveries={row.deliveries} />,
  },
];

function dsrSummary(row: DsrHistoryRow) {
  if (row.workCompleted) return row.workCompleted;
  if (row._count.consumptions > 0) {
    return `${row._count.consumptions} material ${row._count.consumptions === 1 ? "entry" : "entries"} logged`;
  }
  return <span className="text-ink-500">No summary provided</span>;
}

const dsrHistoryColumns: DataTableColumn<DsrHistoryRow>[] = [
  { header: "Date", cell: (row) => <span className="font-semibold">{formatDate(row.reportDate)}</span> },
  { header: "Submitted By", cell: (row) => row.submittedBy.name },
  { header: "Crew Present", align: "right", cell: (row) => row._count.workRecords },
  { header: "Summary", cell: (row) => dsrSummary(row) },
];

const feedColumns: DataTableColumn<FeedItem>[] = [
  { header: "Date", cell: (row) => <span className="text-ink-500">{formatDate(row.occurredAt)}</span> },
  { header: "Type", cell: (row) => row.type.replace(/_/g, " ") },
  { header: "Activity", cell: (row) => row.summary },
  {
    header: "Amount",
    align: "right",
    cell: (row) =>
      row.amount === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        <span className="font-semibold text-gold-700">{formatMoney(row.amount)}</span>
      ),
  },
];

const godownStockColumns: DataTableColumn<StockRow>[] = [
  { header: "Material", cell: (r) => r.materialSize.material.name },
  {
    header: "Size / Spec",
    cell: (r) => (r.materialSize.label ? r.materialSize.label : <span className="text-ink-500">—</span>),
  },
  { header: "Unit", cell: (r) => r.materialSize.material.unit.name },
  { header: "Qty on Hand", align: "right", cell: (r) => r.quantity },
];

const siteStockColumns: DataTableColumn<StockRow>[] = [
  { header: "Site", cell: (r) => r.site?.name ?? "—" },
  {
    header: "Material",
    cell: (r) =>
      `${r.materialSize.material.name}${r.materialSize.label ? ` (${r.materialSize.label})` : ""}`,
  },
  { header: "Qty", align: "right", cell: (r) => `${r.quantity} ${r.materialSize.material.unit.name}` },
];

// A single chronological transaction history merged from the four append-only
// inventory sources (Epic 5 Stories 5.1–5.6) — the report-oriented view Story
// 5.7's live Inventory page does not itself present.
interface TransactionRow {
  key: string;
  date: string;
  type: string;
  material: string;
  site: string;
  quantity: string;
}

const transactionColumns: DataTableColumn<TransactionRow>[] = [
  { header: "Date", cell: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
  { header: "Type", cell: (r) => <span className="font-semibold">{r.type}</span> },
  { header: "Material", cell: (r) => r.material },
  { header: "Site", cell: (r) => r.site },
  { header: "Quantity", align: "right", cell: (r) => r.quantity },
];

function materialLabel(ms: MaterialSizeRef) {
  return `${ms.material.name}${ms.label ? ` (${ms.label})` : ""}`;
}

function mergeTransactions(report: InventoryReport): TransactionRow[] {
  const rows: TransactionRow[] = [
    ...report.purchases.map((p): TransactionRow => ({
      key: `pu-${p.id}`,
      date: p.purchasedAt,
      type: "Purchase",
      material: materialLabel(p.materialSize),
      site: p.site?.name ?? "Godown",
      quantity: `${p.quantity} ${p.materialSize.material.unit.name}`,
    })),
    ...report.movements.map((m): TransactionRow => ({
      key: `mo-${m.id}`,
      date: m.movedAt,
      type: "Movement",
      material: materialLabel(m.materialSize),
      site: `${m.sourceSite?.name ?? "Godown"} → ${m.destinationSite.name}`,
      quantity: `${m.sentQuantity} ${m.materialSize.material.unit.name}`,
    })),
    ...report.consumptions.map((c): TransactionRow => ({
      key: `co-${c.id}`,
      date: c.consumedAt,
      type: "Consumption",
      material: materialLabel(c.materialSize),
      site: c.site.name,
      quantity: `${c.quantity} ${c.materialSize.material.unit.name}`,
    })),
    ...report.returnWastages.map((r): TransactionRow => ({
      key: `rw-${r.id}`,
      date: r.recordedAt,
      type: r.kind === "WASTAGE" ? "Wastage" : "Return",
      material: materialLabel(r.materialSize),
      site: r.site.name,
      quantity: `${r.quantity} ${r.materialSize.material.unit.name}`,
    })),
  ];
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

// ---------------------------------------------------------------------------
// Filter form (a native GET form → URL-driven server re-render, no client JS)
// ---------------------------------------------------------------------------
function FilterForm({
  tab,
  children,
}: {
  tab: ReportTab;
  children: ReactNode;
}) {
  return (
    <form
      method="get"
      action="/reports"
      className="mb-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <input type="hidden" name="tab" value={tab} />
      {children}
      <Button type="submit" variant="secondary" className="mb-4">
        Apply filters
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Tab views
// ---------------------------------------------------------------------------
function SiteReportView({
  sites,
  effectiveSiteId,
  report,
  from,
  to,
}: {
  sites: SiteOption[];
  effectiveSiteId?: string;
  report: SiteReport | null;
  from?: string;
  to?: string;
}) {
  if (sites.length === 0 || !report) {
    return (
      <DataTable
        columns={dsrHistoryColumns}
        rowKey={(row) => row.id}
        state={{ status: "empty", icon: <ClipboardIcon />, message: "No Sites yet." }}
      />
    );
  }

  return (
    <>
      <FilterForm tab="site">
        <SelectField
          label="Site"
          name="siteId"
          defaultValue={effectiveSiteId}
          options={sites.map((site) => ({ value: site.id, label: site.name }))}
        />
        <TextField label="From" name="from" type="date" defaultValue={from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={to ?? ""} />
      </FilterForm>

      <h2 className="mb-3 text-card-title text-ink-900">DSR History</h2>
      <DataTable
        columns={dsrHistoryColumns}
        rowKey={(row) => row.id}
        rowHref={(row) => `/daily-activity/${row.id}`}
        state={
          report.dsrs.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No Daily Site Reports in this date range.",
              }
            : { status: "success", rows: report.dsrs }
        }
      />

      <h2 className="mb-3 mt-8 text-card-title text-ink-900">Activity History</h2>
      <DataTable
        columns={feedColumns}
        rowKey={(row) => `${row.type}-${row.id}`}
        state={
          report.feed.length === 0
            ? { status: "empty", message: "No activity recorded in this date range." }
            : { status: "success", rows: report.feed }
        }
      />

      <h2 className="mb-3 mt-8 text-card-title text-ink-900">Site Photos</h2>
      {report.photos.length === 0 ? (
        <p className="text-body-sm text-ink-500">No photos in this date range.</p>
      ) : (
        <PhotoGalleryGrid photos={report.photos} />
      )}
    </>
  );
}

function InventoryReportView({
  sites,
  materials,
  report,
  siteId,
  materialId,
  from,
  to,
}: {
  sites: SiteOption[];
  materials: MaterialOption[];
  report: InventoryReport;
  siteId?: string;
  materialId?: string;
  from?: string;
  to?: string;
}) {
  const transactions = mergeTransactions(report);

  return (
    <>
      <FilterForm tab="inventory">
        <SelectField
          label="Site"
          name="siteId"
          defaultValue={siteId ?? ""}
          options={[
            { value: "", label: "All Sites" },
            ...sites.map((site) => ({ value: site.id, label: site.name })),
          ]}
        />
        <SelectField
          label="Material"
          name="materialId"
          defaultValue={materialId ?? ""}
          options={[
            { value: "", label: "All Materials" },
            ...materials.map((material) => ({ value: material.id, label: material.name })),
          ]}
        />
        <TextField label="From" name="from" type="date" defaultValue={from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={to ?? ""} />
      </FilterForm>

      <h2 className="mb-3 text-card-title text-ink-900">Low-stock Alerts</h2>
      {report.lowStock.length === 0 ? (
        <p className="mb-8 text-body-sm text-ink-500">
          No Materials are currently below their configured threshold.
        </p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {report.lowStock.map((material) => (
            <GapFlag
              key={material.id}
              icon={<AlertTriangleIcon />}
              message={`${material.name} is low in Godown stock — ${material.godownQuantity} ${material.unit.name} on hand against a ${material.lowStockThreshold} ${material.unit.name} configured threshold.`}
              action={
                <Link
                  href="/movements/godown-to-site/new"
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

      <h2 className="mb-3 text-card-title text-ink-900">Current Stock</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DataTable
          columns={godownStockColumns}
          rowKey={(r) => r.materialSizeId}
          state={
            report.godownStock.length === 0
              ? { status: "empty", message: "No Godown Stock recorded." }
              : { status: "success", rows: report.godownStock }
          }
        />
        <DataTable
          columns={siteStockColumns}
          rowKey={(r) => `${r.site?.id ?? ""}-${r.materialSizeId}`}
          state={
            report.siteStock.length === 0
              ? {
                  status: "empty",
                  message: siteId
                    ? "No Site Stock recorded for this Site."
                    : "Select a Site to view its Site Stock.",
                }
              : { status: "success", rows: report.siteStock }
          }
        />
      </div>

      <h2 className="mb-3 text-card-title text-ink-900">Transaction History</h2>
      <DataTable
        columns={transactionColumns}
        rowKey={(r) => r.key}
        state={
          transactions.length === 0
            ? { status: "empty", message: "No inventory transactions in this date range." }
            : { status: "success", rows: transactions }
        }
      />
    </>
  );
}

function PlaceholderView({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-1 px-6 py-16 text-center text-ink-500 shadow-1">
      <p>{label} arrive in a later story on this same selector.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    siteId?: string;
    materialId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { tab: tabParam, siteId, materialId, from, to } = await searchParams;
  const tab = resolveTab(tabParam);

  // The always-visible delivery log (Story 13.1).
  const reports = await getDailyReports();

  // Only fetch what the active tab needs. A Site report is inherently per-Site,
  // so default to the first Site when none is selected — the view is never
  // blank on first load.
  let sites: SiteOption[] = [];
  let materials: MaterialOption[] = [];
  let siteReport: SiteReport | null = null;
  let effectiveSiteId: string | undefined;
  let inventoryReport: InventoryReport | null = null;

  if (tab === "site") {
    sites = await getSites();
    if (sites.length > 0) {
      effectiveSiteId = siteId ?? sites[0]!.id;
      siteReport = await getSiteReport({ siteId: effectiveSiteId, from, to });
    }
  } else if (tab === "inventory") {
    [sites, materials] = await Promise.all([getSites(), getMaterials()]);
    inventoryReport = await getInventoryReport({ siteId, materialId, from, to });
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Reports</h1>
        <p className="text-body-sm text-ink-500">
          Reports generate and deliver automatically — no manual step required.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Report type">
        {REPORT_TABS.map((item) => {
          const active = item.tab === tab;
          return (
            <Link
              key={item.tab}
              href={item.tab === "site" ? "/reports" : `/reports?tab=${item.tab}`}
              role="tab"
              aria-selected={active}
              className={cn(
                "rounded-full border px-4 py-2 text-body-sm font-semibold transition-colors duration-fast ease-(--ease-standard)",
                active
                  ? "border-accent-teal-700 bg-accent-teal-700 text-white"
                  : "border-border-hairline bg-surface-1 text-ink-700 hover:bg-surface-2",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <section className="mb-12">
        {tab === "site" ? (
          <SiteReportView
            sites={sites}
            effectiveSiteId={effectiveSiteId}
            report={siteReport}
            from={from}
            to={to}
          />
        ) : tab === "inventory" && inventoryReport ? (
          <InventoryReportView
            sites={sites}
            materials={materials}
            report={inventoryReport}
            siteId={siteId}
            materialId={materialId}
            from={from}
            to={to}
          />
        ) : tab === "labour" ? (
          <PlaceholderView label="Labour Reports" />
        ) : (
          <PlaceholderView label="Financial Reports" />
        )}
      </section>

      <div className="mb-4 flex items-center gap-2">
        <BarChartIcon className="size-4 text-accent-teal-700" />
        <h2 className="text-card-title text-ink-900">Recent Reports</h2>
      </div>

      <DataTable
        columns={dailyReportColumns}
        rowKey={(row) => row.id}
        rowHref={(row) => `/reports/daily/${row.id}`}
        state={
          reports.length === 0
            ? {
                status: "empty",
                message:
                  "No reports yet. A branded Daily Site Report compiles and delivers automatically once a Site submits its first DSR.",
              }
            : { status: "success", rows: reports }
        }
      />
    </>
  );
}
