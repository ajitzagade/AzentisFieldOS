import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { CategoryRowActions } from "../../_components/category-row-actions";
import { AddCategoryForm } from "./add-category-form";
import { renameMaterialCategoryAction, toggleMaterialCategoryAction } from "./actions";

export interface MaterialCategoryItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getCategories(): Promise<MaterialCategoryItem[]> {
  const res = await authedFetch(`/material-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Material Categories (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<MaterialCategoryItem>[] = [
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
        renameAction={renameMaterialCategoryAction.bind(null, c.id)}
        toggleAction={toggleMaterialCategoryAction.bind(null, c.id, !c.isActive)}
      />
    ),
  },
];

export default async function MaterialCategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/materials" className="hover:text-accent-teal-700 hover:underline">
          Materials
        </Link>{" "}
        / Categories
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Material Categories</h1>

      <div className="mb-6 max-w-160">
        <AddCategoryForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(c) => c.id}
        state={
          categories.length === 0
            ? { status: "empty", icon: <LayersIcon />, message: "No Categories yet." }
            : { status: "success", rows: categories }
        }
      />
    </>
  );
}
