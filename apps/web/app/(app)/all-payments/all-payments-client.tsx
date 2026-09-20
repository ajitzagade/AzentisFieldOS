"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  ChevronRightIcon,
  DataTable,
  Pagination,
  SelectField,
  TextField,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { formatDate, formatMoney } from "../../../lib/format";

// Mirrors apps/api's PaymentOverviewRow (payments-overview.service.ts) —
// Decimals arrive serialized as strings, dates as ISO strings.
export type PaymentOverviewKind =
  | "EMPLOYEE_PAYMENT"
  | "EMPLOYEE_ADVANCE"
  | "SUBCONTRACTOR"
  | "PURCHASE"
  | "RMC"
  | "WASTE_DISPOSAL"
  | "VENDOR_ADVANCE"
  | "EXPENSE";

export type PaymentOverviewStatus = "PAID" | "PARTIAL" | "UNPAID" | "PENDING" | "PRICING_PENDING";

export interface PaymentOverviewRow {
  kind: PaymentOverviewKind;
  id: string;
  date: string;
  partyName: string;
  siteName: string | null;
  detail: string | null;
  amount: string | null;
  status: PaymentOverviewStatus | null;
  isCorrection: boolean;
  refs: { teamMemberId?: string; siteId?: string; contractId?: string };
}

const KIND_LABELS: Record<PaymentOverviewKind, string> = {
  EMPLOYEE_PAYMENT: "Employee Payment",
  EMPLOYEE_ADVANCE: "Employee Advance",
  SUBCONTRACTOR: "Subcontractor",
  PURCHASE: "Purchase",
  RMC: "RMC",
  WASTE_DISPOSAL: "Waste Material",
  VENDOR_ADVANCE: "Vendor Advance",
  EXPENSE: "Expense",
};

const KIND_BADGE_VARIANTS: Record<PaymentOverviewKind, "success" | "warning" | "neutral" | "danger" | "gold"> = {
  EMPLOYEE_PAYMENT: "gold",
  EMPLOYEE_ADVANCE: "gold",
  SUBCONTRACTOR: "neutral",
  PURCHASE: "success",
  RMC: "neutral",
  WASTE_DISPOSAL: "danger",
  VENDOR_ADVANCE: "neutral",
  EXPENSE: "warning",
};

// Where each row's chevron leads — the surface that owns the record (this
// page is a read-only feed; Mark Paid / Correct / Add Pricing stay on the
// owning pages).
function rowHref(row: PaymentOverviewRow): string {
  switch (row.kind) {
    case "EMPLOYEE_PAYMENT":
    case "EMPLOYEE_ADVANCE":
      return row.refs.teamMemberId ? `/team/${row.refs.teamMemberId}` : "/payments";
    case "SUBCONTRACTOR":
      return row.refs.siteId && row.refs.contractId
        ? `/sites/${row.refs.siteId}/contracts/${row.refs.contractId}`
        : "/subcontractors";
    case "PURCHASE":
      return "/movements";
    case "RMC":
      return "/rmc";
    case "WASTE_DISPOSAL":
      return "/waste-disposal";
    case "VENDOR_ADVANCE":
      return "/vendors";
    case "EXPENSE":
      return "/expenses";
  }
}

function statusBadge(status: PaymentOverviewStatus | null) {
  switch (status) {
    case "PAID":
      return <Badge variant="success">Paid</Badge>;
    case "PARTIAL":
      return <Badge variant="gold">Partial</Badge>;
    case "UNPAID":
      return <Badge variant="danger">Unpaid</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "PRICING_PENDING":
      return <Badge variant="warning">Pricing pending</Badge>;
    default:
      // RMC (no payment status tracked) and unpriced correction deltas.
      return <span className="text-ink-500">—</span>;
  }
}

const columns: DataTableColumn<PaymentOverviewRow>[] = [
  { header: "Date", cell: (r) => <span className="text-ink-500">{formatDate(r.date)}</span>, sortKey: "date" },
  {
    header: "Type",
    cell: (r) => (
      <span className="inline-flex flex-wrap items-center gap-1">
        <Badge variant={KIND_BADGE_VARIANTS[r.kind]}>{KIND_LABELS[r.kind]}</Badge>
        {r.isCorrection ? <Badge variant="neutral">Correction</Badge> : null}
      </span>
    ),
  },
  { header: "Paid To", cell: (r) => r.partyName },
  { header: "Site", cell: (r) => r.siteName ?? <span className="text-ink-500">—</span> },
  { header: "Details", cell: (r) => r.detail ?? <span className="text-ink-500">—</span> },
  {
    header: "Amount",
    align: "right",
    cell: (r) =>
      // D7: an unpriced Purchase has no amount yet — never a silent ₹0.
      r.amount === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        <span className="font-semibold text-gold-700 tabular-nums">{formatMoney(Number(r.amount))}</span>
      ),
  },
  { header: "Status", cell: (r) => statusBadge(r.status) },
  {
    header: "",
    cell: (r) => (
      <Link
        href={rowHref(r)}
        aria-label={`View ${KIND_LABELS[r.kind]} for ${r.partyName}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    ),
  },
];

const mobileCard: DataTableMobileCard<PaymentOverviewRow> = {
  primary: (r) => (
    <span className="flex flex-wrap items-center gap-2">
      <Badge variant={KIND_BADGE_VARIANTS[r.kind]}>{KIND_LABELS[r.kind]}</Badge>
      {r.partyName}
    </span>
  ),
  omitHeaders: ["Type", "Paid To"],
  action: (r) => (
    <Link
      href={rowHref(r)}
      aria-label={`View ${KIND_LABELS[r.kind]} for ${r.partyName}`}
      className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
    >
      <ChevronRightIcon className="size-4" />
    </Link>
  ),
};

// "month" is the default view (no query param) — see page.tsx's rangeBounds.
const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All time" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partially paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PENDING", label: "Pending" },
];

const KIND_OPTIONS = [
  { value: "", label: "All types" },
  ...(Object.entries(KIND_LABELS) as [PaymentOverviewKind, string][]).map(([value, label]) => ({ value, label })),
];

export function AllPaymentsListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: PaymentOverviewRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveFilter =
    Boolean(query.q) || Boolean(query.getFilter("status")) || Boolean(query.getFilter("kind"));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField
          label="Search"
          placeholder="Team Member, Vendor or Subcontractor…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0"
        />
        <SelectField
          label="Period"
          options={RANGE_OPTIONS}
          value={query.getFilter("range") ?? "month"}
          onChange={(e) => query.setFilter("range", e.target.value === "month" ? null : e.target.value)}
          className="mb-0"
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={query.getFilter("status") ?? ""}
          onChange={(e) => query.setFilter("status", e.target.value || null)}
          className="mb-0"
        />
        <SelectField
          label="Type"
          options={KIND_OPTIONS}
          value={query.getFilter("kind") ?? ""}
          onChange={(e) => query.setFilter("kind", e.target.value || null)}
          className="mb-0"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(r) => `${r.kind}:${r.id}`}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveFilter
              ? {
                  status: "empty",
                  icon: <WalletIcon />,
                  message: "No payments match your filters.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll(["status", "kind", "range"])}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <WalletIcon />,
                  message: "No payments recorded in this period.",
                }
            : { status: "success", rows }
        }
      />

      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={query.setPage} />
      </div>
    </>
  );
}
