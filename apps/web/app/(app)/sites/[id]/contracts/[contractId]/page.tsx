import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowsIcon,
  Badge,
  ClipboardIcon,
  CorrectAction,
  DataTable,
  PencilIcon,
  RotateCcwIcon,
  StatTile,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { quantityUnitLabel } from "./quantity-unit-label";

export interface SiteContractDetail {
  id: string;
  subcontractorId: string;
  subcontractor: { id: string; name: string };
  siteId: string;
  site: { id: string; name: string };
  workCategory: string | null;
  description: string | null;
  rateType: "FIXED_COST" | "PER_TRIP" | "PER_PIPE" | "PER_UNIT" | "CUSTOM" | null;
  rateUnitLabel: string | null;
  rate: string | null;
  fixedAmount: string | null;
  estimatedQuantity: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  quantityCompleted: string;
  amountPaid: string;
  // FR-60: derived by the API (SiteContractsService.withComputed), never a
  // stored/editable column here.
  amountPayable: number | null;
  outstandingAmount: number | null;
}

interface WorkEntryRow {
  id: string;
  quantity: string;
  workDate: string;
  note: string | null;
}

interface SubcontractorPaymentRow {
  id: string;
  type: "ADVANCE" | "PAYMENT";
  amount: string;
  paymentMethod: string | null;
  paidAt: string;
  note: string | null;
}

const STATUS_BADGE: Record<SiteContractDetail["status"], { variant: "neutral" | "success" | "danger"; label: string }> = {
  DRAFT: { variant: "neutral", label: "Draft" },
  ACTIVE: { variant: "success", label: "Active" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "danger", label: "Cancelled" },
};

const RATE_TYPE_LABEL: Record<NonNullable<SiteContractDetail["rateType"]>, string> = {
  FIXED_COST: "Fixed Cost",
  PER_TRIP: "Per Trip",
  PER_PIPE: "Per Pipe",
  PER_UNIT: "Per Unit",
  CUSTOM: "Custom",
};

export async function getSiteContract(id: string): Promise<SiteContractDetail | null> {
  const res = await authedFetch(`/site-contracts/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site Contract (${res.status})`);
  }
  return res.json();
}

async function getViewerRole(): Promise<string | null> {
  try {
    const res = await authedFetch(`/users/me`, { cache: "no-store" });
    if (!res.ok) return null;
    const me = (await res.json()) as { role?: string };
    return typeof me.role === "string" ? me.role : null;
  } catch {
    return null;
  }
}

async function getWorkEntries(contractId: string): Promise<WorkEntryRow[]> {
  const res = await authedFetch(`/subcontractor-work-entries?siteContractId=${contractId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Work Entries (${res.status})`);
  }
  return res.json();
}

async function getPayments(contractId: string): Promise<SubcontractorPaymentRow[]> {
  const res = await authedFetch(`/subcontractor-payments?siteContractId=${contractId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Payments (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// D7's "never render a pending term as ₹0" convention, applied here too.
function rateOrAmountLabel(contract: SiteContractDetail): string {
  if (contract.rateType === "FIXED_COST") {
    return contract.fixedAmount === null ? "Pending terms" : `₹${Number(contract.fixedAmount).toLocaleString("en-IN")}`;
  }
  if (contract.rate === null) return "Pending terms";
  const unit = contract.rateType === "PER_TRIP" ? "trip" : contract.rateType === "PER_PIPE" ? "pipe" : contract.rateUnitLabel ?? "unit";
  return `₹${Number(contract.rate).toLocaleString("en-IN")} / ${unit}`;
}

function workEntryColumns(siteId: string, contractId: string): DataTableColumn<WorkEntryRow>[] {
  return [
    { header: "Date", cell: (entry) => <span className="text-ink-500">{formatDate(entry.workDate)}</span> },
    { header: "Quantity", align: "right", cell: (entry) => <span className="tabular-nums">{entry.quantity}</span> },
    { header: "Note", cell: (entry) => entry.note ?? <span className="text-ink-500">—</span> },
    {
      header: "",
      align: "right",
      cell: (entry) => (
        <CorrectAction
          icon={<RotateCcwIcon />}
          href={`/sites/${siteId}/contracts/${contractId}/work-entries/${entry.id}/correct`}
        />
      ),
    },
  ];
}

function paymentColumns(siteId: string, contractId: string): DataTableColumn<SubcontractorPaymentRow>[] {
  return [
    { header: "Date", cell: (payment) => <span className="text-ink-500">{formatDate(payment.paidAt)}</span> },
    {
      header: "Type",
      cell: (payment) => <span className="text-eyebrow font-semibold text-ink-500">{payment.type === "ADVANCE" ? "Advance" : "Payment"}</span>,
    },
    { header: "Method", cell: (payment) => payment.paymentMethod ?? <span className="text-ink-500">—</span> },
    {
      header: "Amount",
      align: "right",
      cell: (payment) => <span className="font-semibold text-gold-700 tabular-nums">₹{Number(payment.amount).toLocaleString("en-IN")}</span>,
    },
    {
      header: "",
      align: "right",
      cell: (payment) => (
        <CorrectAction
          icon={<RotateCcwIcon />}
          href={`/sites/${siteId}/contracts/${contractId}/payments/${payment.id}/correct`}
        />
      ),
    },
  ];
}

export default async function SiteContractDetailPage({
  params,
}: {
  params: Promise<{ id: string; contractId: string }>;
}) {
  const { id: siteId, contractId } = await params;
  const contract = await getSiteContract(contractId);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  const [viewerRole, workEntries, payments] = await Promise.all([
    getViewerRole(),
    getWorkEntries(contractId),
    getPayments(contractId),
  ]);
  const badge = STATUS_BADGE[contract.status];
  const showsQuantity = contract.rateType !== null && contract.rateType !== "FIXED_COST";

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/sites" className="hover:text-accent-teal-700 hover:underline">
          Sites
        </Link>{" "}
        /{" "}
        <Link href={`/sites/${siteId}`} className="hover:text-accent-teal-700 hover:underline">
          {contract.site.name}
        </Link>{" "}
        / {contract.workCategory ?? "Site Contract"}
      </div>

      <div className="mb-8 rounded-lg border border-border-hairline bg-surface-1 p-6 shadow-2">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 flex flex-wrap items-center gap-2 text-page-title text-ink-900">
              {contract.workCategory ?? "Site Contract"}
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </h1>
            <p className="text-body-sm text-ink-500">
              <Link href={`/subcontractors/${contract.subcontractor.id}`} className="font-semibold text-accent-teal-700 hover:underline">
                {contract.subcontractor.name}
              </Link>
              {contract.description ? ` · ${contract.description}` : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewerRole === "OWNER_ADMIN" ? (
              <Link
                href={`/sites/${siteId}/contracts/${contract.id}/edit`}
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                <PencilIcon className="size-4" />
                Edit terms
              </Link>
            ) : null}
            {/* AC #2-3/#6: only an Active, non-Fixed-Cost contract can take a
                Work Entry — no role gate, Supervisor and Owner/Admin both
                log work. */}
            {contract.status === "ACTIVE" && contract.rateType && contract.rateType !== "FIXED_COST" ? (
              <Link
                href={`/sites/${siteId}/contracts/${contract.id}/log-work`}
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                <ArrowsIcon className="size-4" />
                Log Work
              </Link>
            ) : null}
            {/* Money movement is Owner/Admin-only, same rule as Site
                Contract terms — enforced server-side regardless. */}
            {viewerRole === "OWNER_ADMIN" ? (
              <Link
                href={`/sites/${siteId}/contracts/${contract.id}/record-payment`}
                className={cn(buttonVariants({ variant: "primary" }))}
              >
                <WalletIcon className="size-4" />
                Record Payment
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-x-8">
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Rate type</div>
            <div className="text-body-sm text-ink-900">{contract.rateType ? RATE_TYPE_LABEL[contract.rateType] : "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Rate / amount</div>
            <div className="text-body-sm text-ink-900">{rateOrAmountLabel(contract)}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Start date</div>
            <div className="text-body-sm text-ink-900">{formatDate(contract.startDate)}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">End date</div>
            <div className="text-body-sm text-ink-900">{formatDate(contract.endDate)}</div>
          </div>
        </div>
      </div>

      <div className={cn("mb-8 grid grid-cols-1 gap-4", showsQuantity ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {showsQuantity ? (
          <StatTile
            icon={<ArrowsIcon />}
            tint="teal"
            value={
              <>
                {contract.quantityCompleted}
                {contract.estimatedQuantity ? (
                  <span className="text-body-sm font-semibold text-ink-500"> / ~{contract.estimatedQuantity}</span>
                ) : null}
              </>
            }
            label={`Quantity completed (${quantityUnitLabel(contract)})`}
          />
        ) : null}
        <StatTile
          icon={<WalletIcon />}
          tint="gold"
          value={contract.amountPayable === null ? "Pending" : `₹${contract.amountPayable.toLocaleString("en-IN")}`}
          label="Amount payable"
        />
        <StatTile
          icon={<WalletIcon />}
          tint={contract.outstandingAmount !== null && contract.outstandingAmount < 0 ? "success" : "gold"}
          value={
            contract.outstandingAmount === null
              ? "Pending"
              : contract.outstandingAmount < 0
                ? `₹${Math.abs(contract.outstandingAmount).toLocaleString("en-IN")}`
                : `₹${contract.outstandingAmount.toLocaleString("en-IN")}`
          }
          label={
            contract.outstandingAmount !== null && contract.outstandingAmount < 0
              ? "Advance — recovers against future work"
              : "Outstanding"
          }
        />
      </div>

      <div className="mb-4 text-section-header text-ink-900">Work Entries</div>
      <div className="mb-8">
        <DataTable
          columns={workEntryColumns(siteId, contractId)}
          rowKey={(entry) => entry.id}
          state={
            workEntries.length === 0
              ? { status: "empty", icon: <ClipboardIcon />, message: "No Work Entries logged yet for this Site Contract." }
              : { status: "success", rows: workEntries }
          }
        />
      </div>

      <div className="mb-4 text-section-header text-ink-900">Payments</div>
      <DataTable
        columns={paymentColumns(siteId, contractId)}
        rowKey={(payment) => payment.id}
        state={
          payments.length === 0
            ? { status: "empty", icon: <WalletIcon />, message: "No Payments recorded yet for this Site Contract." }
            : { status: "success", rows: payments }
        }
      />
    </>
  );
}
