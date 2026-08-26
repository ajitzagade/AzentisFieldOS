import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { EditMaterialForm } from "./edit-material-form";
import { SizesSection } from "./sizes-section";
import type { MaterialListItem } from "../../page";

export type MaterialDetail = MaterialListItem;

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Unit {
  id: string;
  name: string;
}

// No GET /materials/:id endpoint exists (story 4.1 scoped only
// create/list/update) — fetch the list and find by id, the same interim
// approach story 2.1's Sites edit page originally used before a dedicated
// detail endpoint existed.
async function getMaterial(id: string): Promise<MaterialDetail | undefined> {
  const res = await authedFetch(`/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  const materials: MaterialDetail[] = await res.json();
  return materials.find((m) => m.id === id);
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

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [material, categories, units] = await Promise.all([getMaterial(id), getCategories(), getUnits()]);

  if (!material) {
    notFound();
  }

  // The Material's *current* Category must remain selectable even if it's
  // since been disabled (AC #3 only hides a disabled Category from *new*
  // Materials' picker, not from an already-assigned Material's own edit
  // form).
  const categoryOptions = categories.filter((c) => c.isActive || c.id === material.category.id);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Material</h1>
      <EditMaterialForm material={material} categories={categoryOptions} units={units} />
      <SizesSection materialId={material.id} sizes={material.sizes} />
    </div>
  );
}
