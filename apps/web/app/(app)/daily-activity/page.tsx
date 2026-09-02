import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  Badge,
  Button,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DataTable,
  PlusIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
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
async function getReports(date: string): Promise<DsrListRow[]> {
  const res = await authedFetch(`/dsr?date=${date}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Daily Reports (${res.status})`);
  }
  return res.json();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// GET /dsr?date= already serves any date — the log was just hardcoded to
// today. ?date= (validated, never a future day) pages through history;
// an absent or malformed param stays exactly the old today-only behavior.
function resolveDate(dateParam: string | undefined, today: string): string {
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return today;
  if (Number.isNaN(new Date(`${dateParam}T00:00:00Z`).getTime())) return today;
  return dateParam < today ? dateParam : today;
}

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
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

function buildColumns(isToday: boolean): DataTableColumn<LogRow>[] {
  return [
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
      cell: (row) =>
        row.report ? (
          summaryFor(row.report)
        ) : (
          <span className="text-ink-500">{isToday ? "Not submitted yet today" : "Not submitted"}</span>
        ),
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
}

export default async function DailyActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
} = {}) {
  const today = todayDate();
  const { date: dateParam } = (await searchParams) ?? {};
  const date = resolveDate(dateParam, today);
  const isToday = date === today;

  const [sites, reports] = await Promise.all([getSites(), getReports(date)]);

  const reportBySiteId = new Map(reports.map((report) => [report.site.id, report]));
  const rows: LogRow[] = sites.map((site) => ({ site, report: reportBySiteId.get(site.id) ?? null }));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Daily Reports</h1>
          <p className="text-body-sm text-ink-500">
            Daily Reports across all Sites — {formatDate(date)}
            {isToday ? "" : " (past day)"}
          </p>
        </div>
        <Link href="/dsr/new">
          <Button>
            <PlusIcon className="size-4" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="mb-4 action-button-row items-center">
        <Link
          href={`/daily-activity?date=${shiftDate(date, -1)}`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          <ChevronRightIcon className="size-4 rotate-180" />
          Previous day
        </Link>
        {isToday ? null : (
          <>
            <Link
              href={`/daily-activity?date=${shiftDate(date, 1)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Next day
              <ChevronRightIcon className="size-4" />
            </Link>
            <Link href="/daily-activity" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Jump to today
            </Link>
          </>
        )}
      </div>

      <DataTable
        columns={buildColumns(isToday)}
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
