import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementForm, type MovementFormInitialValues } from "../../movement-form";

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

interface MovementForCorrection {
  id: string;
  kind: "GODOWN_TO_SITE" | "SITE_TO_SITE";
  sourceSiteId: string | null;
  destinationSiteId: string;
  vehicleDetails: string | null;
  personResponsible: string | null;
  notes: string | null;
  movedAt: string;
  materialSize: { id: string };
}

async function getMovement(id: string): Promise<MovementForCorrection | null> {
  const res = await authedFetch(`/movements/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Movement (${res.status})`);
  }
  return res.json();
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

// AC #3: pre-fills from the Movement being corrected, submits to the same
// POST /movements as a plain create — correctsId (set here) tells the API
// this is a correction, same pattern as Story 5.1's Purchase correction.
export default async function CorrectMovementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [movement, sites, materials] = await Promise.all([getMovement(id), getSites(), getMaterials()]);
  if (!movement) {
    notFound();
  }

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  const initial: MovementFormInitialValues = {
    materialSizeId: movement.materialSize.id,
    sourceSiteId: movement.sourceSiteId ?? undefined,
    destinationSiteId: movement.destinationSiteId,
    vehicleDetails: movement.vehicleDetails ?? undefined,
    personResponsible: movement.personResponsible ?? undefined,
    notes: movement.notes ?? undefined,
    movedAt: movement.movedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Movement</h1>
      <MovementForm
        mode="correct"
        kind={movement.kind}
        correctsId={movement.id}
        materialSizes={materialSizes}
        sites={sites}
        initial={initial}
      />
    </div>
  );
}
