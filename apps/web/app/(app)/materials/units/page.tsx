import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { CategoryRowActions } from "../../_components/category-row-actions";
import { AddUnitForm } from "./add-unit-form";
import { renameUnitAction, toggleUnitAction } from "./actions";

interface UnitItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getUnits(): Promise<UnitItem[]> {
  const res = await authedFetch(`/units`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Units (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<UnitItem>[] = [
  {
    header: "Name",
    cell: (u) => (
      <span className="flex items-center gap-2 font-semibold">
        {u.name}
        {!u.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
  {
    header: "",
    align: "right",
    cell: (u) => (
      <CategoryRowActions
        key={`${u.id}-${u.name}`}
        name={u.name}
        isActive={u.isActive}
        renameAction={renameUnitAction.bind(null, u.id)}
        toggleAction={toggleUnitAction.bind(null, u.id, !u.isActive)}
      />
    ),
  },
];

export default async function UnitsPage() {
  const units = await getUnits();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/materials" className="hover:text-accent-teal-700 hover:underline">
          Materials
        </Link>{" "}
        / Units
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Units of Measure</h1>

      <div className="mb-6 max-w-160">
        <AddUnitForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(u) => u.id}
        state={
          units.length === 0
            ? { status: "empty", icon: <LayersIcon />, message: "No Units yet." }
            : { status: "success", rows: units }
        }
      />
    </>
  );
}
