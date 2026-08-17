import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetMovementForm, type AssetMovementFormInitialValues } from "../../../../../asset-movement-form";

interface VehicleListItem {
  id: string;
  number: string;
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

async function getVehicle(id: string): Promise<VehicleListItem | null> {
  const res = await fetch(`${process.env.API_URL}/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getMovements(assetId: string): Promise<MovementLogItem[]> {
  const res = await fetch(`${process.env.API_URL}/asset-movements?assetType=VEHICLE&assetId=${assetId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Movement History (${res.status})`);
  }
  return res.json();
}

// AC #4: the row's "Correct" action, never Edit/Delete — same pattern as
// the Machinery correction route.
export default async function CorrectVehicleMovementPage({
  params,
}: {
  params: Promise<{ id: string; movementId: string }>;
}) {
  const { id, movementId } = await params;
  const [vehicle, sites, movements] = await Promise.all([getVehicle(id), getSites(), getMovements(id)]);
  if (!vehicle) {
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
        <Link href={`/machinery-vehicles/vehicles/${vehicle.id}`} className="hover:text-accent-teal-700 hover:underline">
          {vehicle.number}
        </Link>{" "}
        / Correct Movement
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Movement — {vehicle.number}</h1>
      <AssetMovementForm
        mode="correct"
        assetType="VEHICLE"
        assetId={vehicle.id}
        correctsId={movement.id}
        sites={sites}
        initial={initial}
      />
    </div>
  );
}
