import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetMovementForm, type AssetMovementFormInitialValues } from "../../../../../asset-movement-form";

interface MachineryListItem {
  id: string;
  name: string;
}

interface SiteOption {
  id: string;
  name: string;
}

interface MovementLogItem {
  id: string;
  toStatus: "AVAILABLE" | "AT_SITE" | "MAINTENANCE";
  siteId: string | null;
  movedAt: string;
}

async function getMachinery(id: string): Promise<MachineryListItem | null> {
  const res = await authedFetch(`/machinery/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
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

async function getMovements(assetId: string): Promise<MovementLogItem[]> {
  const res = await authedFetch(`/asset-movements?assetType=MACHINERY&assetId=${assetId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Movement History (${res.status})`);
  }
  return res.json();
}

// AC #4: the row's "Correct" action, never Edit/Delete — pre-fills from
// the Movement being corrected, submits to the same POST /asset-movements
// as a plain create; correctsId (set here) tells the API this is a
// correction, same pattern as every other correction flow in this
// codebase (Movement, Payment).
export default async function CorrectMachineryMovementPage({
  params,
}: {
  params: Promise<{ id: string; movementId: string }>;
}) {
  const { id, movementId } = await params;
  const [machinery, sites, movements] = await Promise.all([getMachinery(id), getSites(), getMovements(id)]);
  if (!machinery) {
    notFound();
  }
  const movement = movements.find((m) => m.id === movementId);
  if (!movement) {
    notFound();
  }

  const initial: AssetMovementFormInitialValues = {
    toStatus: movement.toStatus,
    siteId: movement.siteId ?? undefined,
    movedAt: movement.movedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/machinery-vehicles" className="hover:text-accent-teal-700 hover:underline">
          Machinery &amp; Vehicles
        </Link>{" "}
        /{" "}
        <Link href={`/machinery-vehicles/machinery/${machinery.id}`} className="hover:text-accent-teal-700 hover:underline">
          {machinery.name}
        </Link>{" "}
        / Correct Movement
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Movement — {machinery.name}</h1>
      <AssetMovementForm
        mode="correct"
        assetType="MACHINERY"
        assetId={machinery.id}
        correctsId={movement.id}
        sites={sites}
        initial={initial}
      />
    </div>
  );
}
