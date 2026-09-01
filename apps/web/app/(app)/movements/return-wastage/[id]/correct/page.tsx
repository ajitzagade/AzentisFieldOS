import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReturnWastageForm, type ReturnWastageFormInitialValues } from "../../return-wastage-form";

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

interface ReturnWastageForCorrection {
  id: string;
  siteId: string;
  kind: "RETURN" | "WASTAGE";
  // Prisma Decimal — serialized as a string over JSON.
  quantity: string;
  notes: string | null;
  recordedAt: string;
  materialSize: { id: string };
}

async function getReturnWastage(id: string): Promise<ReturnWastageForCorrection | null> {
  const res = await authedFetch(`/return-wastage/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Return/Wastage entry (${res.status})`);
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

// AC #3: pre-fills from the entry being corrected, submits to the same
// POST /return-wastage as a plain create — correctsId (set here) tells
// the API this is a correction, same pattern as Story 5.1's Purchase.
export default async function CorrectReturnWastagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [entry, sites, materials] = await Promise.all([getReturnWastage(id), getSites(), getMaterials()]);
  if (!entry) {
    notFound();
  }

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({
      id: size.id,
      label: `${material.name} (${size.label})`,
      description: material.unit.name,
    })),
  );

  const initial: ReturnWastageFormInitialValues = {
    siteId: entry.siteId,
    materialSizeId: entry.materialSize.id,
    kind: entry.kind,
    // The original quantity — correct mode shows it so the user types the
    // corrected value and the form derives the signed delta.
    quantity: Number(entry.quantity),
    notes: entry.notes ?? undefined,
    recordedAt: entry.recordedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Wastage / Return</h1>
      <ReturnWastageForm mode="correct" correctsId={entry.id} materialSizes={materialSizes} sites={sites} initial={initial} />
    </div>
  );
}
