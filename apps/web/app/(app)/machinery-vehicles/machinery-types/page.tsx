import Link from "next/link";
import { DataTable, GearIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { AddMachineryTypeForm } from "./add-machinery-type-form";

interface MachineryTypeItem {
  id: string;
  name: string;
}

async function getMachineryTypes(): Promise<MachineryTypeItem[]> {
  const res = await fetch(`${process.env.API_URL}/machinery-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery Types (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<MachineryTypeItem>[] = [
  { header: "Name", cell: (t) => <span className="font-semibold">{t.name}</span> },
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
