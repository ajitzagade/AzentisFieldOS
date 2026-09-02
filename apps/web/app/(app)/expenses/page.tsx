import { authedFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { LayersIcon, PlusIcon, ReceiptIcon, StatTile, WalletIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { ExpensesListClient, type ExpenseRow } from "./expenses-list-client";

interface ExpenseSummary {
  totalThisMonth: number;
  totalThisWeek: number;
  largestCategoryThisMonth: { name: string; total: number } | null;
}

interface ExpensesPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getExpenses(params: ExpensesPageSearchParams): Promise<PaginatedResult<ExpenseRow>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/expenses?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expenses (${res.status})`);
  }
  return res.json();
}

// Task 4's stat tiles are server-computed aggregates (ExpensesService.summary),
// not a client-side reduction over the unbounded list() fetch above.
async function getSummary(): Promise<ExpenseSummary> {
  const res = await authedFetch(`/expenses/summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expense summary (${res.status})`);
  }
  return res.json();
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<ExpensesPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [expensesResult, summary] = await Promise.all([getExpenses(params), getSummary()]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Expenses</h1>
          <p className="text-body-sm text-ink-500">
            Site expenses across all Sites — captured as they happen, categorized consistently
          </p>
        </div>
        <div className="action-button-row sm:items-center">
          <Link href="/expenses/categories" className={cn(buttonVariants({ variant: "secondary" }))}>
            <LayersIcon className="size-4" />
            Categories
          </Link>
          <Link href="/expenses/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Record Expense
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(summary.totalThisMonth)}
          label="Total this month"
          tint="gold"
        />
        <StatTile icon={<ReceiptIcon />} value={formatMoney(summary.totalThisWeek)} label="Total this week" />
        <StatTile
          icon={<LayersIcon />}
          value={summary.largestCategoryThisMonth?.name ?? "—"}
          label="Largest category this month"
          tint="success"
        />
      </div>

      <ExpensesListClient
        rows={expensesResult.rows}
        total={expensesResult.total}
        page={expensesResult.page}
        pageSize={expensesResult.pageSize}
      />

      <p className="mt-4 text-caption text-ink-500">
        Expenses can be recorded here directly, or logged as part of a Daily Report.
      </p>
    </>
  );
}
