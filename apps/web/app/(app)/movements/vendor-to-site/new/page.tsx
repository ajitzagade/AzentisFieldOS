import { authedFetch } from "@/lib/api";
import { getTeamNames } from "../../team-names";
import { PurchaseForm } from "../../purchases/purchase-form";

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

interface VendorOption {
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

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await authedFetch(`/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

async function getVendors(): Promise<VendorOption[]> {
  const res = await authedFetch(`/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

// FR-10: a direct Vendor->Site Purchase is Purchase.destination = SITE
// (Story 5.1), not a new transaction type — this page is a UX entry point
// that pre-sets destination and skips the toggle, reusing the same form,
// schema, and service (AD-7).
export default async function NewVendorToSitePurchasePage() {
  const [sites, materials, vendors, teamNames] = await Promise.all([
    getSites(),
    getMaterials(),
    getVendors(),
    getTeamNames(),
  ]);

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Direct Vendor → Site Purchase</h1>
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} fixedDestination="SITE" teamNames={teamNames} />
    </div>
  );
}
