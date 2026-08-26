import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceLogForm } from "../../../../../service-log-form";
import type { ServiceLogEntry } from "../../../../../service-history";

interface VehicleListItem {
  id: string;
  number: string;
}

async function getVehicle(id: string): Promise<VehicleListItem | null> {
  const res = await authedFetch(`/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle (${res.status})`);
  }
  return res.json();
}

// There is no single-entry GET endpoint (Task 2 only lists POST/GET
// list/PATCH) — the entry is found by filtering the already-scoped
// per-asset list, same client-filter approach team/[id]/page.tsx uses for
// Advances/Adjustments.
async function getServiceLog(assetId: string, logId: string): Promise<ServiceLogEntry | null> {
  const res = await authedFetch(`/asset-service-logs?assetType=VEHICLE&assetId=${assetId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Service History (${res.status})`);
  }
  const logs: ServiceLogEntry[] = await res.json();
  return logs.find((log) => log.id === logId) ?? null;
}

// AC #2: a normal in-place Edit page, not a correction flow.
export default async function EditVehicleServiceLogPage({
  params,
}: {
  params: Promise<{ id: string; logId: string }>;
}) {
  const { id, logId } = await params;
  const [vehicle, log] = await Promise.all([getVehicle(id), getServiceLog(id, logId)]);
  if (!vehicle || !log) {
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
        / Edit Service Log
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Edit Service Log — {vehicle.number}</h1>
      <ServiceLogForm
        mode="edit"
        logId={log.id}
        assetType="VEHICLE"
        assetId={vehicle.id}
        initial={{
          kind: log.kind,
          notes: log.notes ?? undefined,
          cost: log.cost ?? undefined,
          serviceDate: log.serviceDate.slice(0, 10),
        }}
      />
    </div>
  );
}
