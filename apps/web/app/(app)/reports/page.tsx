import { authedFetch } from "@/lib/api";
import type { ReactNode } from "react";
import Link from "next/link";
import type { FeedItem, PhotoGalleryItem } from "@azentisfieldos/shared";
import {
  AlertTriangleIcon,
  ArrowsIcon,
  Badge,
  BarChartIcon,
  Button,
  CalendarIcon,
  ClipboardIcon,
  DataTable,
  GapFlag,
  GearIcon,
  SelectField,
  StatTile,
  TextField,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { PhotoGalleryGrid } from "../_components/photo-gallery-grid";
import { statusBadge, type AssetLocationStatus } from "../machinery-vehicles/status-badge";
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
type ReportTab = "site" | "inventory" | "labour" | "machinery" | "financial";

const REPORT_TABS: { tab: ReportTab; label: string }[] = [
  { tab: "site", label: "Site Reports" },
  { tab: "inventory", label: "Inventory Reports" },
  { tab: "labour", label: "Labour Reports" },
  { tab: "machinery", label: "Machinery/Vehicle Reports" },
  { tab: "financial", label: "Financial Reports" },
];

function resolveTab(value: string | undefined): ReportTab {
  return value === "inventory" ||
    value === "labour" ||
    value === "machinery" ||
    value === "financial"
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

// ---- Labour report (Story 13.3, FR-44) ----
interface TeamMemberOption {
  id: string;
  name: string;
}

interface LabourWorkRecord {
  id: string;
  workDate: string;
  attended: boolean;
  hours: string | null;
  overtimeHours: string | null;
  teamMember: { id: string; name: string };
  site: { id: string; name: string };
}

interface LabourPayment {
  id: string;
  netPayable: string;
  payPeriod: string | null;
  status: string;
  createdAt: string;
  teamMember: { id: string; name: string };
}

interface LabourAdvance {
  id: string;
  amount: string;
  reason: string | null;
  givenAt: string;
  teamMember: { id: string; name: string };
}

interface LabourAdjustment {
  id: string;
  amount: string;
  note: string | null;
  adjustedAt: string;
  advance: { teamMember: { id: string; name: string } };
}

interface OutstandingRow {
  teamMemberId: string;
  name: string;
  outstandingAdvanceBalance: string;
}

interface LabourReport {
  summary: {
    totalTeamMembers: number;
    todaysWorkingHeadcount: number;
    weeklyPaymentTotal: number;
    monthlyPaymentTotal: number;
  };
  outstanding: { total: number; byTeamMember: OutstandingRow[] };
  workRecords: LabourWorkRecord[];
  payments: LabourPayment[];
  advances: LabourAdvance[];
  adjustments: LabourAdjustment[];
}

// ---- Machinery/Vehicle report (Story 13.3, FR-45) ----
interface AssetRegisterRow {
  id: string;
  name?: string;
  number?: string;
  assetNumber?: string;
  type: { name: string };
  currentStatus: AssetLocationStatus;
  currentSite: { name: string } | null;
}

interface AssetDetail {
  id: string;
  name?: string;
  number?: string;
  assetNumber?: string;
  model?: string | null;
  ownership?: string | null;
  operator?: string | null;
  driver?: string | null;
  type: { name: string };
  currentStatus: AssetLocationStatus;
  currentSite: { name: string } | null;
}

interface AssetMovementRow {
  id: string;
  toStatus: AssetLocationStatus;
  site: { name: string } | null;
  movedAt: string;
  reason: string | null;
}

interface AssetServiceRow {
  id: string;
  kind: "FUEL" | "MAINTENANCE" | "REPAIR";
  notes: string | null;
  cost: string | null;
  serviceDate: string;
}

interface MachineryReport {
  machinery: AssetRegisterRow[];
  vehicles: AssetRegisterRow[];
  asset: AssetDetail | null;
  movements: AssetMovementRow[];
  serviceLogs: AssetServiceRow[];
}

// ---- Financial report (Story 13.4, FR-46) ----
interface FinancialSiteRow {
  siteId: string;
  name: string;
  material: number;
  // Structurally Contractor-level only (Payment/ServiceLog carry no siteId), so
  // these are null in a per-Site row — never a fabricated 0.
  labour: null;
  rmc: number;
  machineryVehicle: null;
  expenses: number;
  total: number;
}

interface FinancialContractorTotal {
  material: number;
  labour: number;
  rmc: number;
  machineryVehicle: number;
  expenses: number;
  total: number;
}

interface FinancialReport {
  bySite: FinancialSiteRow[];
  contractorTotal: FinancialContractorTotal;
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
  const res = await authedFetch(`/reports/daily`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reports (${res.status})`);
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

async function getMaterials(): Promise<MaterialOption[]> {
  const res = await authedFetch(`/materials`, { cache: "no-store" });
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
  const res = await authedFetch(`/reports/sites${query(params)}`, {
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
  const res = await authedFetch(`/reports/inventory${query(params)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Inventory report (${res.status})`);
  }
  return res.json();
}

async function getTeamMembers(): Promise<TeamMemberOption[]> {
  const res = await authedFetch(`/team-members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Members (${res.status})`);
  }
  return res.json();
}

async function getLabourReport(params: {
  teamMemberId?: string;
  from?: string;
  to?: string;
}): Promise<LabourReport> {
  const res = await authedFetch(`/reports/labour${query(params)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Labour report (${res.status})`);
  }
  return res.json();
}

async function getMachineryReport(params: {
  assetType?: string;
  assetId?: string;
  from?: string;
  to?: string;
}): Promise<MachineryReport> {
  const res = await authedFetch(
    `/reports/machinery-vehicles${query(params)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Failed to load Machinery/Vehicle report (${res.status})`);
  }
  return res.json();
}

async function getFinancialReport(params: {
  siteId?: string;
  from?: string;
  to?: string;
}): Promise<FinancialReport> {
  const res = await authedFetch(`/reports/financial${query(params)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Financial report (${res.status})`);
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

function formatMoneyStr(amount: string) {
  return formatMoney(Number(amount));
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

// ---------------------------------------------------------------------------
// Labour report view (Story 13.3, FR-44)
// ---------------------------------------------------------------------------
const workRecordColumns: DataTableColumn<LabourWorkRecord>[] = [
  { header: "Date", cell: (w) => <span className="font-semibold">{formatDate(w.workDate)}</span> },
  { header: "Team Member", cell: (w) => w.teamMember.name },
  { header: "Site", cell: (w) => w.site.name },
  {
    header: "Attendance",
    cell: (w) =>
      w.attended ? <Badge variant="success">Present</Badge> : <Badge variant="danger">Absent</Badge>,
  },
  {
    header: "Hours / OT",
    align: "right",
    cell: (w) =>
      w.attended ? (
        <span className="tabular-nums">
          {w.hours ?? "—"}h{w.overtimeHours ? ` / ${w.overtimeHours}h OT` : ""}
        </span>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
];

const paymentColumns: DataTableColumn<LabourPayment>[] = [
  { header: "Recorded", cell: (p) => <span className="text-ink-500">{formatDate(p.createdAt)}</span> },
  { header: "Team Member", cell: (p) => p.teamMember.name },
  { header: "Pay Period", cell: (p) => p.payPeriod ?? <span className="text-ink-500">—</span> },
  {
    header: "Status",
    cell: (p) =>
      p.status === "paid" ? (
        <Badge variant="success">Paid</Badge>
      ) : (
        <Badge variant="warning">Pending</Badge>
      ),
  },
  {
    header: "Net Payable",
    align: "right",
    cell: (p) => <span className="tabular-nums font-semibold text-gold-700">{formatMoneyStr(p.netPayable)}</span>,
  },
];

const outstandingColumns: DataTableColumn<OutstandingRow>[] = [
  { header: "Team Member", cell: (r) => r.name },
  {
    header: "Outstanding Balance",
    align: "right",
    cell: (r) => <span className="tabular-nums font-semibold">{formatMoneyStr(r.outstandingAdvanceBalance)}</span>,
  },
];

// A single chronological Advance + Adjustment ledger, merged from the two
// append-only sources (Epic 7 Stories 7.1/7.2) — the same combined-ledger
// framing as the Team Member detail page, in a filtered report frame.
interface LedgerRow {
  key: string;
  date: string;
  teamMember: string;
  type: "Advance" | "Adjustment";
  detail: string | null;
  amount: string;
}

const ledgerColumns: DataTableColumn<LedgerRow>[] = [
  { header: "Date", cell: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
  { header: "Team Member", cell: (r) => r.teamMember },
  {
    header: "Type",
    cell: (r) =>
      r.type === "Advance" ? <Badge variant="gold">Advance</Badge> : <Badge variant="neutral">Adjustment</Badge>,
  },
  { header: "Reason / Note", cell: (r) => r.detail ?? <span className="text-ink-500">—</span> },
  {
    header: "Amount",
    align: "right",
    cell: (r) => <span className="tabular-nums">{formatMoneyStr(r.amount)}</span>,
  },
];

function mergeLedger(report: LabourReport): LedgerRow[] {
  const rows: LedgerRow[] = [
    ...report.advances.map((a): LedgerRow => ({
      key: `adv-${a.id}`,
      date: a.givenAt,
      teamMember: a.teamMember.name,
      type: "Advance",
      detail: a.reason,
      amount: a.amount,
    })),
    // Adjustment.amount is stored as the decrement magnitude (positive reduces
    // the balance) — negated here so the Amount column reads as the row's
    // signed effect on the balance, matching the Team Member detail ledger.
    ...report.adjustments.map((adj): LedgerRow => ({
      key: `adj-${adj.id}`,
      date: adj.adjustedAt,
      teamMember: adj.advance.teamMember.name,
      type: "Adjustment",
      detail: adj.note,
      amount: String(-Number(adj.amount)),
    })),
  ];
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function LabourReportView({
  teamMembers,
  report,
  teamMemberId,
  from,
  to,
}: {
  teamMembers: TeamMemberOption[];
  report: LabourReport;
  teamMemberId?: string;
  from?: string;
  to?: string;
}) {
  const ledger = mergeLedger(report);

  return (
    <>
      <FilterForm tab="labour">
        <SelectField
          label="Team Member"
          name="teamMemberId"
          defaultValue={teamMemberId ?? ""}
          options={[
            { value: "", label: "All Team Members" },
            ...teamMembers.map((tm) => ({ value: tm.id, label: tm.name })),
          ]}
        />
        <TextField label="From" name="from" type="date" defaultValue={from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={to ?? ""} />
      </FilterForm>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={<UsersIcon />} value={report.summary.totalTeamMembers} label="Total Team Members" />
        <StatTile
          icon={<CalendarIcon />}
          value={report.summary.todaysWorkingHeadcount}
          label="Working Today"
        />
        <StatTile
          icon={<WalletIcon />}
          tint="gold"
          value={formatMoney(report.summary.weeklyPaymentTotal)}
          label="Paid This Week"
        />
        <StatTile
          icon={<WalletIcon />}
          tint="gold"
          value={formatMoney(report.summary.monthlyPaymentTotal)}
          label="Paid This Month"
        />
      </div>

      <h2 className="mb-3 text-card-title text-ink-900">Attendance &amp; Work History</h2>
      <DataTable
        columns={workRecordColumns}
        rowKey={(w) => w.id}
        state={
          report.workRecords.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No Work Records in this date range.",
              }
            : { status: "success", rows: report.workRecords }
        }
      />

      <h2 className="mb-3 mt-8 text-card-title text-ink-900">Payment History</h2>
      <DataTable
        columns={paymentColumns}
        rowKey={(p) => p.id}
        state={
          report.payments.length === 0
            ? { status: "empty", icon: <WalletIcon />, message: "No Payments in this date range." }
            : { status: "success", rows: report.payments }
        }
      />

      <h2 className="mb-3 mt-8 text-card-title text-ink-900">Outstanding Advances</h2>
      <DataTable
        columns={outstandingColumns}
        rowKey={(r) => r.teamMemberId}
        state={
          report.outstanding.byTeamMember.length === 0
            ? { status: "empty", message: "No Team Members with an Advance balance." }
            : { status: "success", rows: report.outstanding.byTeamMember }
        }
      />

      <h2 className="mb-3 mt-8 text-card-title text-ink-900">Advance &amp; Adjustment History</h2>
      <DataTable
        columns={ledgerColumns}
        rowKey={(r) => r.key}
        state={
          ledger.length === 0
            ? { status: "empty", icon: <WalletIcon />, message: "No Advances or Adjustments in this date range." }
            : { status: "success", rows: ledger }
        }
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Machinery/Vehicle report view (Story 13.3, FR-45)
// ---------------------------------------------------------------------------
function assetOptionToken(kind: "MACHINERY" | "VEHICLE", id: string) {
  return `${kind}:${id}`;
}

const registerColumns: DataTableColumn<AssetRegisterRow>[] = [
  {
    header: "Asset",
    cell: (a) => <span className="font-semibold">{a.name ?? a.number ?? "—"}</span>,
  },
  { header: "Type", cell: (a) => a.type.name },
  {
    header: "Reg / Asset #",
    cell: (a) => <span className="tabular-nums">{a.assetNumber ?? a.number ?? "—"}</span>,
  },
  { header: "Current Site", cell: (a) => a.currentSite?.name ?? <span className="text-ink-500">—</span> },
  { header: "Status", cell: (a) => statusBadge(a.currentStatus) },
];

const assetMovementColumns: DataTableColumn<AssetMovementRow>[] = [
  { header: "Date", cell: (m) => <span className="text-ink-500">{formatDate(m.movedAt)}</span> },
  {
    header: "Moved To",
    cell: (m) =>
      m.toStatus === "AT_SITE"
        ? `At ${m.site?.name ?? "—"}`
        : m.toStatus === "MAINTENANCE"
          ? "Maintenance"
          : "Available",
  },
  { header: "Reason", cell: (m) => m.reason ?? <span className="text-ink-500">—</span> },
];

function serviceKindBadge(kind: AssetServiceRow["kind"]) {
  if (kind === "FUEL") return <Badge variant="gold">Fuel</Badge>;
  if (kind === "MAINTENANCE") return <Badge variant="neutral">Maintenance</Badge>;
  return <Badge variant="warning">Repair</Badge>;
}

const assetServiceColumns: DataTableColumn<AssetServiceRow>[] = [
  { header: "Date", cell: (s) => <span className="text-ink-500">{formatDate(s.serviceDate)}</span> },
  { header: "Kind", cell: (s) => serviceKindBadge(s.kind) },
  { header: "Notes", cell: (s) => s.notes ?? <span className="text-ink-500">—</span> },
  {
    header: "Cost",
    align: "right",
    cell: (s) =>
      s.cost == null ? (
        <span className="text-ink-500">—</span>
      ) : (
        <span className="tabular-nums">{formatMoneyStr(s.cost)}</span>
      ),
  },
];

function MachineryReportView({
  report,
  assetToken,
  from,
  to,
}: {
  report: MachineryReport;
  assetToken?: string;
  from?: string;
  to?: string;
}) {
  const assetOptions = [
    ...report.machinery.map((m) => ({
      value: assetOptionToken("MACHINERY", m.id),
      label: `${m.name ?? m.assetNumber ?? "Unnamed machinery"} (Machinery)`,
    })),
    ...report.vehicles.map((v) => ({
      value: assetOptionToken("VEHICLE", v.id),
      label: `${v.number ?? "Unnumbered vehicle"} (Vehicle)`,
    })),
  ];
  const asset = report.asset;

  return (
    <>
      <FilterForm tab="machinery">
        <SelectField
          label="Asset"
          name="asset"
          defaultValue={assetToken ?? ""}
          options={[{ value: "", label: "All Assets" }, ...assetOptions]}
        />
        <TextField label="From" name="from" type="date" defaultValue={from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={to ?? ""} />
      </FilterForm>

      {asset ? (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border-hairline bg-surface-1 px-6 py-5 shadow-1">
            <span className="flex items-center gap-2 text-page-title text-ink-900">
              {asset.name ? <GearIcon className="size-5 text-ink-500" /> : <TruckIcon className="size-5 text-ink-500" />}
              {asset.name ?? asset.number}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Type</span>
              <Badge variant="neutral">{asset.type.name}</Badge>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Current Site</span>
              <span className="font-semibold text-ink-900">{asset.currentSite?.name ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Status</span>
              {statusBadge(asset.currentStatus)}
            </span>
          </div>

          <h2 className="mb-3 text-card-title text-ink-900">Movement History</h2>
          <DataTable
            columns={assetMovementColumns}
            rowKey={(m) => m.id}
            state={
              report.movements.length === 0
                ? { status: "empty", icon: <ArrowsIcon />, message: "No movements in this date range." }
                : { status: "success", rows: report.movements }
            }
          />

          <h2 className="mb-3 mt-8 text-card-title text-ink-900">Fuel, Maintenance &amp; Repair History</h2>
          <DataTable
            columns={assetServiceColumns}
            rowKey={(s) => s.id}
            state={
              report.serviceLogs.length === 0
                ? { status: "empty", icon: <GearIcon />, message: "No service entries in this date range." }
                : { status: "success", rows: report.serviceLogs }
            }
          />
        </>
      ) : (
        <>
          <h2 className="mb-3 text-card-title text-ink-900">Machinery — Current Status</h2>
          <DataTable
            columns={registerColumns}
            rowKey={(a) => a.id}
            state={
              report.machinery.length === 0
                ? { status: "empty", icon: <GearIcon />, message: "No Machinery registered yet." }
                : { status: "success", rows: report.machinery }
            }
          />

          <h2 className="mb-3 mt-8 text-card-title text-ink-900">Vehicles — Current Status</h2>
          <DataTable
            columns={registerColumns}
            rowKey={(a) => a.id}
            state={
              report.vehicles.length === 0
                ? { status: "empty", icon: <TruckIcon />, message: "No Vehicles registered yet." }
                : { status: "success", rows: report.vehicles }
            }
          />

          <p className="mt-6 text-body-sm text-ink-500">
            Select an asset above to see its movement and service history.
          </p>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Financial report view (Story 13.4, FR-46)
// ---------------------------------------------------------------------------
// The Category/Amount cost breakdown. A category is either a real summed money
// figure or — for the two structurally Contractor-level categories (Labour,
// Machinery/Vehicle) when a single Site is in scope — an explanatory note, so a
// reader sees WHY those two don't appear per-Site rather than a misleading ₹0.
interface CategoryRow {
  key: string;
  category: string;
  amount: number | null;
  note?: string;
  emphasis?: boolean;
}

const CONTRACTOR_ONLY_NOTE = "Not tracked per-Site — see Contractor total";

const categoryColumns: DataTableColumn<CategoryRow>[] = [
  {
    header: "Cost Category",
    cell: (r) => (
      <span className={r.emphasis ? "font-semibold text-ink-900" : undefined}>
        {r.category}
      </span>
    ),
  },
  {
    header: "Amount",
    align: "right",
    cell: (r) =>
      r.amount === null ? (
        <span className="text-body-sm text-ink-500">{r.note}</span>
      ) : (
        <span
          className={cn(
            "tabular-nums",
            r.emphasis ? "font-semibold text-gold-700" : "text-ink-900",
          )}
        >
          {formatMoney(r.amount)}
        </span>
      ),
  },
];

// The per-Site rollup: only the three genuinely Site-tagged categories are
// columns here (material, rmc, expenses) — Labour and Machinery/Vehicle are
// Contractor-level and shown in the summary tiles / Contractor breakdown.
const siteBreakdownColumns: DataTableColumn<FinancialSiteRow>[] = [
  { header: "Site", cell: (r) => <span className="font-semibold">{r.name}</span> },
  {
    header: "Material",
    align: "right",
    cell: (r) => <span className="tabular-nums">{formatMoney(r.material)}</span>,
  },
  {
    header: "RMC",
    align: "right",
    cell: (r) => <span className="tabular-nums">{formatMoney(r.rmc)}</span>,
  },
  {
    header: "Expenses",
    align: "right",
    cell: (r) => <span className="tabular-nums">{formatMoney(r.expenses)}</span>,
  },
  {
    header: "Site Total",
    align: "right",
    cell: (r) => (
      <span className="tabular-nums font-semibold text-gold-700">{formatMoney(r.total)}</span>
    ),
  },
];

function scopedCategoryRows(
  scope: FinancialSiteRow | FinancialContractorTotal,
  siteScoped: boolean,
): CategoryRow[] {
  return [
    { key: "material", category: "Material", amount: scope.material },
    {
      key: "labour",
      category: "Labour",
      amount: siteScoped ? null : (scope as FinancialContractorTotal).labour,
      note: CONTRACTOR_ONLY_NOTE,
    },
    { key: "rmc", category: "RMC", amount: scope.rmc },
    {
      key: "machineryVehicle",
      category: "Machinery / Vehicle",
      amount: siteScoped
        ? null
        : (scope as FinancialContractorTotal).machineryVehicle,
      note: CONTRACTOR_ONLY_NOTE,
    },
    { key: "expenses", category: "Expenses", amount: scope.expenses },
    { key: "total", category: "Total", amount: scope.total, emphasis: true },
  ];
}

function FinancialReportView({
  sites,
  report,
  siteId,
  from,
  to,
}: {
  sites: SiteOption[];
  report: FinancialReport;
  siteId?: string;
  from?: string;
  to?: string;
}) {
  const selectedRow = siteId ? report.bySite[0] : undefined;
  const scope = selectedRow ?? report.contractorTotal;
  const categoryRows = scopedCategoryRows(scope, Boolean(siteId));
  const breakdownTitle = selectedRow
    ? `Cost Breakdown — ${selectedRow.name}`
    : "Contractor Cost Breakdown (All Sites)";

  return (
    <>
      <FilterForm tab="financial">
        <SelectField
          label="Site"
          name="siteId"
          defaultValue={siteId ?? ""}
          options={[
            { value: "", label: "All Sites" },
            ...sites.map((site) => ({ value: site.id, label: site.name })),
          ]}
        />
        <TextField label="From" name="from" type="date" defaultValue={from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={to ?? ""} />
      </FilterForm>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile
          icon={<TruckIcon />}
          tint="gold"
          value={formatMoney(report.contractorTotal.material)}
          label="Material (Contractor)"
        />
        <StatTile
          icon={<UsersIcon />}
          tint="gold"
          value={formatMoney(report.contractorTotal.labour)}
          label="Labour (Contractor)"
        />
        <StatTile
          icon={<ClipboardIcon />}
          tint="gold"
          value={formatMoney(report.contractorTotal.rmc)}
          label="RMC (Contractor)"
        />
        <StatTile
          icon={<GearIcon />}
          tint="gold"
          value={formatMoney(report.contractorTotal.machineryVehicle)}
          label="Machinery / Vehicle (Contractor)"
        />
        <StatTile
          icon={<WalletIcon />}
          tint="gold"
          value={formatMoney(report.contractorTotal.expenses)}
          label="Expenses (Contractor)"
        />
      </div>

      <h2 className="mb-3 text-card-title text-ink-900">{breakdownTitle}</h2>
      {siteId ? (
        <p className="mb-3 text-body-sm text-ink-500">
          Labour and Machinery/Vehicle costs aren&apos;t attributable to a single
          Site (a Team Member isn&apos;t bound to a Site, and an asset&apos;s
          service history belongs to the asset) — they roll up to the Contractor
          total above, not this Site.
        </p>
      ) : null}
      <DataTable
        columns={categoryColumns}
        rowKey={(r) => r.key}
        state={{ status: "success", rows: categoryRows }}
      />

      {siteId ? null : (
        <>
          <h2 className="mb-3 mt-8 text-card-title text-ink-900">
            Per-Site Breakdown
          </h2>
          <p className="mb-3 text-body-sm text-ink-500">
            Material, RMC, and Expenses attribute to a Site. Labour and
            Machinery/Vehicle are Contractor-level only (see the totals above).
          </p>
          <DataTable
            columns={siteBreakdownColumns}
            rowKey={(r) => r.siteId}
            state={
              report.bySite.length === 0
                ? {
                    status: "empty",
                    icon: <WalletIcon />,
                    message: "No Site-attributable costs in this date range.",
                  }
                : { status: "success", rows: report.bySite }
            }
          />
        </>
      )}
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
    teamMemberId?: string;
    asset?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const {
    tab: tabParam,
    siteId,
    materialId,
    teamMemberId,
    asset,
    from,
    to,
  } = await searchParams;
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
  let teamMembers: TeamMemberOption[] = [];
  let labourReport: LabourReport | null = null;
  let machineryReport: MachineryReport | null = null;
  let financialReport: FinancialReport | null = null;

  // The Machinery/Vehicle picker packs assetType + assetId into one `asset`
  // token ("MACHINERY:<id>" / "VEHICLE:<id>") so a single native <select> can
  // drive both API params; split it back apart here.
  const [assetType, assetId] = asset ? asset.split(":") : [];

  if (tab === "site") {
    sites = await getSites();
    if (sites.length > 0) {
      effectiveSiteId = siteId ?? sites[0]!.id;
      siteReport = await getSiteReport({ siteId: effectiveSiteId, from, to });
    }
  } else if (tab === "inventory") {
    [sites, materials] = await Promise.all([getSites(), getMaterials()]);
    inventoryReport = await getInventoryReport({ siteId, materialId, from, to });
  } else if (tab === "labour") {
    [teamMembers, labourReport] = await Promise.all([
      getTeamMembers(),
      getLabourReport({ teamMemberId, from, to }),
    ]);
  } else if (tab === "machinery") {
    machineryReport = await getMachineryReport({ assetType, assetId, from, to });
  } else if (tab === "financial") {
    [sites, financialReport] = await Promise.all([
      getSites(),
      getFinancialReport({ siteId, from, to }),
    ]);
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Reports</h1>
          <p className="text-body-sm text-ink-500">
            Reports generate and deliver automatically — no manual step required.
          </p>
        </div>
        {/* Story 14.5 (FR-51): scheduled, multi-cadence report delivery, configured
            independently of the daily report flow. */}
        <Link
          href="/reports/schedules"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          <CalendarIcon className="size-4" />
          Scheduled Reports
        </Link>
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
        ) : tab === "labour" && labourReport ? (
          <LabourReportView
            teamMembers={teamMembers}
            report={labourReport}
            teamMemberId={teamMemberId}
            from={from}
            to={to}
          />
        ) : tab === "machinery" && machineryReport ? (
          <MachineryReportView
            report={machineryReport}
            assetToken={asset}
            from={from}
            to={to}
          />
        ) : tab === "financial" && financialReport ? (
          <FinancialReportView
            sites={sites}
            report={financialReport}
            siteId={siteId}
            from={from}
            to={to}
          />
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
