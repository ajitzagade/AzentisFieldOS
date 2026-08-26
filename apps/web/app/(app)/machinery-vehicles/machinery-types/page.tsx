import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, DataTable, GearIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { CategoryRowActions } from "../../_components/category-row-actions";
import { AddMachineryTypeForm } from "./add-machinery-type-form";
import { renameMachineryTypeAction, toggleMachineryTypeAction } from "./actions";

interface MachineryTypeItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getMachineryTypes(): Promise<MachineryTypeItem[]> {
  const res = await authedFetch(`/machinery-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery Types (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<MachineryTypeItem>[] = [
  {
    header: "Name",
    cell: (t) => (
      <span className="flex items-center gap-2 font-semibold">
        {t.name}
        {!t.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
  {
    header: "",
    align: "right",
    cell: (t) => (
      <CategoryRowActions
        key={`${t.id}-${t.name}`}
        name={t.name}
        isActive={t.isActive}
        renameAction={renameMachineryTypeAction.bind(null, t.id)}
        toggleAction={toggleMachineryTypeAction.bind(null, t.id, !t.isActive)}
      />
    ),
  },
];

// Minimal create+list — Epic 14 owns the full admin lifecycle (edit,
// disable), same split Epic 6 used for Employment Type / Epic 4 for Unit.
export default async function MachineryTypesPage() {
  const machineryTypes = await getMachineryTypes();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/machinery-vehicles" className="hover:text-accent-teal-700 hover:underline">
          Machinery &amp; Vehicles
        </Link>{" "}
        / Machinery Types
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Machinery Types</h1>

      <div className="mb-6 max-w-160">
        <AddMachineryTypeForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(t) => t.id}
        state={
          machineryTypes.length === 0
            ? { status: "empty", icon: <GearIcon />, message: "No Machinery Types yet." }
            : { status: "success", rows: machineryTypes }
        }
      />
    </>
  );
}
