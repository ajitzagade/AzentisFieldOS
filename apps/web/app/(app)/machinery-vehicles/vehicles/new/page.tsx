import { NewVehicleForm } from "./new-vehicle-form";

interface VehicleTypeOption {
  id: string;
  name: string;
}

async function getVehicleTypes(): Promise<VehicleTypeOption[]> {
  const res = await fetch(`${process.env.API_URL}/vehicle-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle Types (${res.status})`);
  }
  return res.json();
}

export default async function NewVehiclePage() {
  const vehicleTypes = await getVehicleTypes();

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Register Vehicle</h1>
      <NewVehicleForm vehicleTypes={vehicleTypes} />
    </div>
  );
}
