import { authedFetch } from "@/lib/api";
import { ReturnWastageForm } from "../return-wastage-form";

interface SiteOption {
  id: string;
  name: string;
}

interface MaterialListItem {
  id: string;
  name: string;
  unit: { name: string };
  sizes: { id: string; label: string }[];
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await authedFetch(`/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

export default async function NewReturnWastagePage() {
  const [sites, materials] = await Promise.all([getSites(), getMaterials()]);

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Wastage / Return</h1>
      <ReturnWastageForm mode="new" materialSizes={materialSizes} sites={sites} />
    </div>
  );
}
