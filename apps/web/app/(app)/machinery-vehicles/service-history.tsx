import Link from "next/link";
import { Badge, DataTable, GearIcon, PencilIcon, type DataTableColumn } from "@azentisfieldos/ui";

export type ServiceLogKind = "FUEL" | "MAINTENANCE" | "REPAIR";

export interface ServiceLogEntry {
  id: string;
  kind: ServiceLogKind;
  notes: string | null;
  cost: string | null;
  serviceDate: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function kindBadge(kind: ServiceLogKind) {
  if (kind === "FUEL") return <Badge variant="gold">Fuel</Badge>;
  if (kind === "MAINTENANCE") return <Badge variant="neutral">Maintenance</Badge>;
  return <Badge variant="warning">Repair</Badge>;
}

function formatCost(cost: string | null) {
  if (cost == null) return <span className="text-ink-500">—</span>;
  return <span className="tabular-nums">₹{Number(cost).toLocaleString("en-IN")}</span>;
}

// FR-18: the dated fuel/maintenance/repair service history for a
// Machine/Vehicle — every entry stays visible, retrievable in full at any
// time (AC #1). Shared by the Machinery and Vehicle detail pages (AD-5) —
// only basePath ("machinery" | "vehicles") differs. AC #2: each entry's
// action is a normal Edit link, never CorrectAction — this model has no
// correction lifecycle (see Story 8.1's Dev Notes / FR-54).
export function ServiceHistoryTable({
  logs,
  basePath,
  assetId,
}: {
  logs: ServiceLogEntry[];
  basePath: "machinery" | "vehicles";
  assetId: string;
}) {
  const columns: DataTableColumn<ServiceLogEntry>[] = [
    { header: "Date", cell: (log) => formatDate(log.serviceDate) },
    { header: "Kind", cell: (log) => kindBadge(log.kind) },
    { header: "Notes", cell: (log) => log.notes ?? <span className="text-ink-500">—</span> },
    { header: "Cost", align: "right", cell: (log) => formatCost(log.cost) },
    {
      header: "",
      cell: (log) => (
        <Link
          href={`/machinery-vehicles/${basePath}/${assetId}/service-log/${log.id}/edit`}
          className="inline-flex items-center gap-1 text-body-sm text-accent-teal-700 hover:underline"
        >
          <PencilIcon className="size-4" />
          Edit
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rowKey={(log) => log.id}
      state={
        logs.length === 0
          ? {
              status: "empty",
              icon: <GearIcon />,
              message: "No fuel, maintenance, or repair entries logged yet.",
            }
          : { status: "success", rows: logs }
      }
    />
  );
}
