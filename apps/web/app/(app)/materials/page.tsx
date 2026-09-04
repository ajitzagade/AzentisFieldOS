import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import type { CustomFieldDefinition } from "@azentisfieldos/shared";
import { MaterialsTaxonomy, type TaxonomyCategory, type TaxonomyUnit } from "./materials-taxonomy";

export interface MaterialListItem {
  id: string;
  name: string;
  isActive: boolean;
  category: { id: string; name: string };
  unit: { id: string; name: string };
  sizes: { id: string; label: string }[];
  // Normalized to a real array by apps/api (materials.service.ts) even for
  // Materials created before story 4.3 — never the raw Prisma `{}` default.
  customFields: CustomFieldDefinition[];
  lowStockThreshold: string | null;
}

// Perf review 2026-09-03: master-data catalogs (Materials/Categories/Units)
// change rarely and every create/update/edit action here already calls
// revalidatePath("/materials") (materials/new, materials/categories,
// materials/units, materials/[id]/edit actions.ts) — so a short
// time-based revalidate window never shows stale data after a mutation.
// Code review 2026-09-04 correction: Next's fetch Data Cache key includes
// request headers, and authedFetch attaches a per-user Authorization
// header — so this cache entry is per-user, not shared tenant-wide. It
// still avoids a re-fetch when the SAME user re-opens this tab within the
// window (the reported symptom), just not concurrent different users
// sharing one DB round trip.
const CATALOG_REVALIDATE_SECONDS = 10;

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await authedFetch(`/materials`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

async function getCategories(): Promise<TaxonomyCategory[]> {
  const res = await authedFetch(`/material-categories`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Failed to load Material Categories (${res.status})`);
  }
  return res.json();
}

async function getUnits(): Promise<TaxonomyUnit[]> {
  const res = await authedFetch(`/units`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Failed to load Units (${res.status})`);
  }
  return res.json();
}

export interface MaterialsPageSearchParams {
  // A duplicate `?q=a&q=b` query string arrives as an array at runtime —
  // typed here to match reality rather than claiming a plain `string` the
  // framework doesn't actually guarantee.
  q?: string | string[];
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams?: Promise<MaterialsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const initialMaterialSearch = Array.isArray(params.q) ? params.q[0] : params.q;
  const [materials, categories, units] = await Promise.all([getMaterials(), getCategories(), getUnits()]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Materials</h1>
          <p className="text-body-sm text-ink-500">
            Configure Categories and their Materials — used throughout Purchases, Movements, Consumption, and Daily Reports
          </p>
        </div>
        <div className="action-button-row">
          <Link href="/materials/units" className={cn(buttonVariants({ variant: "secondary" }))}>
            Units
          </Link>
          <Link href="/materials/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Full Material form
          </Link>
        </div>
      </div>

      <MaterialsTaxonomy
        initialCategories={categories}
        initialMaterials={materials}
        units={units}
        initialMaterialSearch={initialMaterialSearch}
      />
    </>
  );
}
