import Link from "next/link";
import { Badge, DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { AddCategoryForm } from "./add-category-form";
import { ToggleActiveButton } from "./toggle-active-button";

export interface MaterialCategoryItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getCategories(): Promise<MaterialCategoryItem[]> {
  const res = await fetch(`${process.env.API_URL}/material-categories`, { cache: "no-store" });
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
    cell: (c) => <ToggleActiveButton id={c.id} isActive={c.isActive} />,
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
