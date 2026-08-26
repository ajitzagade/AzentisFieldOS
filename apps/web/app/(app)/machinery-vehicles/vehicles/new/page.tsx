import { authedFetch } from "@/lib/api";
import { NewVehicleForm } from "./new-vehicle-form";

interface VehicleTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getVehicleTypes(): Promise<VehicleTypeOption[]> {
  const res = await authedFetch(`/vehicle-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle Types (${res.status})`);
  }
  return res.json();
}

export default async function NewVehiclePage() {
  const vehicleTypes = await getVehicleTypes();
  // Story 14.3 (AC #1): a disabled Vehicle Type is hidden from the Type picker
  // on new Vehicles — it stays valid for vehicles already assigned to it.
  const activeVehicleTypes = vehicleTypes.filter((t) => t.isActive);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Register Vehicle</h1>
      <NewVehicleForm vehicleTypes={activeVehicleTypes} />
    </div>
  );
}
