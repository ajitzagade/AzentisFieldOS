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

// FR-11: Movement.kind = SITE_TO_SITE against the exact same Movement
// model/schema/service/form Story 5.2 built for GODOWN_TO_SITE — not a
// new transaction type (Story 5.4 Dev Notes).
export default async function NewSiteToSiteTransferPage() {
  const [sites, materials, teamNames] = await Promise.all([getSites(), getMaterials(), getTeamNames()]);

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Site → Site Transfer</h1>
      <MovementForm mode="new" kind="SITE_TO_SITE" materialSizes={materialSizes} sites={sites} teamNames={teamNames} />
    </div>
  );
}
