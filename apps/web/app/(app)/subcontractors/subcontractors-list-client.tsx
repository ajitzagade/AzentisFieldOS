"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  DataTable,
  Pagination,
  PlusIcon,
  TextField,
  UserIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import type { Subcontractor } from "./page";

const columns: DataTableColumn<Subcontractor>[] = [
  {
    header: "Name",
    cell: (subcontractor) => <span className="font-semibold">{subcontractor.name}</span>,
    sortKey: "name",
  },
  {
    header: "Contact person",
    cell: (subcontractor) => subcontractor.contactPerson ?? <span className="text-ink-500">—</span>,
    sortKey: "contactPerson",
  },
  {
    header: "Phone",
    cell: (subcontractor) => subcontractor.phone ?? <span className="text-ink-500">—</span>,
    sortKey: "phone",
  },
  {
    header: "Work categories",
    cell: (subcontractor) =>
      subcontractor.workCategories.length === 0 ? (
        <span className="text-ink-500">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {subcontractor.workCategories.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
  },
];

export function SubcontractorsListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: Subcontractor[];
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
          placeholder="Subcontractor name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(subcontractor) => subcontractor.id}
        rowHref={(subcontractor) => `/subcontractors/${subcontractor.id}`}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <UserIcon />,
                  message: "No Subcontractors match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <UserIcon />,
                  message: "No Subcontractors yet.",
                  action: (
                    <Link href="/subcontractors/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Add your first Subcontractor
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
