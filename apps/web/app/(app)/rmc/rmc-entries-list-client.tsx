"use client";

import Link from "next/link";
import {
  Button,
  CameraIcon,
  CorrectAction,
  DataTable,
  DropletIcon,
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
import { formatDate, formatMoney } from "../../../lib/format";

export interface RmcEntryRow {
  id: string;
  quantityM3: string;
  grade: string;
  ratePerM3: string;
  totalAmount: string;
  invoiceOrChallanNo: string | null;
  challanPhotoUrl: string | null;
  deliveredAt: string;
  site: { id: string; name: string };
  vendor: { id: string; name: string };
}

const columns: DataTableColumn<RmcEntryRow>[] = [
  {
    header: "Vendor",
    cell: (row) => <span className="font-semibold">{row.vendor.name}</span>,
    sortKey: "vendor",
  },
  { header: "Site", cell: (row) => row.site.name, sortKey: "site" },
  { header: "Date", cell: (row) => formatDate(row.deliveredAt), sortKey: "deliveredAt" },
  {
    header: "Quantity",
    align: "right",
    cell: (row) => `${row.quantityM3} m³`,
    sortKey: "quantityM3",
  },
  { header: "Grade", cell: (row) => row.grade, sortKey: "grade" },
  {
    header: "Rate / m³",
    align: "right",
    cell: (row) => formatMoney(Number(row.ratePerM3)),
    sortKey: "ratePerM3",
  },
  {
    header: "Total",
    align: "right",
    cell: (row) => <span className="font-semibold text-gold-700">{formatMoney(Number(row.totalAmount))}</span>,
    sortKey: "totalAmount",
  },
  {
    header: "Invoice #",
    cell: (row) => (
      <span className="flex items-center gap-1.5">
        {row.invoiceOrChallanNo ?? <span className="text-ink-500">—</span>}
        {row.challanPhotoUrl ? (
          <a
            href={row.challanPhotoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View challan photo"
            className="text-accent-teal-700 hover:text-accent-teal-800"
          >
            <CameraIcon className="size-3.5" />
          </a>
        ) : null}
      </span>
    ),
  },
  {
    header: "",
    cell: (row) => (
      <div className="flex items-center justify-end">
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/rmc/${row.id}/correct`} />
      </div>
    ),
  },
];

const mobileCard: DataTableMobileCard<RmcEntryRow> = {
  primary: (row) => (
    <>
      {row.vendor.name} <span className="text-ink-500">· {row.grade}</span>
    </>
  ),
  omitHeaders: ["Vendor", "Grade"],
  action: (row) => <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/rmc/${row.id}/correct`} />,
};

export function RmcEntriesListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: RmcEntryRow[];
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
          placeholder="Grade, Site, or Vendor…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(row) => row.id}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <DropletIcon />,
                  message: "No RMC deliveries match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <DropletIcon />,
                  message: "No RMC deliveries logged yet.",
                  action: (
                    <Link href="/rmc/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Record your first RMC Delivery
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
