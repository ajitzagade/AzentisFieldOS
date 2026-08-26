import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { DataTable, LayersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { AddUnitForm } from "./add-unit-form";

interface UnitItem {
  id: string;
  name: string;
}

async function getUnits(): Promise<UnitItem[]> {
  const res = await authedFetch(`/units`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Units (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<UnitItem>[] = [{ header: "Name", cell: (u) => <span className="font-semibold">{u.name}</span> }];

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
