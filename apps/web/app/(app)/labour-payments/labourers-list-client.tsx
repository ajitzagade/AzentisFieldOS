"use client";

import Link from "next/link";
import { Button, DataTable, PlusIcon, Pagination, TextField, UsersIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import type { DailyLabourerListItem } from "./page";

const STATUS_TABS = [
  { key: "active", label: "Active" },
  { key: "deactivated", label: "Deactivated" },
] as const;

const columns: DataTableColumn<DailyLabourerListItem>[] = [
  { header: "Name", cell: (l) => l.name, sortKey: "name" },
  { header: "Category", cell: (l) => l.category, sortKey: "category" },
  {
    header: "Per-Day Amount",
    align: "right",
    cell: (l) =>
      l.defaultPerDayAmount === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        `₹${l.defaultPerDayAmount.toLocaleString("en-IN")}`
      ),
  },
  {
    header: "Outstanding Advance",
    align: "right",
    cell: (l) =>
      Number(l.outstandingAdvanceBalance) > 0 ? (
        <span className="font-semibold text-gold-700 tabular-nums">
          ₹{Number(l.outstandingAdvanceBalance).toLocaleString("en-IN")}
        </span>
      ) : (
        <span className="text-ink-500">₹0</span>
      ),
  },
];

export function LabourersListClient({
  rows,
  total,
  page,
  pageSize,
  status,
}: {
  rows: DailyLabourerListItem[];
  total: number;
  page: number;
  pageSize: number;
  status: "active" | "deactivated";
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Labourer status">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => query.setFilter("status", tab.key === "active" ? null : tab.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-body-sm font-semibold transition-colors duration-fast ease-(--ease-standard)",
                active
                  ? "border-accent-teal-700 bg-accent-teal-700 text-white"
                  : "border-border-hairline bg-surface-1 text-ink-700 hover:bg-surface-2",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <TextField
          label="Search"
          placeholder="Labourer name or category…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(l) => l.id}
        rowHref={(l) => `/labour-payments/${l.id}`}
        mobileCard={{ primary: (l) => l.name }}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <UsersIcon />,
                  message: "No Labourers match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : status === "deactivated"
                ? {
                    status: "empty",
                    icon: <UsersIcon />,
                    message: "No deactivated Labourers.",
                  }
                : {
                    status: "empty",
                    icon: <UsersIcon />,
                    message: "No Labourers added yet.",
                    action: (
                      <Link href="/labour-payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
                        <PlusIcon className="size-4" />
                        Add your first Labourer
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
