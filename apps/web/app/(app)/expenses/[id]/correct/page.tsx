import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpenseForm, type ExpenseFormInitialValues } from "../../expense-form";

interface SiteOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ExpenseForCorrection {
  id: string;
  siteId: string;
  categoryId: string;
  description: string | null;
  paymentMethod: string | null;
  personOrVendor: string | null;
  incurredAt: string;
}

async function getExpense(id: string): Promise<ExpenseForCorrection | null> {
  const res = await authedFetch(`/expenses/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Expense (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getCategories(): Promise<CategoryOption[]> {
  const res = await authedFetch(`/expense-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expense Categories (${res.status})`);
  }
  return res.json();
}

// AC #3: the row's "Correct" action, never Edit/Delete — pre-fills from the
// Expense being corrected and submits to the same POST /expenses as a plain
// create, with correctsId (set here) telling the API this is a correction
// rather than a route split. Amount is intentionally left blank: a
// correcting row's amount is a signed delta (Story 5.1 Dev Notes), so
// pre-filling the original's value would read as a restated total.
export default async function CorrectExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expense, sites, categories] = await Promise.all([getExpense(id), getSites(), getCategories()]);
  if (!expense) {
    notFound();
  }

  const initial: ExpenseFormInitialValues = {
    siteId: expense.siteId,
    categoryId: expense.categoryId,
    description: expense.description ?? undefined,
    paymentMethod: expense.paymentMethod ?? undefined,
    personOrVendor: expense.personOrVendor ?? undefined,
    incurredAt: expense.incurredAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/expenses" className="hover:text-accent-teal-700 hover:underline">
          Expenses
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Expense</h1>
      <ExpenseForm mode="correct" correctsId={expense.id} sites={sites} categories={categories} initial={initial} />
    </div>
  );
}
