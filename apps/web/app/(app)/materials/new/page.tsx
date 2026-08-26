import { authedFetch } from "@/lib/api";
import { NewMaterialForm } from "./new-material-form";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Unit {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  const res = await authedFetch(`/material-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Material Categories (${res.status})`);
  }
  return res.json();
}

async function getUnits(): Promise<Unit[]> {
  const res = await authedFetch(`/units`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Units (${res.status})`);
  }
  return res.json();
}

export default async function NewMaterialPage() {
  const [categories, units] = await Promise.all([getCategories(), getUnits()]);
  // AC #3: a disabled Category is hidden from the Category picker on new
  // Materials — it's still valid for Materials already assigned to it.
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Material</h1>
      <NewMaterialForm categories={activeCategories} units={units} />
    </div>
  );
}
