import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, DataTable, TruckIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { CategoryRowActions } from "../../_components/category-row-actions";
import { AddVehicleTypeForm } from "./add-vehicle-type-form";
import { renameVehicleTypeAction, toggleVehicleTypeAction } from "./actions";

interface VehicleTypeItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getVehicleTypes(): Promise<VehicleTypeItem[]> {
  const res = await authedFetch(`/vehicle-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicle Types (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<VehicleTypeItem>[] = [
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
        renameAction={renameVehicleTypeAction.bind(null, t.id)}
        toggleAction={toggleVehicleTypeAction.bind(null, t.id, !t.isActive)}
      />
    ),
  },
];

// Minimal create+list — Epic 14 owns the full admin lifecycle (edit,
// disable), same split Epic 6 used for Employment Type / Epic 4 for Unit.
export default async function VehicleTypesPage() {
  const vehicleTypes = await getVehicleTypes();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/machinery-vehicles" className="hover:text-accent-teal-700 hover:underline">
          Machinery &amp; Vehicles
        </Link>{" "}
        / Vehicle Types
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Vehicle Types</h1>

      <div className="mb-6 max-w-160">
        <AddVehicleTypeForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(t) => t.id}
        state={
          vehicleTypes.length === 0
            ? { status: "empty", icon: <TruckIcon />, message: "No Vehicle Types yet." }
            : { status: "success", rows: vehicleTypes }
        }
      />
    </>
  );
}
