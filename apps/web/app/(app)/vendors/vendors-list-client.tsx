"use client";

import Link from "next/link";
import {
  Badge,
  BuildingIcon,
  Button,
  DataTable,
  Pagination,
  PlusIcon,
  TextField,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import type { Vendor, VendorPurchaseSummary } from "./page";

export interface VendorRow extends Vendor {
  summary: VendorPurchaseSummary | null;
}

const columns: DataTableColumn<VendorRow>[] = [
  {
    header: "Vendor",
    cell: (vendor) => <span className="font-semibold">{vendor.name}</span>,
    sortKey: "name",
  },
  {
    header: "Contact person",
    cell: (vendor) => vendor.contactPerson ?? <span className="text-ink-500">—</span>,
    sortKey: "contactPerson",
  },
  {
    header: "Phone",
    cell: (vendor) => vendor.phone ?? <span className="text-ink-500">—</span>,
    sortKey: "phone",
  },
  {
    header: "Materials / services supplied",
    cell: (vendor) =>
      vendor.materialsSupplied.length === 0 ? (
        <span className="text-ink-500">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {vendor.materialsSupplied.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
  },
  {
    header: "Total purchase (this year)",
    align: "right",
    cell: (vendor) =>
      vendor.summary === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        <span className="font-semibold text-gold-700 tabular-nums">
          ₹{vendor.summary.totalThisYear.toLocaleString("en-IN")}
        </span>
      ),
  },
  {
    header: "Payment status",
    cell: (vendor) =>
      vendor.summary === null ? (
        <span className="text-ink-500">—</span>
      ) : vendor.summary.notFullyPaidTotal === 0 ? (
        <Badge variant="success">Fully Paid</Badge>
      ) : (
        <Badge variant="warning">₹{vendor.summary.notFullyPaidTotal.toLocaleString("en-IN")} not marked Paid</Badge>
      ),
  },
];

const mobileCard: DataTableMobileCard<VendorRow> = {
  primary: (vendor) => vendor.name,
  omitHeaders: ["Vendor"],
};

export function VendorsListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: VendorRow[];
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
          placeholder="Vendor name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(vendor) => vendor.id}
        rowHref={(vendor) => `/vendors/${vendor.id}`}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <BuildingIcon />,
                  message: "No Vendors match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <BuildingIcon />,
                  message: "No Vendors yet.",
                  action: (
                    <Link href="/vendors/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Add your first Vendor
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
