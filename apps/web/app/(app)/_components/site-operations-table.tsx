"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Badge, DataTable, type DataTableColumn, type DataTableState } from "@azentisfieldos/ui";

// Command Center redesign (2026-09-08): the Owner Dashboard's per-Site
// "Site operations" table, fed by GET /dashboard/site-breakdown. A client
// component for one reason only: the shared DataTable's error state carries
// a real Retry action (`onRetry`), which a Server Component can't supply —
// owner-dashboard.tsx stays the server component that does the fetch and
// hands the (serializable) result, or null on failure, down to this table.
// Additive-context rule: a failed breakdown read degrades to the shared
// DataTable error state right here; the rest of the Dashboard is untouched.

export interface SiteBreakdownRow {
  id: string;
  name: string;
  location: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  report: { submitted: boolean; submittedAt: string | null };
  labour: number | null;
  received: number;
  consumed: number;
  expenses: number;
}

export interface SiteBreakdown {
  sites: SiteBreakdownRow[];
  godown: { received: number };
}

// The one status→badge mapping for Site rows (was owner-dashboard.tsx's
// sites-preview grid mapping; the table is now the surface that renders it).
const SITE_STATUS_BADGE: Record<
  SiteBreakdownRow["status"],
  { variant: "success" | "warning" | "neutral"; label: string }
> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

// The table renders three kinds of row from one column set: a real Site,
// the Godown bucket (received only — Consumption/Expense/WorkRecord all
// require a siteId, so the schema has no Godown-side data for the rest),
// and the reconciling totals row.
type Row =
  | ({ kind: "site" } & SiteBreakdownRow)
  | { kind: "godown"; received: number }
  | { kind: "total"; labour: number; received: number; consumed: number; expenses: number };

const dash = <span className="text-ink-500">—</span>;

// Honesty rule for metric cells: a real activity count always shows, even
// without a Daily Report; a 0 shows as 0 only when a report actually
// vouched for the day — otherwise "0" would present an unreported day as
// positively quiet, so it renders "—" instead. `null` (no data possible or
// none recorded) is always "—".
function metricCell(value: number | null, showZero: boolean): ReactNode {
  if (value === null || (value === 0 && !showZero)) return dash;
  return value.toLocaleString("en-IN");
}

function moneyCell(value: number | null, showZero: boolean): ReactNode {
  if (value === null || (value === 0 && !showZero)) return dash;
  return (
    <span className="font-semibold text-gold-700 tabular-nums">₹{value.toLocaleString("en-IN")}</span>
  );
}

function submittedTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function reportCell(row: Row): ReactNode {
  if (row.kind !== "site") return dash;
  // `submitted` wins: a submitted Site must never read as missing just
  // because its timestamp is absent or unparseable — degrade to a bare
  // "Submitted" badge instead (and never render an "Invalid Date").
  if (row.report.submitted) {
    const time =
      typeof row.report.submittedAt === "string" && !Number.isNaN(Date.parse(row.report.submittedAt))
        ? submittedTime(row.report.submittedAt)
        : null;
    return <Badge variant="success">{time ? `Submitted ${time}` : "Submitted"}</Badge>;
  }
  if (row.status === "ON_HOLD") {
    return <span className="text-caption text-ink-500">On hold — no report expected</span>;
  }
  if (row.status === "COMPLETED") {
    return dash;
  }
  return <Badge variant="warning">No Daily Report yet today</Badge>;
}

const columns: DataTableColumn<Row>[] = [
  {
    header: "Site",
    cell: (row) =>
      row.kind === "site" ? (
        <div>
          <div className="font-semibold text-ink-900">{row.name}</div>
          <div className="text-caption text-ink-500">{row.location}</div>
        </div>
      ) : row.kind === "godown" ? (
        <div>
          <div className="font-semibold text-ink-900">Godown</div>
          <div className="text-caption text-ink-500">Central stock point</div>
        </div>
      ) : (
        <span className="font-semibold text-ink-700">Today across all sites</span>
      ),
  },
  {
    header: "Status",
    cell: (row) => {
      if (row.kind === "site") {
        const badge = SITE_STATUS_BADGE[row.status] ?? { variant: "neutral" as const, label: row.status };
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      }
      if (row.kind === "godown") return <Badge variant="neutral">Stock</Badge>;
      return null;
    },
  },
  { header: "Today's Daily Report", cell: reportCell },
  {
    header: "Labour",
    align: "right",
    cell: (row) =>
      row.kind === "site"
        ? metricCell(row.labour, row.report.submitted)
        : row.kind === "total"
          ? metricCell(row.labour, true)
          : dash,
  },
  {
    header: "Received",
    align: "right",
    cell: (row) =>
      row.kind === "site" ? metricCell(row.received, row.report.submitted) : metricCell(row.received, true),
  },
  {
    header: "Consumed",
    align: "right",
    cell: (row) =>
      row.kind === "site"
        ? metricCell(row.consumed, row.report.submitted)
        : row.kind === "total"
          ? metricCell(row.consumed, true)
          : dash,
  },
  {
    header: "Expenses today",
    align: "right",
    cell: (row) =>
      row.kind === "site"
        ? moneyCell(row.expenses, row.report.submitted)
        : row.kind === "total"
          ? moneyCell(row.expenses, true)
          : dash,
  },
];

// A malformed body degrades exactly like a failed read (same rule as the
// Money cards: never render garbage as figures) — every row must carry a
// report object and numeric metrics, or metricCell/reportCell would crash
// or print NaN.
function isValidBreakdown(breakdown: SiteBreakdown | null): breakdown is SiteBreakdown {
  return (
    breakdown !== null &&
    Array.isArray(breakdown.sites) &&
    typeof breakdown.godown?.received === "number" &&
    breakdown.sites.every(
      (site) =>
        site != null &&
        typeof site.id === "string" &&
        typeof site.report === "object" &&
        site.report !== null &&
        typeof site.report.submitted === "boolean" &&
        (site.labour === null || typeof site.labour === "number") &&
        typeof site.received === "number" &&
        typeof site.consumed === "number" &&
        typeof site.expenses === "number",
    )
  );
}

export function SiteOperationsTable({
  breakdown,
  labourToday,
}: {
  breakdown: SiteBreakdown | null;
  /** The band's Labour Working figure (distinct members across all Sites) —
   * the totals row shows this, never a sum of the per-Site distinct counts,
   * which would double-count a member who attended two Sites (and a `?? 0`
   * sum over all-null rows would fabricate a 0 headcount). */
  labourToday: number;
}) {
  const router = useRouter();

  let state: DataTableState<Row>;
  if (!isValidBreakdown(breakdown)) {
    state = {
      status: "error",
      message: "Couldn't load site operations right now.",
      retryLabel: "Retry",
      onRetry: () => router.refresh(),
    };
  } else {
    const totals = breakdown.sites.reduce(
      (acc, site) => ({
        received: acc.received + site.received,
        consumed: acc.consumed + site.consumed,
        expenses: acc.expenses + site.expenses,
      }),
      { received: breakdown.godown.received, consumed: 0, expenses: 0 },
    );
    state = {
      status: "success",
      rows: [
        ...breakdown.sites.map((site) => ({ kind: "site" as const, ...site })),
        { kind: "godown" as const, received: breakdown.godown.received },
        { kind: "total" as const, labour: labourToday, ...totals },
      ],
    };
  }

  return (
    <DataTable
      columns={columns}
      state={state}
      rowKey={(row) => (row.kind === "site" ? row.id : row.kind)}
      rowHref={(row) => (row.kind === "site" ? `/sites/${row.id}` : undefined)}
      mobileCard={{
        primary: (row) =>
          row.kind === "site" ? row.name : row.kind === "godown" ? "Godown" : "Today across all sites",
        omitHeaders: ["Site"],
      }}
    />
  );
}
