import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { AddExpenseCategoryForm } from "./add-expense-category-form";

interface ExpenseCategoryItem {
  id: string;
  name: string;
}

async function getExpenseCategories(): Promise<ExpenseCategoryItem[]> {
  const res = await authedFetch(`/expense-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expense Categories (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<ExpenseCategoryItem>[] = [
  { header: "Name", cell: (c) => <span className="font-semibold">{c.name}</span> },
];

// Minimal create+list — Epic 14 owns the full admin lifecycle (edit,
// disable), same dedicated-route pattern every prior lookup table has used.
export default async function ExpenseCategoriesPage() {
  const categories = await getExpenseCategories();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/expenses" className="hover:text-accent-teal-700 hover:underline">
          Expenses
        </Link>{" "}
        / Categories
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Expense Categories</h1>

      <div className="mb-6 max-w-160">
        <AddExpenseCategoryForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(c) => c.id}
        state={
          categories.length === 0
            ? { status: "empty", icon: <LayersIcon />, message: "No Expense Categories yet." }
            : { status: "success", rows: categories }
        }
      />
    </>
  );
}
