"use client";

import Link from "next/link";
import { Badge, Button, DataTable, Pagination, TextField, UsersIcon, buttonVariants, cn, PlusIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import type { TeamMemberListItem } from "./page";

const columns: DataTableColumn<TeamMemberListItem>[] = [
  {
    header: "Name",
    cell: (t) => (
      <span className="flex items-center gap-2 font-semibold">
        {t.name}
        {!t.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
    sortKey: "name",
  },
  {
    header: "Role / Designation",
    cell: (t) => t.designation ?? <span className="text-ink-500">—</span>,
    sortKey: "designation",
  },
  {
    header: "Employment Type",
    cell: (t) => <Badge variant="neutral">{t.employmentType.name}</Badge>,
    sortKey: "employmentType",
  },
  {
    header: "Today's Attendance",
    cell: (t) =>
      t.todaysAttendance === "PRESENT" ? (
        <Badge variant="success">Present</Badge>
      ) : t.todaysAttendance === "ABSENT" ? (
        <Badge variant="danger">Absent</Badge>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
  { header: "Current / Last Site", cell: (t) => t.currentOrLastSite ?? <span className="text-ink-500">—</span> },
];

export function TeamMembersListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: TeamMemberListItem[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search"
          placeholder="Name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(t) => t.id}
        rowHref={(t) => `/team/${t.id}`}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <UsersIcon />,
                  message: "No Team Members match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <UsersIcon />,
                  message: "No Team Members yet.",
                  action: (
                    <Link href="/team/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Add your first Team Member
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
