import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { EditVehicleForm } from "./edit-vehicle-form";

// currentStatus/currentSiteId are read-only derived state (Story 8.2's
// movement log) — present here for display on the detail page shell, but
// never editable via this form (AC #3).
export interface VehicleDetail {
  id: string;
  number: string;
  ownership: string | null;
  driver: string | null;
  currentStatus: "AVAILABLE" | "AT_SITE" | "MAINTENANCE";
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
}

interface VehicleTypeOption {
  id: string;
  name: string;
}

async function getVehicle(id: string): Promise<VehicleDetail | null> {
  const res = await authedFetch(`/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle (${res.status})`);
  }
  return res.json();
}

async function getVehicleTypes(): Promise<VehicleTypeOption[]> {
  const res = await authedFetch(`/vehicle-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle Types (${res.status})`);
  }
  return res.json();
}

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, vehicleTypes] = await Promise.all([getVehicle(id), getVehicleTypes()]);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Vehicle</h1>
      <EditVehicleForm vehicle={vehicle} vehicleTypes={vehicleTypes} />
    </div>
  );
}
