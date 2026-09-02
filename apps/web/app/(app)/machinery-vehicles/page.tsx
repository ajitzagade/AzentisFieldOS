import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { GearIcon, PlusIcon, TruckIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { MachineryListClient, type MachineryListItem } from "./machinery-list-client";
import { VehicleListClient, type VehicleListItem } from "./vehicle-list-client";

interface MachineryVehiclesSearchParams {
  mq?: string;
  mpage?: string;
  mpageSize?: string;
  vq?: string;
  vpage?: string;
  vpageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getMachinery(params: MachineryVehiclesSearchParams): Promise<PaginatedResult<MachineryListItem>> {
  const query = new URLSearchParams();
  query.set("page", params.mpage ?? "1");
  query.set("pageSize", params.mpageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.mq) query.set("q", params.mq);

  const res = await authedFetch(`/machinery?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

async function getVehicles(params: MachineryVehiclesSearchParams): Promise<PaginatedResult<VehicleListItem>> {
  const query = new URLSearchParams();
  query.set("page", params.vpage ?? "1");
  query.set("pageSize", params.vpageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.vq) query.set("q", params.vq);

  const res = await authedFetch(`/vehicles?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vehicles (${res.status})`);
  }
  return res.json();
}

export default async function MachineryVehiclesPage({
  searchParams,
}: {
  searchParams?: Promise<MachineryVehiclesSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [machineryResult, vehiclesResult] = await Promise.all([getMachinery(params), getVehicles(params)]);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Machinery &amp; Vehicles</h1>
          <p className="text-body-sm text-ink-500">Current location is manually recorded at each Movement — not live GPS tracking.</p>
        </div>
        <div className="action-button-row">
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

      <div id="machinery" className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-section-header text-ink-900">
          <GearIcon className="size-4" />
          Machinery
        </div>
        <Link href="/machinery-vehicles/machinery-types" className="text-caption text-accent-teal-700 underline">
          Manage Machinery Types
        </Link>
      </div>
      <MachineryListClient
        rows={machineryResult.rows}
        total={machineryResult.total}
        page={machineryResult.page}
        pageSize={machineryResult.pageSize}
      />

      <div id="vehicles" className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-section-header text-ink-900">
          <TruckIcon className="size-4" />
          Vehicles
        </div>
        <Link href="/machinery-vehicles/vehicle-types" className="text-caption text-accent-teal-700 underline">
          Manage Vehicle Types
        </Link>
      </div>
      <VehicleListClient
        rows={vehiclesResult.rows}
        total={vehiclesResult.total}
        page={vehiclesResult.page}
        pageSize={vehiclesResult.pageSize}
      />
    </>
  );
}
