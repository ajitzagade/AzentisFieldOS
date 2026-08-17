import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceLogForm } from "../../../../service-log-form";

interface MachineryListItem {
  id: string;
  name: string;
}

async function getMachinery(id: string): Promise<MachineryListItem | null> {
  const res = await fetch(`${process.env.API_URL}/machinery/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

// FR-18: logs a fuel/maintenance/repair entry against this Machine.
export default async function NewMachineryServiceLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machinery = await getMachinery(id);
  if (!machinery) {
    notFound();
  }

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
        / Log Service
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Log Fuel / Maintenance / Repair — {machinery.name}</h1>
      <ServiceLogForm mode="new" assetType="MACHINERY" assetId={machinery.id} />
    </div>
  );
}
