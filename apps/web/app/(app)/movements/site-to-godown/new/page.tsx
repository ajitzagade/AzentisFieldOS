import { authedFetch } from "@/lib/api";
import { getTeamNames } from "../../team-names";
import { MovementForm } from "../../godown-to-site/movement-form";

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

// Site to Godown (2026-09-22): returning excess/unused material from a Site
// back to the central Godown — Movement.kind = SITE_TO_GODOWN against the
// exact same Movement model/schema/service/form GODOWN_TO_SITE and
// SITE_TO_SITE already use, not a new transaction type (AD-7).
export default async function NewSiteToGodownPage({
  searchParams,
}: {
  searchParams?: Promise<{ materialSizeId?: string; sourceSiteId?: string }>;
} = {}) {
  const [sites, materials, teamNames, { materialSizeId, sourceSiteId } = {}] = await Promise.all([
    getSites(),
    getMaterials(),
    getTeamNames(),
    searchParams,
  ]);

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  const prefillMaterialSizeId = materialSizes.some((m) => m.id === materialSizeId) ? materialSizeId : undefined;
  const prefillSourceSiteId = sites.some((s) => s.id === sourceSiteId) ? sourceSiteId : undefined;
  const initial =
    prefillMaterialSizeId || prefillSourceSiteId
      ? { materialSizeId: prefillMaterialSizeId, sourceSiteId: prefillSourceSiteId }
      : undefined;

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Site to Godown</h1>
      <MovementForm
        mode="new"
        kind="SITE_TO_GODOWN"
        materialSizes={materialSizes}
        sites={sites}
        initial={initial}
        teamNames={teamNames}
      />
    </div>
  );
}
