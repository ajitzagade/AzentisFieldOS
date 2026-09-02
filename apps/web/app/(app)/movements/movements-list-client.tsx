"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowsIcon,
  Badge,
  Button,
  ChevronRightIcon,
  CheckCircleIcon,
  CorrectAction,
  DataTable,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  Pagination,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";

interface MovementRow {
  id: string;
  sortKey: number;
  typeBadge: ReactNode;
  material: string;
  flow: ReactNode;
  sentQty: string;
  receivedQty: ReactNode;
  date: string;
  correctHref: string;
  confirmReceiptHref?: string;
  pricingHref?: string;
}

interface PurchaseListItem {
  id: string;
  destination: "GODOWN" | "SITE";
  quantity: string;
  totalAmount: string | null;
  correctsId: string | null;
  purchasedAt: string;
  site: { id: string; name: string } | null;
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface MovementListItem {
  id: string;
  sentQuantity: string;
  receivedQuantity: string | null;
  movedAt: string;
  sourceSite: { id: string; name: string } | null;
  destinationSite: { id: string; name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface ConsumptionListItem {
  id: string;
  quantity: string;
  consumedAt: string;
  site: { id: string; name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

interface ReturnWastageListItem {
  id: string;
  kind: "RETURN" | "WASTAGE";
  quantity: string;
  recordedAt: string;
  site: { id: string; name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

export interface MovementLogRow {
  type: "PURCHASE" | "MOVEMENT" | "CONSUMPTION" | "RETURN_WASTAGE";
  id: string;
  item: PurchaseListItem | MovementListItem | ConsumptionListItem | ReturnWastageListItem;
}

interface SiteOption {
  id: string;
  name: string;
}

function formatQuantity(quantity: string, unitName: string): string {
  return `${quantity} ${unitName}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function purchaseToMovementRow(purchase: PurchaseListItem, canPrice: boolean): MovementRow {
  const materialLabel = `${purchase.materialSize.material.name} (${purchase.materialSize.label})`;
  const qty = formatQuantity(purchase.quantity, purchase.materialSize.material.unit.name);
  // D7: an inward entry recorded at the gate without the bill waits for the
  // Owner's pricing — flagged inline, never shown as a silent ₹0. A
  // correction row is a signed delta and never carries its own pricing, so
  // it is neither "pending" nor priceable. (== null also catches a payload
  // that omits the field, rather than silently rendering it as priced.)
  const pricingPending = purchase.totalAmount == null && purchase.correctsId == null;
  return {
    id: purchase.id,
    sortKey: new Date(purchase.purchasedAt).getTime(),
    typeBadge: pricingPending ? (
      <span className="inline-flex flex-wrap items-center gap-1">
        <Badge variant="success">Purchase</Badge>
        <Badge variant="warning">Pricing pending</Badge>
      </span>
    ) : (
      <Badge variant="success">Purchase</Badge>
    ),
    material: materialLabel,
    flow: purchase.destination === "GODOWN" ? "Godown" : (purchase.site?.name ?? "Site"),
    sentQty: qty,
    receivedQty: qty,
    date: formatDate(purchase.purchasedAt),
    correctHref: `/movements/purchases/${purchase.id}/correct`,
    pricingHref: pricingPending && canPrice ? `/movements/purchases/${purchase.id}/pricing` : undefined,
  };
}

function movementToMovementRow(movement: MovementListItem): MovementRow {
  const materialLabel = `${movement.materialSize.material.name} (${movement.materialSize.label})`;
  const unitName = movement.materialSize.material.unit.name;
  const sentQty = formatQuantity(movement.sentQuantity, unitName);
  const pending = movement.receivedQuantity === null;
  const mismatch = !pending && movement.receivedQuantity !== movement.sentQuantity;

  return {
    id: movement.id,
    sortKey: new Date(movement.movedAt).getTime(),
    typeBadge: <Badge variant="gold">Movement</Badge>,
    material: materialLabel,
    flow: (
      <span className="inline-flex items-center gap-1">
        {movement.sourceSite?.name ?? "Godown"}
        <ChevronRightIcon className="size-3 text-ink-500" />
        {movement.destinationSite.name}
      </span>
    ),
    sentQty,
    receivedQty: pending ? (
      <Badge variant="neutral">Pending receipt</Badge>
    ) : mismatch ? (
      <span className="font-semibold text-warning-700">{formatQuantity(movement.receivedQuantity!, unitName)}</span>
    ) : (
      formatQuantity(movement.receivedQuantity!, unitName)
    ),
    date: formatDate(movement.movedAt),
    correctHref: `/movements/godown-to-site/${movement.id}/correct`,
    confirmReceiptHref: pending ? `/movements/${movement.id}/confirm-receipt` : undefined,
  };
}

function consumptionToMovementRow(consumption: ConsumptionListItem): MovementRow {
  const materialLabel = `${consumption.materialSize.material.name} (${consumption.materialSize.label})`;
  const qty = formatQuantity(consumption.quantity, consumption.materialSize.material.unit.name);
  return {
    id: consumption.id,
    sortKey: new Date(consumption.consumedAt).getTime(),
    typeBadge: <Badge variant="neutral">Consumption</Badge>,
    material: materialLabel,
    flow: consumption.site.name,
    sentQty: qty,
    receivedQty: <span className="text-ink-500">—</span>,
    date: formatDate(consumption.consumedAt),
    correctHref: `/movements/consumption/${consumption.id}/correct`,
  };
}

function returnWastageToMovementRow(entry: ReturnWastageListItem): MovementRow {
  const materialLabel = `${entry.materialSize.material.name} (${entry.materialSize.label})`;
  const qty = formatQuantity(entry.quantity, entry.materialSize.material.unit.name);
  return {
    id: entry.id,
    sortKey: new Date(entry.recordedAt).getTime(),
    typeBadge: <Badge variant="danger">Wastage / Return</Badge>,
    material: materialLabel,
    flow: entry.site.name,
    sentQty: qty,
    receivedQty: qty,
    date: formatDate(entry.recordedAt),
    correctHref: `/movements/return-wastage/${entry.id}/correct`,
  };
}

function toMovementRow(row: MovementLogRow, canPrice: boolean): MovementRow {
  switch (row.type) {
    case "PURCHASE":
      return purchaseToMovementRow(row.item as PurchaseListItem, canPrice);
    case "MOVEMENT":
      return movementToMovementRow(row.item as MovementListItem);
    case "CONSUMPTION":
      return consumptionToMovementRow(row.item as ConsumptionListItem);
    case "RETURN_WASTAGE":
      return returnWastageToMovementRow(row.item as ReturnWastageListItem);
  }
}

const columns: DataTableColumn<MovementRow>[] = [
  { header: "Type", cell: (r) => r.typeBadge },
  { header: "Material", cell: (r) => r.material },
  { header: "Site / Godown", cell: (r) => r.flow },
  { header: "Sent Qty", align: "right", cell: (r) => r.sentQty },
  { header: "Received Qty", align: "right", cell: (r) => r.receivedQty },
  { header: "Date", cell: (r) => <span className="text-ink-500">{r.date}</span>, sortKey: "date" },
  {
    header: "",
    cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        {r.confirmReceiptHref ? (
          <Link href={r.confirmReceiptHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            <CheckCircleIcon className="size-4" />
            Confirm Receipt
          </Link>
        ) : null}
        {r.pricingHref ? (
          <Link href={r.pricingHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            <WalletIcon className="size-4" />
            Add Pricing
          </Link>
        ) : null}
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={r.correctHref} />
      </div>
    ),
  },
];

const mobileCard: DataTableMobileCard<MovementRow> = {
  primary: (r) => (
    <span className="flex flex-wrap items-center gap-2">
      {r.typeBadge}
      {r.material}
    </span>
  ),
  omitHeaders: ["Type", "Material"],
  action: (r) => <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={r.correctHref} />,
  footer: (r) =>
    r.pricingHref ? (
      <Link href={r.pricingHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
        <WalletIcon className="size-4" />
        Add Pricing
      </Link>
    ) : r.confirmReceiptHref ? (
      <Link href={r.confirmReceiptHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
        <CheckCircleIcon className="size-4" />
        Confirm Receipt
      </Link>
    ) : null,
};

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "MOVEMENT", label: "Movement" },
  { value: "CONSUMPTION", label: "Consumption" },
  { value: "RETURN_WASTAGE", label: "Wastage / Return" },
  // Story 19.5: Dashboard gap-flag deep link for >1 pending Purchase —
  // unpriced originals only (apps/api's movements-log.service.ts folds in
  // { totalAmount: null, correctsId: null }, mirroring countPendingPricing()).
  { value: "PURCHASE_PENDING_PRICING", label: "Pricing pending" },
];

export function MovementsListClient({
  rows,
  total,
  page,
  pageSize,
  sites,
  canPrice = false,
}: {
  rows: MovementLogRow[];
  total: number;
  page: number;
  pageSize: number;
  sites: SiteOption[];
  /** D7: Owner/Admin only — renders "Add Pricing" on unpriced Purchases. */
  canPrice?: boolean;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveFilter =
    Boolean(query.q) ||
    Boolean(query.getFilter("type")) ||
    Boolean(query.getFilter("siteId")) ||
    Boolean(query.getFilter("from")) ||
    Boolean(query.getFilter("to"));
  const displayRows = rows.map((row) => toMovementRow(row, canPrice));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Movements</h1>
          <p className="text-body-sm text-ink-500">
            Purchases, Godown &amp; Site transfers, Consumption and Wastage / Returns — every entry is permanent history
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link href="/movements/vendor-to-site/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Direct Vendor → Site
          </Link>
          <Link href="/movements/godown-to-site/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Record Movement
          </Link>
          <Link href="/movements/site-to-site/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Record Transfer
          </Link>
          <Link href="/movements/consumption/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Record Consumption
          </Link>
          <Link href="/movements/return-wastage/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Record Wastage / Return
          </Link>
          <Link href="/movements/purchases/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Record Purchase
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField
          label="Search"
          placeholder="Material or Site name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0"
        />
        <SelectField
          label="Type"
          options={TYPE_OPTIONS}
          value={query.getFilter("type") ?? ""}
          onChange={(e) => query.setFilter("type", e.target.value || null)}
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

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(r) => r.id}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          displayRows.length === 0
            ? hasActiveFilter
              ? {
                  status: "empty",
                  icon: <ArrowsIcon />,
                  message: "No entries match your search or filters.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll(["type", "siteId"])}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <ArrowsIcon />,
                  message: "No Purchases, movements, consumption, or wastage/return recorded yet.",
                  action: (
                    <Link href="/movements/purchases/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Record your first Purchase
                    </Link>
                  ),
                }
            : { status: "success", rows: displayRows }
        }
      />

      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={query.setPage} />
      </div>
    </>
  );
}
