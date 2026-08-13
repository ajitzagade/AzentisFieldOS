import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowsIcon,
  Badge,
  ChevronRightIcon,
  CheckCircleIcon,
  CorrectAction,
  DataTable,
  PlusIcon,
  RotateCcwIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

// The combined transaction log: Story 5.1 produces Purchase rows, Story
// 5.2 adds Movement rows here (Stories 5.3-5.6 extend this same shape,
// per 07-movements.html) — never a separate list per transaction type.
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
}

interface PurchaseListItem {
  id: string;
  destination: "GODOWN" | "SITE";
  quantity: string;
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

async function getPurchases(): Promise<PurchaseListItem[]> {
  const res = await fetch(`${process.env.API_URL}/purchases`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Purchases (${res.status})`);
  }
  return res.json();
}

async function getMovements(): Promise<MovementListItem[]> {
  const res = await fetch(`${process.env.API_URL}/movements`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Movements (${res.status})`);
  }
  return res.json();
}

async function getConsumption(): Promise<ConsumptionListItem[]> {
  const res = await fetch(`${process.env.API_URL}/consumption`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Consumption (${res.status})`);
  }
  return res.json();
}

async function getReturnWastage(): Promise<ReturnWastageListItem[]> {
  const res = await fetch(`${process.env.API_URL}/return-wastage`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Wastage/Return entries (${res.status})`);
  }
  return res.json();
}

function formatQuantity(quantity: string, unitName: string): string {
  return `${quantity} ${unitName}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function purchaseToMovementRow(purchase: PurchaseListItem): MovementRow {
  const materialLabel = `${purchase.materialSize.material.name} (${purchase.materialSize.label})`;
  const qty = formatQuantity(purchase.quantity, purchase.materialSize.material.unit.name);
  return {
    id: purchase.id,
    sortKey: new Date(purchase.purchasedAt).getTime(),
    typeBadge: <Badge variant="success">Purchase</Badge>,
    material: materialLabel,
    flow: purchase.destination === "GODOWN" ? "Godown" : (purchase.site?.name ?? "Site"),
    sentQty: qty,
    receivedQty: qty,
    date: formatDate(purchase.purchasedAt),
    correctHref: `/movements/purchases/${purchase.id}/correct`,
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
    // Consumption has only one quantity, not a sent/received pair — never
    // force a value into this column (Story 5.5 Task 3).
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
    typeBadge: <Badge variant="danger">Wastage &amp; Return</Badge>,
    material: materialLabel,
    flow: entry.site.name,
    // No sent/received-gap concept for this transaction type — both
    // columns reflect the one recorded quantity (07-movements.html).
    sentQty: qty,
    receivedQty: qty,
    date: formatDate(entry.recordedAt),
    correctHref: `/movements/return-wastage/${entry.id}/correct`,
  };
}

const columns: DataTableColumn<MovementRow>[] = [
  { header: "Type", cell: (r) => r.typeBadge },
  { header: "Material", cell: (r) => r.material },
  { header: "Site / Godown", cell: (r) => r.flow },
  { header: "Sent Qty", align: "right", cell: (r) => r.sentQty },
  { header: "Received Qty", align: "right", cell: (r) => r.receivedQty },
  { header: "Date", cell: (r) => <span className="text-ink-500">{r.date}</span> },
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
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={r.correctHref} />
      </div>
    ),
  },
];

export default async function MovementsPage() {
  const [purchases, movements, consumption, returnWastage] = await Promise.all([
    getPurchases(),
    getMovements(),
    getConsumption(),
    getReturnWastage(),
  ]);
  const rows = [
    ...purchases.map(purchaseToMovementRow),
    ...movements.map(movementToMovementRow),
    ...consumption.map(consumptionToMovementRow),
    ...returnWastage.map(returnWastageToMovementRow),
  ].sort((a, b) => b.sortKey - a.sortKey);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Movements</h1>
          <p className="text-body-sm text-ink-500">
            Purchases, Godown &amp; Site transfers, Consumption and Wastage &amp; Returns — every entry is permanent history
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

      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={
          rows.length === 0
            ? {
                status: "empty",
                icon: <ArrowsIcon />,
                message: "No Purchases, movements, or consumption recorded yet.",
                action: (
                  <Link href="/movements/purchases/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Record your first Purchase
                  </Link>
                ),
              }
            : { status: "success", rows }
        }
      />
    </>
  );
}
