import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, Button, CheckCircleIcon, ClipboardIcon, DataTable, PlusIcon, type DataTableColumn } from "@azentisfieldos/ui";
import type { Site } from "../sites/page";

interface DsrListRow {
  id: string;
  site: { id: string; name: string };
  submittedBy: { name: string };
  workCompleted: string | null;
  _count: { workRecords: number; consumptions: number };
}

interface LogRow {
  site: Pick<Site, "id" | "name">;
  report: DsrListRow | null;
}

async function getSites(): Promise<Site[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

// FR-28/story 3.4: only two real states exist from the server's point of
// view — a DailySiteReport row exists for (Site, date) or it doesn't.
// "Pending sync" describes a report still sitting in a Supervisor's local
// offline queue (story 3.2) and is not something this endpoint can ever
// observe, so it is deliberately not represented here (Task 0).
async function getTodaysReports(date: string): Promise<DsrListRow[]> {
  const res = await authedFetch(`/dsr?date=${date}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Daily Site Reports (${res.status})`);
  }
  return res.json();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function summaryFor(report: DsrListRow) {
  if (report.workCompleted) return report.workCompleted;
  if (report._count.consumptions > 0) {
    return `${report._count.consumptions} material ${report._count.consumptions === 1 ? "entry" : "entries"} logged`;
  }
  return <span className="text-ink-500">No summary provided</span>;
}

const columns: DataTableColumn<LogRow>[] = [
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  {
    header: "Submitted By",
    cell: (row) => row.report?.submittedBy.name ?? <span className="text-ink-500">—</span>,
  },
  {
    header: "Crew Present",
    align: "right",
    cell: (row) => row.report?._count.workRecords ?? <span className="text-ink-500">—</span>,
  },
  {
    header: "Summary",
    cell: (row) => (row.report ? summaryFor(row.report) : <span className="text-ink-500">Not submitted yet today</span>),
  },
  {
    header: "Status",
    cell: (row) =>
      row.report ? (
        <Badge variant="success" icon={<CheckCircleIcon />}>
          Submitted
        </Badge>
      ) : (
        <Badge variant="neutral">Not submitted</Badge>
      ),
  },
];

export default async function DailyActivityPage() {
  const date = todayDate();
  const [sites, reports] = await Promise.all([getSites(), getTodaysReports(date)]);

  const reportBySiteId = new Map(reports.map((report) => [report.site.id, report]));
  const rows: LogRow[] = sites.map((site) => ({ site, report: reportBySiteId.get(site.id) ?? null }));

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Daily Activity</h1>
          <p className="text-body-sm text-ink-500">Daily Site Reports across all Sites — {formatDate(date)}</p>
        </div>
        <Link href="/dsr/new">
          <Button>
            <PlusIcon className="size-4" />
            New Report
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        rowKey={(row) => row.site.id}
        // AC #3: a Site with no report today carries no link at all — never
        // an href, never a pointer-cursor affordance for a row with
        // nothing to open (the exact bug this rule exists to prevent).
        rowHref={(row) => (row.report ? `/daily-activity/${row.report.id}` : undefined)}
        state={
          rows.length === 0
            ? { status: "empty", icon: <ClipboardIcon />, message: "No Sites yet." }
            : { status: "success", rows }
        }
      />
    </>
  );
}
