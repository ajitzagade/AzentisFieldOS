"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  CheckCircleIcon,
  DataTable,
  MapPinIcon,
  Pagination,
  PlusIcon,
  SelectField,
  TextField,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import type { Site } from "./page";

export interface SiteRow extends Site {
  /** true = DSR submitted today, false = not yet, null = status unknown
   * (the DSR lookup failed — rendered as an honest "—", never "Not yet"). */
  dsrToday: boolean | null;
}

const STATUS_BADGE: Record<Site["status"], { variant: "success" | "warning" | "neutral"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

export function SitesListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: SiteRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveFilter = Boolean(query.q) || Boolean(query.getFilter("status"));

  const columns: DataTableColumn<SiteRow>[] = [
    { header: "Site", cell: (site) => <span className="font-semibold">{site.name}</span>, sortKey: "name" },
    { header: "Location", cell: (site) => site.location, sortKey: "location" },
    {
      header: "Status",
      cell: (site) => {
        const badge = STATUS_BADGE[site.status];
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
      sortKey: "status",
    },
    {
      header: "DSR today",
      cell: (site) =>
        site.dsrToday === null ? (
          <span className="text-ink-500">—</span>
        ) : site.dsrToday ? (
          <Badge variant="success" icon={<CheckCircleIcon />}>
            Submitted
          </Badge>
        ) : (
          <span className="text-ink-500">Not yet</span>
        ),
    },
    {
      header: "Contract ref",
      cell: (site) => site.contractReference ?? <span className="text-ink-500">—</span>,
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField
          label="Search"
          placeholder="Name, location, or contract reference…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0"
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={query.getFilter("status") ?? ""}
          onChange={(e) => query.setFilter("status", e.target.value || null)}
          className="mb-0"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(site) => site.id}
        rowHref={(site) => `/sites/${site.id}`}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveFilter
              ? {
                  status: "empty",
                  icon: <MapPinIcon />,
                  message: "No Sites match your search or filters.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll(["status"])}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <MapPinIcon />,
                  message: "No Sites yet.",
                  action: (
                    <Link href="/sites/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Create your first Site
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
