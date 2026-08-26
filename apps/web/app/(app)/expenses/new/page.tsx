import { authedFetch } from "@/lib/api";
import { ExpenseForm } from "../expense-form";

interface SiteOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
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

export default async function NewExpensePage() {
  const [sites, categories] = await Promise.all([getSites(), getCategories()]);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Expense</h1>
      <ExpenseForm mode="new" sites={sites} categories={categories} />
    </div>
  );
}
