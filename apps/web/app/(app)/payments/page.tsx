import { authedFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { AlertTriangleIcon, PlusIcon, StatTile, WalletIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { PaymentsListClient, type PaymentListItem } from "./payments-list-client";

interface TeamSummary {
  monthlyPaymentTotal: number;
}

interface OutstandingAdvances {
  total: number;
}

interface PaymentsPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getPayments(params: PaymentsPageSearchParams): Promise<PaginatedResult<PaymentListItem>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/payments?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Payments (${res.status})`);
  }
  return res.json();
}

async function getPendingCount(): Promise<number> {
  const res = await authedFetch(`/payments/count/pending`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load pending Payments count (${res.status})`);
  }
  return res.json();
}

async function getTeamSummary(): Promise<TeamSummary> {
  const res = await authedFetch(`/team-members/team-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Summary (${res.status})`);
  }
  return res.json();
}

// Story 7.4 (AC #1): the one shared Outstanding Advances number — the
// Team list page reads the same endpoint, never a second computation.
async function getOutstandingAdvances(): Promise<OutstandingAdvances> {
  const res = await authedFetch(`/team-members/outstanding-advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Outstanding Advances (${res.status})`);
  }
  return res.json();
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<PaymentsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [paymentsResult, pendingCount, teamSummary, outstandingAdvances] = await Promise.all([
    getPayments(params),
    getPendingCount(),
    getTeamSummary(),
    getOutstandingAdvances(),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Payments</h1>
          <p className="text-body-sm text-ink-500">Base + Additional − Deductions − Advance Adjustment = Net Payable</p>
        </div>
        <Link href="/payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Record Payment
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(teamSummary.monthlyPaymentTotal)}
          label="Total Paid This Month"
          tint="gold"
        />
        <StatTile icon={<AlertTriangleIcon />} value={pendingCount} label="Pending Payments" />
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(outstandingAdvances.total)}
          label="Total Outstanding Advances"
          tint="gold"
        />
      </div>

      <PaymentsListClient
        rows={paymentsResult.rows}
        total={paymentsResult.total}
        page={paymentsResult.page}
        pageSize={paymentsResult.pageSize}
      />
    </>
  );
}
