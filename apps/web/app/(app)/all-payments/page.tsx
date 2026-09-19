import { authedFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { AlertTriangleIcon, StatTile, WalletIcon } from "@azentisfieldos/ui";
import { AllPaymentsListClient, type PaymentOverviewRow } from "./all-payments-client";

// The unified "All Payments" view (2026-09-19): every money-out record —
// Employee Payments & Advances, Subcontractor Payments, Vendor Purchases,
// RMC, Waste Disposal, Vendor Advances, Expenses — in one date-ordered,
// filterable feed with paid/unpaid/pending visibility. Read-only: every
// action (Mark Paid, Correct, Add Pricing) stays on the owning surface.

interface AllPaymentsSummary {
  paidTotal: number;
  outstandingTotal: number;
  pendingPricingCount: number;
}

interface AllPaymentsSearchParams {
  q?: string;
  range?: string;
  status?: string;
  kind?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

const DEFAULT_PAGE_SIZE = 25;

type RangePreset = "today" | "week" | "month" | "all";

const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All time",
};

function toRangePreset(value: string | undefined): RangePreset {
  return value === "today" || value === "week" || value === "all" ? value : "month";
}

// Preset → inclusive [from, to] date strings for apps/api's dateRangeBounds.
// UTC calendar boundaries, consistent with the app's UTC date convention
// (see date-range.ts); the week starts on Monday.
function rangeBounds(preset: RangePreset): { from?: string; to?: string } {
  if (preset === "all") return {};
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const to = iso(now);
  if (preset === "today") return { from: to, to };
  if (preset === "week") {
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    return { from: iso(monday), to };
  }
  return { from: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))), to };
}

async function getOverview(
  params: AllPaymentsSearchParams,
  bounds: { from?: string; to?: string },
): Promise<PaginatedResult<PaymentOverviewRow>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.kind) query.set("kind", params.kind);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (bounds.from) query.set("from", bounds.from);
  if (bounds.to) query.set("to", bounds.to);

  const res = await authedFetch(`/payments-overview?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load All Payments (${res.status})`);
  }
  return res.json();
}

async function getSummary(bounds: { from?: string; to?: string }): Promise<AllPaymentsSummary> {
  const query = new URLSearchParams();
  if (bounds.from) query.set("from", bounds.from);
  if (bounds.to) query.set("to", bounds.to);

  const res = await authedFetch(`/payments-overview/summary?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load All Payments summary (${res.status})`);
  }
  return res.json();
}

export default async function AllPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<AllPaymentsSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const range = toRangePreset(params.range);
  const bounds = rangeBounds(range);
  const [overview, summary] = await Promise.all([getOverview(params, bounds), getSummary(bounds)]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">All Payments</h1>
        <p className="text-body-sm text-ink-500">
          Every payment in one place — Employee, Subcontractor, Vendor, RMC, Waste Disposal and Expenses
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(summary.paidTotal)}
          label={`Paid (${RANGE_LABELS[range]})`}
          tint="gold"
        />
        <StatTile
          icon={<AlertTriangleIcon />}
          value={formatMoney(summary.outstandingTotal)}
          label="Unpaid / Partial / Pending"
        />
        {/* D7: unpriced Purchases surface as a count, never as ₹0. */}
        <StatTile icon={<AlertTriangleIcon />} value={summary.pendingPricingCount} label="Purchases Pending Pricing" />
      </div>

      <AllPaymentsListClient
        rows={overview.rows}
        total={overview.total}
        page={overview.page}
        pageSize={overview.pageSize}
      />
    </>
  );
}
