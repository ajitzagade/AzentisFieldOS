import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowsIcon, Badge, GearIcon, PencilIcon, PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import type { MachineryDetail } from "./edit/page";
import { statusBadge } from "../../status-badge";
import { MovementTimeline, type MovementHistoryItem } from "../../movement-timeline";
import { ServiceHistoryTable, type ServiceLogEntry } from "../../service-history";

async function getMachinery(id: string): Promise<MachineryDetail | null> {
  const res = await authedFetch(`/machinery/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

async function getMovements(id: string): Promise<MovementHistoryItem[]> {
  const res = await authedFetch(`/asset-movements?assetType=MACHINERY&assetId=${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Movement History (${res.status})`);
  }
  return res.json();
}

async function getServiceLogs(id: string): Promise<ServiceLogEntry[]> {
  const res = await authedFetch(`/asset-service-logs?assetType=MACHINERY&assetId=${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Service History (${res.status})`);
  }
  return res.json();
}

// This story creates the shell (profile fields + Edit link); Story 8.2
// adds the movement-history section (with its own CorrectAction on each
// movement entry, not on this Machine's registration), and Story 8.3 adds
// the fuel/maintenance/repair service-log section below it.
export default async function MachineryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machinery, movements, serviceLogs] = await Promise.all([getMachinery(id), getMovements(id), getServiceLogs(id)]);

  if (!machinery) {
    notFound();
  }

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/machinery-vehicles" className="hover:text-accent-teal-700 hover:underline">
          Machinery &amp; Vehicles
        </Link>{" "}
        / {machinery.name}
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-page-title text-ink-900">
            <GearIcon className="size-6 text-ink-500" />
            {machinery.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-body-sm">
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Type</span>
              <Badge variant="neutral">{machinery.type.name}</Badge>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Asset / Registration #</span>
              <span className="font-semibold tabular-nums text-ink-900">{machinery.assetNumber}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Model</span>
              <span className="font-semibold text-ink-900">{machinery.model ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Ownership</span>
              <span className="font-semibold text-ink-900">{machinery.ownership ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Operator</span>
              <span className="font-semibold text-ink-900">{machinery.operator ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Current Site</span>
              <span className="font-semibold text-ink-900">{machinery.currentSite?.name ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Status</span>
              {statusBadge(machinery.currentStatus)}
            </span>
          </div>
        </div>
        <div className="action-button-row">
          <Link href={`/machinery-vehicles/machinery/${machinery.id}/move`} className={cn(buttonVariants({ variant: "primary" }))}>
            <ArrowsIcon className="size-4" />
            Record Movement
          </Link>
          <Link href={`/machinery-vehicles/machinery/${machinery.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <PencilIcon className="size-4" />
            Edit
          </Link>
        </div>
      </div>

      <h2 className="mb-4 text-section-header text-ink-900">Movement &amp; Maintenance History</h2>
      <MovementTimeline movements={movements} basePath="machinery" assetId={machinery.id} />

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-section-header text-ink-900">Fuel, Maintenance &amp; Repair History</h2>
        <Link
          href={`/machinery-vehicles/machinery/${machinery.id}/service-log/new`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          <PlusIcon className="size-4" />
          Log Service
        </Link>
      </div>
      <ServiceHistoryTable logs={serviceLogs} basePath="machinery" assetId={machinery.id} />
    </>
  );
}
