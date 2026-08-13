import { PurchaseForm } from "../purchase-form";

interface SiteOption {
  id: string;
  name: string;
}

interface MaterialListItem {
  id: string;
  name: string;
  sizes: { id: string; label: string }[];
}

async function getSites(): Promise<SiteOption[]> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await fetch(`${process.env.API_URL}/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

export default async function NewPurchasePage() {
  const [sites, materials] = await Promise.all([getSites(), getMaterials()]);

  // A Purchase always targets a specific Size, never a bare Material — a
  // Material with no Sizes yet has nothing to offer this picker.
  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({ id: size.id, label: `${material.name} (${size.label})` })),
  );

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Purchase</h1>
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} />
    </div>
  );
}
