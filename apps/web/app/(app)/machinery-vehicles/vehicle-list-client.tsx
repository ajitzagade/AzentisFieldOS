"use client";

import Link from "next/link";
import {
  Button,
  ChevronRightIcon,
  CorrectAction,
  DataTable,
  Pagination,
  PlusIcon,
  RotateCcwIcon,
  TextField,
  TruckIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { statusBadge, type AssetLocationStatus } from "./status-badge";

export interface VehicleListItem {
  id: string;
  number: string;
  driver: string | null;
  currentStatus: AssetLocationStatus;
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
  movementLogs: { id: string }[];
}

function renderRowActions(v: VehicleListItem) {
  return (
    <>
      {v.movementLogs[0] ? (
        <CorrectAction
          icon={<RotateCcwIcon className="size-4" />}
          href={`/machinery-vehicles/vehicles/${v.id}/movements/${v.movementLogs[0].id}/correct`}
        />
      ) : null}
      <Link
        href={`/machinery-vehicles/vehicles/${v.id}`}
        aria-label={v.number}
        className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    </>
  );
}

const columns: DataTableColumn<VehicleListItem>[] = [
  {
    header: "Number",
    cell: (v) => <span className="tabular-nums">{v.number}</span>,
    sortKey: "number",
  },
  { header: "Type", cell: (v) => v.type.name, sortKey: "type" },
  {
    header: "Driver",
    cell: (v) => v.driver ?? <span className="text-ink-500">—</span>,
    sortKey: "driver",
  },
  {
    header: "Current Site / Usage",
    cell: (v) => v.currentSite?.name ?? <span className="text-ink-500">—</span>,
    sortKey: "currentSite",
  },
  { header: "Status", cell: (v) => statusBadge(v.currentStatus), sortKey: "currentStatus" },
  {
    header: "",
    cell: (v) => <div className="flex items-center justify-end gap-1">{renderRowActions(v)}</div>,
  },
];

const mobileCard: DataTableMobileCard<VehicleListItem> = {
  primary: (v) => v.number,
  omitHeaders: ["Number"],
  action: renderRowActions,
};

export function VehicleListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState("v");
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search Vehicles"
          placeholder="Vehicle number…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(v) => v.id}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <TruckIcon />,
                  message: "No Vehicles match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
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
            : { status: "success", rows }
        }
      />

      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={query.setPage} />
      </div>
    </>
  );
}
