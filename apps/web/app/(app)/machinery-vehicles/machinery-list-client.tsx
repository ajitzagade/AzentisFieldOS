"use client";

import Link from "next/link";
import {
  Button,
  ChevronRightIcon,
  CorrectAction,
  DataTable,
  GearIcon,
  Pagination,
  PlusIcon,
  RotateCcwIcon,
  TextField,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { statusBadge, type AssetLocationStatus } from "./status-badge";

export interface MachineryListItem {
  id: string;
  name: string;
  assetNumber: string;
  currentStatus: AssetLocationStatus;
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
  movementLogs: { id: string }[];
}

function renderRowActions(m: MachineryListItem) {
  return (
    <>
      {m.movementLogs[0] ? (
        <CorrectAction
          icon={<RotateCcwIcon className="size-4" />}
          href={`/machinery-vehicles/machinery/${m.id}/movements/${m.movementLogs[0].id}/correct`}
        />
      ) : null}
      <Link
        href={`/machinery-vehicles/machinery/${m.id}`}
        aria-label={m.name}
        className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
      >
        <ChevronRightIcon className="size-4" />
      </Link>
    </>
  );
}

const columns: DataTableColumn<MachineryListItem>[] = [
  { header: "Name", cell: (m) => m.name, sortKey: "name" },
  { header: "Type", cell: (m) => m.type.name, sortKey: "type" },
  {
    header: "Asset / Registration #",
    cell: (m) => <span className="tabular-nums">{m.assetNumber}</span>,
    sortKey: "assetNumber",
  },
  {
    header: "Current Site",
    cell: (m) => m.currentSite?.name ?? <span className="text-ink-500">—</span>,
    sortKey: "currentSite",
  },
  { header: "Status", cell: (m) => statusBadge(m.currentStatus), sortKey: "currentStatus" },
  {
    header: "",
    cell: (m) => <div className="flex items-center justify-end gap-1">{renderRowActions(m)}</div>,
  },
];

const mobileCard: DataTableMobileCard<MachineryListItem> = {
  primary: (m) => m.name,
  omitHeaders: ["Name"],
  action: renderRowActions,
};

export function MachineryListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: MachineryListItem[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState("m");
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search Machinery"
          placeholder="Name or Asset #…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(m) => m.id}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <GearIcon />,
                  message: "No Machinery match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
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
            : { status: "success", rows }
        }
      />

      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={query.setPage} />
      </div>
    </>
  );
}
