import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetMovementForm } from "../../../asset-movement-form";

interface VehicleListItem {
  id: string;
  number: string;
}

interface SiteOption {
  id: string;
  name: string;
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

// AC #1, #3: records a Vehicle's movement to a new Site or to
// Maintenance/Available — "current Site" updates immediately, but this is
// always a manually recorded fact, never live tracking.
export default async function MoveVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, sites] = await Promise.all([getVehicle(id), getSites()]);
  if (!vehicle) {
    notFound();
  }

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
        / Move
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Record Movement — {vehicle.number}</h1>
      <AssetMovementForm mode="new" assetType="VEHICLE" assetId={vehicle.id} sites={sites} />
    </div>
  );
}
