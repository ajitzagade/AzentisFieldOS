import Link from "next/link";
import {
  DataTable,
  GearIcon,
  PlusIcon,
  TruckIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { statusBadge, type AssetLocationStatus } from "./status-badge";

interface MachineryListItem {
  id: string;
  name: string;
  assetNumber: string;
  currentStatus: AssetLocationStatus;
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
}

interface VehicleListItem {
  id: string;
  number: string;
  driver: string | null;
  currentStatus: AssetLocationStatus;
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
}

async function getMachinery(): Promise<MachineryListItem[]> {
  const res = await fetch(`${process.env.API_URL}/machinery`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

async function getVehicles(): Promise<VehicleListItem[]> {
  const res = await fetch(`${process.env.API_URL}/vehicles`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicles (${res.status})`);
  }
  return res.json();
}

const machineryColumns: DataTableColumn<MachineryListItem>[] = [
  { header: "Name", cell: (m) => m.name },
  { header: "Type", cell: (m) => m.type.name },
  { header: "Asset / Registration #", cell: (m) => <span className="tabular-nums">{m.assetNumber}</span> },
  { header: "Current Site", cell: (m) => m.currentSite?.name ?? <span className="text-ink-500">—</span> },
  { header: "Status", cell: (m) => statusBadge(m.currentStatus) },
];

const vehicleColumns: DataTableColumn<VehicleListItem>[] = [
  { header: "Number", cell: (v) => <span className="tabular-nums">{v.number}</span> },
  { header: "Type", cell: (v) => v.type.name },
  { header: "Driver", cell: (v) => v.driver ?? <span className="text-ink-500">—</span> },
  { header: "Current Site / Usage", cell: (v) => v.currentSite?.name ?? <span className="text-ink-500">—</span> },
  { header: "Status", cell: (v) => statusBadge(v.currentStatus) },
];

export default async function MachineryVehiclesPage() {
  const [machinery, vehicles] = await Promise.all([getMachinery(), getVehicles()]);

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Machinery &amp; Vehicles</h1>
          <p className="text-body-sm text-ink-500">Current location is manually recorded at each Movement — not live GPS tracking.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/machinery-vehicles/machinery/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Add Machine
          </Link>
          <Link href="/machinery-vehicles/vehicles/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Add Vehicle
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <a href="#machinery" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
          <GearIcon className="size-4" />
          Machinery
        </a>
        <a href="#vehicles" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
          <TruckIcon className="size-4" />
          Vehicles
        </a>
      </div>

      <div id="machinery" className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-section-header text-ink-900">
          <GearIcon className="size-4" />
          Machinery
        </div>
        <Link href="/machinery-vehicles/machinery-types" className="text-caption text-accent-teal-700 underline">
          Manage Machinery Types
        </Link>
      </div>
      <DataTable
        columns={machineryColumns}
        rowKey={(m) => m.id}
        rowHref={(m) => `/machinery-vehicles/machinery/${m.id}`}
        state={
          machinery.length === 0
            ? {
                status: "empty",
                icon: <GearIcon />,
                message: "No Machinery registered yet.",
                action: (
                  <Link href="/machinery-vehicles/machinery/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Register your first Machine
                  </Link>
                ),
              }
            : { status: "success", rows: machinery }
        }
      />

      <div id="vehicles" className="mb-4 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-section-header text-ink-900">
          <TruckIcon className="size-4" />
          Vehicles
        </div>
        <Link href="/machinery-vehicles/vehicle-types" className="text-caption text-accent-teal-700 underline">
          Manage Vehicle Types
        </Link>
      </div>
      <DataTable
        columns={vehicleColumns}
        rowKey={(v) => v.id}
        rowHref={(v) => `/machinery-vehicles/vehicles/${v.id}`}
        state={
          vehicles.length === 0
            ? {
                status: "empty",
                icon: <TruckIcon />,
                message: "No Vehicles registered yet.",
                action: (
                  <Link href="/machinery-vehicles/vehicles/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Register your first Vehicle
                  </Link>
                ),
              }
            : { status: "success", rows: vehicles }
        }
      />
    </>
  );
}
