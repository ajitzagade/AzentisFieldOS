import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsumptionForm, type ConsumptionFormInitialValues } from "../../consumption-form";

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

interface ConsumptionForCorrection {
  id: string;
  siteId: string;
  // Prisma Decimal — serialized as a string over JSON.
  quantity: string;
  activityReference: string | null;
  notes: string | null;
  consumedAt: string;
  materialSize: { id: string };
}

async function getConsumption(id: string): Promise<ConsumptionForCorrection | null> {
  const res = await authedFetch(`/consumption/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Consumption (${res.status})`);
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

// AC #4: pre-fills from the Consumption being corrected, submits to the
// same POST /consumption as a plain create — correctsId (set here) tells
// the API this is a correction, same pattern as Story 5.1's Purchase.
export default async function CorrectConsumptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [consumption, sites, materials] = await Promise.all([getConsumption(id), getSites(), getMaterials()]);
  if (!consumption) {
    notFound();
  }

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  const initial: ConsumptionFormInitialValues = {
    siteId: consumption.siteId,
    materialSizeId: consumption.materialSize.id,
    // The original quantity — correct mode shows it so the user types the
    // corrected value and the form derives the signed delta.
    quantity: Number(consumption.quantity),
    activityReference: consumption.activityReference ?? undefined,
    notes: consumption.notes ?? undefined,
    consumedAt: consumption.consumedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Consumption</h1>
      <ConsumptionForm mode="correct" correctsId={consumption.id} materialSizes={materialSizes} sites={sites} initial={initial} />
    </div>
  );
}
