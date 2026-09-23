"use client";

import Link from "next/link";
import {
  Badge,
  BoxIcon,
  Button,
  DataTable,
  Pagination,
  SelectField,
  TextField,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { formatDateTime } from "../../../lib/format";

export interface InventoryRow {
  materialId: string;
  materialName: string;
  categoryId: string;
  categoryName: string;
  sizeLabel: string;
  unit: string;
  locationType: "GODOWN" | "SITE";
  siteId: string | null;
  siteName: string | null;
  quantity: string;
  updatedAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SiteOption {
  id: string;
  name: string;
}

// A row's own (materialId, sizeLabel, location) uniquely identifies it —
// GodownStock's PK is materialSizeId, SiteStock's is (siteId,
// materialSizeId), and MaterialSize has a @@unique([materialId, label]) —
// so this composite is stable without the API needing to invent/expose a
// synthetic id for a merged, non-persisted row shape.
function rowKey(row: InventoryRow): string {
  return `${row.locationType}:${row.siteId ?? "godown"}:${row.materialId}:${row.sizeLabel}`;
}

const LOCATION_TYPE_CHIPS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "GODOWN", label: "Godown" },
  { value: "SITE", label: "Site" },
];

const STOCK_LEVEL_CHIPS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "LOW", label: "Low Stock" },
  { value: "ZERO", label: "No Stock" },
];

const EXTRA_FILTER_NAMES = ["categoryId", "siteId", "locationType", "stockLevel"];

const columns: DataTableColumn<InventoryRow>[] = [
  {
    header: "Material",
    sortKey: "materialName",
    cell: (row) => (
      <Link
        href={`/materials/${row.materialId}/availability`}
        prefetch={false}
        className="font-semibold text-accent-teal-700 hover:underline"
      >
        {row.materialName}
        {row.sizeLabel ? <span className="font-normal text-ink-500"> ({row.sizeLabel})</span> : null}
      </Link>
    ),
  },
  {
    header: "Location",
    cell: (row) => (row.locationType === "GODOWN" ? "Godown" : (row.siteName ?? "Site")),
  },
  {
    header: "Location Type",
    cell: (row) =>
      row.locationType === "GODOWN" ? (
        <Badge variant="gold">Godown</Badge>
      ) : (
        <Badge variant="neutral">Site</Badge>
      ),
  },
  {
    header: "Available Qty",
    align: "right",
    sortKey: "quantity",
    cell: (row) => row.quantity,
  },
  { header: "Unit", cell: (row) => row.unit },
  {
    header: "Last Updated",
    sortKey: "updatedAt",
    cell: (row) => <span className="text-ink-500">{formatDateTime(row.updatedAt)}</span>,
  },
];

const mobileCard: DataTableMobileCard<InventoryRow> = {
  primary: (row) => (
    <>
      {row.materialName}
      {row.sizeLabel ? <span className="text-ink-500"> ({row.sizeLabel})</span> : null}{" "}
      <span className="text-ink-500">· {row.locationType === "GODOWN" ? "Godown" : (row.siteName ?? "Site")}</span>
    </>
  ),
  omitHeaders: ["Material", "Location"],
};

export function InventoryListClient({
  rows,
  total,
  page,
  pageSize,
  categories,
  sites,
}: {
  rows: InventoryRow[];
  total: number;
  page: number;
  pageSize: number;
  categories: CategoryOption[];
  sites: SiteOption[];
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveFilter =
    Boolean(query.q) ||
    Boolean(query.getFilter("categoryId")) ||
    Boolean(query.getFilter("siteId")) ||
    Boolean(query.getFilter("locationType")) ||
    Boolean(query.getFilter("stockLevel"));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField
          label="Search"
          placeholder="Material name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
        <SelectField
          label="Category"
          options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          value={query.getFilter("categoryId") ?? ""}
          onChange={(e) => query.setFilter("categoryId", e.target.value || null)}
          className="mb-0"
        />
        <SelectField
          label="Site"
          options={[{ value: "", label: "All sites" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          value={query.getFilter("siteId") ?? ""}
          onChange={(e) => query.setFilter("siteId", e.target.value || null)}
          className="mb-0"
        />
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div
          role="group"
          aria-label="Location type filter"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-eyebrow uppercase text-ink-500">Location:</span>
          {LOCATION_TYPE_CHIPS.map((chip) => {
            const active = (query.getFilter("locationType") ?? "") === chip.value;
            return (
              <Button
                key={chip.value || "all"}
                type="button"
                size="sm"
                variant={active ? "primary" : "secondary"}
                aria-pressed={active}
                onClick={() => query.setFilter("locationType", chip.value || null)}
              >
                {chip.label}
              </Button>
            );
          })}
        </div>
        <div
          role="group"
          aria-label="Stock level filter"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-eyebrow uppercase text-ink-500">Stock Level:</span>
          {STOCK_LEVEL_CHIPS.map((chip) => {
            const active = (query.getFilter("stockLevel") ?? "") === chip.value;
            return (
              <Button
                key={chip.value || "all"}
                type="button"
                size="sm"
                variant={active ? "primary" : "secondary"}
                aria-pressed={active}
                onClick={() => query.setFilter("stockLevel", chip.value || null)}
              >
                {chip.label}
              </Button>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={rowKey}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveFilter
              ? {
                  status: "empty",
                  icon: <BoxIcon />,
                  message: "No results match your filters.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll(EXTRA_FILTER_NAMES)}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <BoxIcon />,
                  message: "Nothing recorded yet — Godown and Site stock will appear here once Purchases and Movements are recorded.",
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
