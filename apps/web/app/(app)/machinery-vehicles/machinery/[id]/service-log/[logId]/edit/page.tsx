import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceLogForm } from "../../../../../service-log-form";
import type { ServiceLogEntry } from "../../../../../service-history";

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

// There is no single-entry GET endpoint (Task 2 only lists POST/GET
// list/PATCH) — the entry is found by filtering the already-scoped
// per-asset list, same client-filter approach team/[id]/page.tsx uses for
// Advances/Adjustments.
async function getServiceLog(assetId: string, logId: string): Promise<ServiceLogEntry | null> {
  const res = await fetch(`${process.env.API_URL}/asset-service-logs?assetType=MACHINERY&assetId=${assetId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Service History (${res.status})`);
  }
  const logs: ServiceLogEntry[] = await res.json();
  return logs.find((log) => log.id === logId) ?? null;
}

// AC #2: a normal in-place Edit page, not a correction flow.
export default async function EditMachineryServiceLogPage({
  params,
}: {
  params: Promise<{ id: string; logId: string }>;
}) {
  const { id, logId } = await params;
  const [machinery, log] = await Promise.all([getMachinery(id), getServiceLog(id, logId)]);
  if (!machinery || !log) {
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
        / Edit Service Log
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Edit Service Log — {machinery.name}</h1>
      <ServiceLogForm
        mode="edit"
        logId={log.id}
        assetType="MACHINERY"
        assetId={machinery.id}
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
