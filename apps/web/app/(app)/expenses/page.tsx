import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  CorrectAction,
  DataTable,
  LayersIcon,
  PlusIcon,
  ReceiptIcon,
  RotateCcwIcon,
  StatTile,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

interface ExpenseRow {
  id: string;
  amount: string;
  description: string | null;
  paymentMethod: string | null;
  personOrVendor: string | null;
  incurredAt: string;
  site: { id: string; name: string };
  category: { id: string; name: string };
}

interface ExpenseSummary {
  totalThisMonth: number;
  totalThisWeek: number;
  largestCategoryThisMonth: { name: string; total: number } | null;
}

async function getExpenses(): Promise<ExpenseRow[]> {
  const res = await authedFetch(`/expenses`, { cache: "no-store" });
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

const columns: DataTableColumn<ExpenseRow>[] = [
  { header: "Date", cell: (row) => formatDate(row.incurredAt) },
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Category", cell: (row) => row.category.name },
  {
    header: "Amount",
    align: "right",
    cell: (row) => <span className="font-semibold text-gold-700">{formatMoney(Number(row.amount))}</span>,
  },
  {
    header: "Description",
    cell: (row) => row.description ?? <span className="text-ink-500">—</span>,
  },
  { header: "Payment method", cell: (row) => row.paymentMethod ?? <span className="text-ink-500">—</span> },
  { header: "Person / Vendor", cell: (row) => row.personOrVendor ?? <span className="text-ink-500">—</span> },
  {
    header: "",
    // AC #3: the row action is always "Correct", never Edit/Delete (AD-9).
    cell: (row) => (
      <div className="flex items-center justify-end">
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/expenses/${row.id}/correct`} />
      </div>
    ),
  },
];

export default async function ExpensesPage() {
  const [expenses, summary] = await Promise.all([getExpenses(), getSummary()]);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Expenses</h1>
          <p className="text-body-sm text-ink-500">
            Site expenses across all Sites — captured as they happen, categorized consistently
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          expenses.length === 0
            ? {
                status: "empty",
                icon: <ReceiptIcon />,
                message: "No Expenses recorded yet.",
                action: (
                  <Link href="/expenses/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Record your first Expense
                  </Link>
                ),
              }
            : { status: "success", rows: expenses }
        }
      />

      <p className="mt-4 text-caption text-ink-500">
        Expenses can be recorded here directly, or logged as part of a Daily Site Report.
      </p>
    </>
  );
}
