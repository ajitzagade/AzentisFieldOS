"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  ClipboardIcon,
  CorrectAction,
  DataTable,
  Pagination,
  PencilIcon,
  SelectField,
  TextField,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { formatDate, formatDateTime } from "../../../lib/format";

// spec-daily-reports-list-and-edit: mirrors apps/api's DsrHistoryRow
// (dsr.service.ts's listAllSubmitted) — the cross-Site "Submitted Daily
// Reports" history. "Submitted Time" is the root/original submission's own
// createdAt; "Last Updated" is this (current) row's own createdAt — the two
// are equal for a never-edited report.
export interface DsrHistoryRow {
  id: string;
  site: { id: string; name: string };
  submittedBy: { name: string };
  reportDate: string;
  submittedAt: string;
  lastUpdatedAt: string;
  status: "ORIGINAL" | "EDITED";
}

interface SiteOption {
  id: string;
  name: string;
}

const columns: DataTableColumn<DsrHistoryRow>[] = [
  { header: "Report Date", cell: (row) => formatDate(row.reportDate), sortKey: "reportDate" },
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Submitted By", cell: (row) => row.submittedBy.name },
  { header: "Submitted Time", cell: (row) => <span className="text-ink-500">{formatDateTime(row.submittedAt)}</span> },
  {
    header: "Last Updated",
    cell: (row) => <span className="text-ink-500">{formatDateTime(row.lastUpdatedAt)}</span>,
    sortKey: "createdAt",
  },
  {
    header: "Status",
    cell: (row) =>
      row.status === "EDITED" ? <Badge variant="gold">Edited</Badge> : <Badge variant="neutral">Original</Badge>,
  },
  {
    header: "",
    cell: (row) => (
      <div className="flex items-center justify-end gap-1">
        <CorrectAction
          icon={<PencilIcon className="size-4" />}
          href={`/daily-activity/${row.id}/correct`}
          label="Edit"
        />
      </div>
    ),
  },
];

const mobileCard: DataTableMobileCard<DsrHistoryRow> = {
  primary: (row) => (
    <span className="flex flex-wrap items-center gap-2">
      {row.site.name}
      <span className="text-ink-500">— {formatDate(row.reportDate)}</span>
    </span>
  ),
  omitHeaders: ["Site", "Report Date"],
  action: (row) => (
    <div className="flex items-center gap-1">
      <CorrectAction icon={<PencilIcon className="size-4" />} href={`/daily-activity/${row.id}/correct`} label="Edit" />
    </div>
  ),
};

export function HistoryListClient({
  rows,
  total,
  page,
  pageSize,
  sites,
}: {
  rows: DsrHistoryRow[];
  total: number;
  page: number;
  pageSize: number;
  sites: SiteOption[];
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveFilter =
    Boolean(query.q) ||
    Boolean(query.getFilter("siteId")) ||
    Boolean(query.getFilter("from")) ||
    Boolean(query.getFilter("to"));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField
          label="Search"
          placeholder="Site or Submitted By name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0"
        />
        <SelectField
          label="Site"
          options={[{ value: "", label: "All sites" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          value={query.getFilter("siteId") ?? ""}
          onChange={(e) => query.setFilter("siteId", e.target.value || null)}
          className="mb-0"
        />
        <TextField
          label="From"
          type="date"
          value={query.getFilter("from") ?? ""}
          onChange={(e) => query.setFilter("from", e.target.value || null)}
          className="mb-0"
        />
        <TextField
          label="To"
          type="date"
          value={query.getFilter("to") ?? ""}
          onChange={(e) => query.setFilter("to", e.target.value || null)}
          className="mb-0"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(row) => row.id}
        rowHref={(row) => `/daily-activity/${row.id}`}
        // Matches apps/api's listAllSubmitted default (dsr.service.ts:
        // isSortOrder(query.order) ? query.order : 'desc') — only reachable
        // via a hand-crafted URL in practice (setSort always writes both
        // sort and order together on a real header click), but kept
        // consistent with the server rather than silently diverging.
        sort={query.sort ? { key: query.sort, order: query.order ?? "desc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveFilter
              ? {
                  status: "empty",
                  icon: <ClipboardIcon />,
                  message: "No Daily Reports match your filters.",
                  action: (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => query.clearAll(["siteId", "from", "to"])}
                    >
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <ClipboardIcon />,
                  message: "No Daily Reports submitted yet.",
                  action: (
                    <Link href="/dsr/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      Start Daily Report
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
