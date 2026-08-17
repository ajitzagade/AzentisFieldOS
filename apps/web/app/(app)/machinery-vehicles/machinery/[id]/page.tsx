import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, GearIcon, PencilIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import type { MachineryDetail } from "./edit/page";
import { statusBadge } from "../../status-badge";

async function getMachinery(id: string): Promise<MachineryDetail | null> {
  const res = await fetch(`${process.env.API_URL}/machinery/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

// This story creates the shell (profile fields + Edit link); Story 8.2
// adds the movement-history section (with its own CorrectAction on the
// most recent movement entry, not on this Machine's registration), and
// Story 8.3 adds the fuel/maintenance/repair service-log section.
export default async function MachineryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machinery = await getMachinery(id);

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

      <div className="mb-8 flex items-start justify-between gap-4">
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
        <Link href={`/machinery-vehicles/machinery/${machinery.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
          <PencilIcon className="size-4" />
          Edit
        </Link>
      </div>
    </>
  );
}
