import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { FeedItem } from "@azentisfieldos/shared";
import {
  Badge,
  BoxIcon,
  CameraIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DataTable,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  ReceiptIcon,
  UsersIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import type { Site } from "../page";
import { FEED_TYPE_CONFIG } from "./feed-type-config";

interface SiteDetail extends Site {
  feed: FeedItem[];
}

interface TodaysDsr {
  id: string;
  _count: { workRecords: number; consumptions: number };
}

interface SiteStockRow {
  materialSizeId: string;
  quantity: string;
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface RecentDsrRow {
  id: string;
  reportDate: string;
  workCompleted: string | null;
  submittedBy: { name: string };
  _count: { workRecords: number; consumptions: number };
}

async function getSiteDetail(id: string): Promise<SiteDetail | null> {
  const res = await authedFetch(`/sites/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site (${res.status})`);
  }
  return res.json();
}

// FR-28's daily loop starts from the Site, not from a separate form:
// "Site → Today's DSR". If today's report exists, the action opens it;
// otherwise it deep-links the DSR form with this Site pre-selected.
// The whole row (not just the id) rides along so the "Today at this Site"
// panel can show crew/material counts without a second fetch.
async function getTodaysDsr(siteId: string): Promise<TodaysDsr | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await authedFetch(`/dsr?date=${today}`, { cache: "no-store" });
    if (!res.ok) return null;
    const reports = (await res.json()) as (TodaysDsr & { site?: { id: string } })[];
    if (!Array.isArray(reports)) return null;
    return reports.find((report) => report.site?.id === siteId) ?? null;
  } catch {
    return null;
  }
}

// Current stock at this Site — the same GET /stock/site/:siteId the
// Inventory page and DSR form's stock hints read, so all three agree by
// construction. A transient failure renders the panel's own error-ish
// empty message, never blanking the rest of the Site page.
async function getSiteStock(siteId: string): Promise<SiteStockRow[] | null> {
  try {
    const res = await authedFetch(`/stock/site/${siteId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const rows = (await res.json()) as SiteStockRow[];
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

// Last 30 days of DSRs for this Site, via the Site Reports composition
// endpoint (GET /reports/sites) — the one existing read that serves
// per-Site DSR history. Only its `dsrs` slice is used here.
async function getRecentDsrs(siteId: string): Promise<RecentDsrRow[] | null> {
  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);
  try {
    const res = await authedFetch(`/reports/sites?siteId=${siteId}&from=${from}&to=${to}`, { cache: "no-store" });
    if (!res.ok) return null;
    const report = (await res.json()) as { dsrs?: RecentDsrRow[] };
    return Array.isArray(report?.dsrs) ? report.dsrs : null;
  } catch {
    return null;
  }
}

const STATUS_BADGE: Record<Site["status"], { variant: "success" | "warning" | "neutral"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const feedColumns: DataTableColumn<FeedItem>[] = [
  { header: "Date", cell: (item) => <span className="text-ink-500">{formatDateTime(item.occurredAt)}</span> },
  {
    header: "Type",
    cell: (item) => {
      const config = FEED_TYPE_CONFIG[item.type];
      const Icon = config.icon;
      return (
        <Badge variant={config.badgeVariant} icon={<Icon />}>
          {config.label}
        </Badge>
      );
    },
  },
  { header: "Description", cell: (item) => item.summary },
  {
    header: "Amount",
    align: "right",
    cell: (item) =>
      item.amount !== null ? (
        <span className="font-semibold text-gold-700 tabular-nums">₹{item.amount.toLocaleString("en-IN")}</span>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
];

const stockColumns: DataTableColumn<SiteStockRow>[] = [
  {
    header: "Material",
    cell: (row) =>
      `${row.materialSize.material.name}${row.materialSize.label ? ` (${row.materialSize.label})` : ""}`,
  },
  {
    header: "Qty on hand",
    align: "right",
    cell: (row) => `${row.quantity} ${row.materialSize.material.unit.name}`,
  },
];

const recentDsrColumns: DataTableColumn<RecentDsrRow>[] = [
  { header: "Date", cell: (row) => <span className="text-ink-500">{formatDate(row.reportDate)}</span> },
  { header: "Submitted by", cell: (row) => row.submittedBy.name },
  { header: "Crew", align: "right", cell: (row) => row._count.workRecords },
  {
    header: "Summary",
    cell: (row) => row.workCompleted ?? <span className="text-ink-500">—</span>,
  },
];

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site, todaysDsr, stock, recentDsrs] = await Promise.all([
    getSiteDetail(id),
    getTodaysDsr(id),
    getSiteStock(id),
    getRecentDsrs(id),
  ]);

  if (!site) {
    notFound();
  }

  const status = STATUS_BADGE[site.status];

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/sites" className="hover:text-accent-teal-700 hover:underline">
          Sites
        </Link>{" "}
        / {site.name}
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-page-title text-ink-900">
            {site.name}
            <Badge variant={status.variant}>{status.label}</Badge>
          </h1>
          <div className="flex flex-wrap gap-4 text-body-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {site.location}
            </span>
            {site.contractReference ? (
              <span className="flex items-center gap-1.5">
                <ClipboardIcon className="size-3.5" />
                Contract ref: {site.contractReference}
              </span>
            ) : null}
          </div>
          {site.description ? (
            <p className="mt-2 max-w-160 text-body-sm text-ink-700">{site.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={todaysDsr ? `/daily-activity/${todaysDsr.id}` : `/dsr/new?siteId=${site.id}`}
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            <ClipboardIcon className="size-4" />
            Today&apos;s DSR
          </Link>
          <Link href={`/sites/${site.id}/photos`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <CameraIcon className="size-4" />
            Site Photos
          </Link>
          <Link href={`/sites/${site.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <PencilIcon className="size-4" />
            Edit Site
          </Link>
        </div>
      </div>

      {/* Today at this Site — DSR status + quick entry, so "what's going on
          at Site B right now" is answered here, not three screens away. */}
      <div className="mb-8 rounded-lg border border-border-hairline bg-surface-1 p-5 shadow-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {todaysDsr ? (
              <>
                <Badge variant="success" icon={<CheckCircleIcon />}>
                  DSR submitted today
                </Badge>
                <span className="flex items-center gap-1.5 text-body-sm text-ink-700">
                  <UsersIcon className="size-4 text-ink-500" />
                  {todaysDsr._count.workRecords} crew present
                </span>
                <span className="flex items-center gap-1.5 text-body-sm text-ink-700">
                  <LayersIcon className="size-4 text-ink-500" />
                  {todaysDsr._count.consumptions} material {todaysDsr._count.consumptions === 1 ? "entry" : "entries"}
                </span>
              </>
            ) : (
              <Badge variant="neutral">No DSR yet today</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* ?siteId= carries this Site into the entry forms pre-selected
                — the system already knows where the user is standing. */}
            <Link
              href={`/movements/consumption/new?siteId=${site.id}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              <PlusIcon className="size-4" />
              Record Consumption
            </Link>
            <Link
              href={`/expenses/new?siteId=${site.id}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              <ReceiptIcon className="size-4" />
              Record Expense
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 text-section-header text-ink-900">Current Stock</div>
          <DataTable
            columns={stockColumns}
            rowKey={(row) => row.materialSizeId}
            state={
              stock === null
                ? { status: "empty", icon: <BoxIcon />, message: "Couldn't load this Site's stock right now." }
                : stock.length === 0
                  ? { status: "empty", icon: <BoxIcon />, message: "No stock recorded at this Site yet." }
                  : { status: "success", rows: stock }
            }
          />
        </div>
        <div>
          <div className="mb-4 text-section-header text-ink-900">Recent Daily Site Reports</div>
          <DataTable
            columns={recentDsrColumns}
            rowKey={(row) => row.id}
            rowHref={(row) => `/daily-activity/${row.id}`}
            state={
              recentDsrs === null
                ? { status: "empty", icon: <ClipboardIcon />, message: "Couldn't load recent reports right now." }
                : recentDsrs.length === 0
                  ? { status: "empty", icon: <ClipboardIcon />, message: "No Daily Site Reports in the last 30 days." }
                  : { status: "success", rows: recentDsrs }
            }
          />
        </div>
      </div>

      <div className="mb-4 text-section-header text-ink-900">Activity Feed</div>
      <DataTable
        columns={feedColumns}
        rowKey={(item) => item.id}
        state={
          site.feed.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No activity logged yet for this Site.",
              }
            : { status: "success", rows: site.feed }
        }
      />
    </>
  );
}
