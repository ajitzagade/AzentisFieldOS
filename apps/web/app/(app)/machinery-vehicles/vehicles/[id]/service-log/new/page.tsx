import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceLogForm } from "../../../../service-log-form";

interface VehicleListItem {
  id: string;
  number: string;
}

async function getVehicle(id: string): Promise<VehicleListItem | null> {
  const res = await fetch(`${process.env.API_URL}/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle (${res.status})`);
  }
  return res.json();
}

// FR-18: logs a fuel/maintenance/repair entry against this Vehicle.
export default async function NewVehicleServiceLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
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
        / Log Service
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Log Fuel / Maintenance / Repair — {vehicle.number}</h1>
      <ServiceLogForm mode="new" assetType="VEHICLE" assetId={vehicle.id} />
    </div>
  );
}
