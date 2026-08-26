import { BarChartIcon, DataTable, type DataTableColumn } from "@azentisfieldos/ui";
import {
  DeliveryStatusBadge,
  type DeliverySummary,
} from "./delivery-status-badge";

// Story 13.1: the Reports shell's "Recent Reports" delivery log, scoped to the
// auto-compiled Daily Site Report rows only (Dev Notes: the mockup's
// Weekly/Monthly rows are a different, unscoped capability — Stories 13.2–13.4
// add their filterable report *views* as this page's chip-row tabs later).
// There is deliberately NO "Send Report" button anywhere here — reports
// compile and deliver on a schedule with no manual send step (UX-DR19).

interface DailyReportRow {
  id: string;
  reportType: string;
  siteId: string;
  siteName: string;
  reportDate: string;
  generatedAt: string;
  deliveries: DeliverySummary[];
}

async function getDailyReports(): Promise<DailyReportRow[]> {
  const res = await fetch(`${process.env.API_URL}/reports/daily`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load reports (${res.status})`);
  }
  return res.json();
}

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

const columns: DataTableColumn<DailyReportRow>[] = [
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

export default async function ReportsPage() {
  const reports = await getDailyReports();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Reports</h1>
        <p className="text-body-sm text-ink-500">
          Reports generate and deliver automatically — no manual step required.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <BarChartIcon className="size-4 text-accent-teal-700" />
        <h2 className="text-card-title text-ink-900">Recent Reports</h2>
      </div>

      <DataTable
        columns={columns}
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
