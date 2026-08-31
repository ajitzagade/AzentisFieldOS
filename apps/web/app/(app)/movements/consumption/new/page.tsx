import { authedFetch } from "@/lib/api";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { HelpBubble } from "@azentisfieldos/ui";
import { ConsumptionForm } from "../consumption-form";

// The same explanation Help & Guides and the Client Presentation show for
// this concept — one shared content source, read here inline (EXPERIENCE.md
// Component Patterns → Contextual help).
const CONSUMPTION_HELP = HELP_CONTENT.contextualHelp.find((h) => h.key === "material-consumption");

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

export default async function NewConsumptionPage({
  searchParams,
}: {
  searchParams?: Promise<{ siteId?: string }>;
} = {}) {
  const [sites, materials, { siteId } = {}] = await Promise.all([getSites(), getMaterials(), searchParams]);

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  // Site detail deep-links here with ?siteId= so the Site arrives
  // pre-selected — only honored when it names a real Site.
  const prefillSiteId = sites.some((s) => s.id === siteId) ? siteId : undefined;

  return (
    <div className="max-w-160">
      <h1 className="mb-6 flex items-center gap-2 text-page-title text-ink-900">
        Record Consumption
        {CONSUMPTION_HELP ? <HelpBubble>{CONSUMPTION_HELP.explanation}</HelpBubble> : null}
      </h1>
      <ConsumptionForm
        mode="new"
        materialSizes={materialSizes}
        sites={sites}
        initial={prefillSiteId ? { siteId: prefillSiteId } : undefined}
      />
    </div>
  );
}
