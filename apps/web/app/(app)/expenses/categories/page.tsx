import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { CategoryRowActions } from "../../_components/category-row-actions";
import { AddExpenseCategoryForm } from "./add-expense-category-form";
import { renameExpenseCategoryAction, toggleExpenseCategoryAction } from "./actions";

interface ExpenseCategoryItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getExpenseCategories(): Promise<ExpenseCategoryItem[]> {
  const res = await authedFetch(`/expense-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expense Categories (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<ExpenseCategoryItem>[] = [
  {
    header: "Name",
    cell: (c) => (
      <span className="flex items-center gap-2 font-semibold">
        {c.name}
        {!c.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
  {
    header: "",
    align: "right",
    cell: (c) => (
      <CategoryRowActions
        key={`${c.id}-${c.name}`}
        name={c.name}
        isActive={c.isActive}
        renameAction={renameExpenseCategoryAction.bind(null, c.id)}
        toggleAction={toggleExpenseCategoryAction.bind(null, c.id, !c.isActive)}
      />
    ),
  },
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
