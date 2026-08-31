import { authedFetch } from "@/lib/api";
import { getTeamNames } from "../../team-names";
import { MovementForm } from "../movement-form";

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

export default async function NewMovementPage({
  searchParams,
}: {
  searchParams?: Promise<{ materialId?: string; siteId?: string; materialSizeId?: string }>;
} = {}) {
  const [sites, materials, teamNames, { materialId, siteId, materialSizeId } = {}] = await Promise.all([
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

  // The Inventory low-stock flag deep-links here with ?materialId= — the
  // flag is per-Material while this form picks a Material Size, so the
  // prefill is only unambiguous when the Material has exactly one size.
  const flaggedMaterial = materials.find((m) => m.id === materialId);
  const singleSizeMaterialSizeId = flaggedMaterial?.sizes.length === 1 ? flaggedMaterial.sizes[0]!.id : undefined;
  // Story 16.3: the Material-availability page already knows the exact
  // Size (its rows are keyed by materialSizeId), so it deep-links with an
  // unambiguous ?materialSizeId= instead of guessing from ?materialId= —
  // this wins over the single-Size heuristic above when both are present.
  const explicitMaterialSizeId = materialSizes.some((m) => m.id === materialSizeId) ? materialSizeId : undefined;
  const prefillMaterialSizeId = explicitMaterialSizeId ?? singleSizeMaterialSizeId;
  const prefillSiteId = sites.some((s) => s.id === siteId) ? siteId : undefined;
  const initial =
    prefillMaterialSizeId || prefillSiteId
      ? { materialSizeId: prefillMaterialSizeId, destinationSiteId: prefillSiteId }
      : undefined;

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Godown → Site Movement</h1>
      <MovementForm mode="new" materialSizes={materialSizes} sites={sites} initial={initial} teamNames={teamNames} />
    </div>
  );
}
