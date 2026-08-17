import Link from "next/link";
import {
  AlertTriangleIcon,
  Badge,
  ChevronRightIcon,
  CorrectAction,
  DataTable,
  PlusIcon,
  RotateCcwIcon,
  StatTile,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { MarkPaidButton } from "./mark-paid-button";

interface PaymentListItem {
  id: string;
  basePay: string;
  additionalAmount: string;
  deductions: string;
  netPayable: string;
  payPeriod: string | null;
  status: "pending" | "paid";
  teamMember: { id: string; name: string };
  advanceAdjustments: { amount: string }[];
}

interface TeamSummary {
  monthlyPaymentTotal: number;
}

interface OutstandingAdvances {
  total: number;
}

async function getPayments(): Promise<PaymentListItem[]> {
  const res = await fetch(`${process.env.API_URL}/payments`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Payments (${res.status})`);
  }
  return res.json();
}

async function getPendingCount(): Promise<number> {
  const res = await fetch(`${process.env.API_URL}/payments/count/pending`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load pending Payments count (${res.status})`);
  }
  return res.json();
}

async function getTeamSummary(): Promise<TeamSummary> {
  const res = await fetch(`${process.env.API_URL}/team-members/team-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Summary (${res.status})`);
  }
  return res.json();
}

// Story 7.4 (AC #1): the one shared Outstanding Advances number — the
// Team list page reads the same endpoint, never a second computation.
async function getOutstandingAdvances(): Promise<OutstandingAdvances> {
  const res = await fetch(`${process.env.API_URL}/team-members/outstanding-advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Outstanding Advances (${res.status})`);
  }
  return res.json();
}

function formatMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

const columns: DataTableColumn<PaymentListItem>[] = [
  { header: "Team Member", cell: (p) => p.teamMember.name },
  { header: "Period", cell: (p) => p.payPeriod ?? <span className="text-ink-500">—</span> },
  { header: "Base Pay", align: "right", cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.basePay))}</span> },
  {
    header: "Additional",
    align: "right",
    cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.additionalAmount))}</span>,
  },
  {
    header: "Deductions",
    align: "right",
    cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.deductions))}</span>,
  },
  {
    header: "Advance Adjustment",
    align: "right",
    cell: (p) => (
      <span className="tabular-nums">
        {p.advanceAdjustments[0] ? formatMoney(-Number(p.advanceAdjustments[0].amount)) : formatMoney(0)}
      </span>
    ),
  },
  {
    header: "Net Payable",
    align: "right",
    cell: (p) => <span className="font-semibold text-gold-700 tabular-nums">{formatMoney(Number(p.netPayable))}</span>,
  },
  {
    header: "Status",
    cell: (p) => (p.status === "paid" ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Pending</Badge>),
  },
  {
    header: "",
    cell: (p) => (
      <div className="flex items-center justify-end gap-1">
        {p.status === "pending" ? <MarkPaidButton id={p.id} /> : null}
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/payments/${p.id}/correct`} />
        <Link href={`/team/${p.teamMember.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}>
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    ),
  },
];

export default async function PaymentsPage() {
  const [payments, pendingCount, teamSummary, outstandingAdvances] = await Promise.all([
    getPayments(),
    getPendingCount(),
    getTeamSummary(),
    getOutstandingAdvances(),
  ]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Payments</h1>
          <p className="text-body-sm text-ink-500">Base + Additional − Deductions − Advance Adjustment = Net Payable</p>
        </div>
        <Link href="/payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Record Payment
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(teamSummary.monthlyPaymentTotal)}
          label="Total Paid This Month"
          tint="gold"
        />
        <StatTile icon={<AlertTriangleIcon />} value={pendingCount} label="Pending Payments" />
        <StatTile
          icon={<WalletIcon />}
          value={formatMoney(outstandingAdvances.total)}
          label="Total Outstanding Advances"
          tint="gold"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(p) => p.id}
        state={
          payments.length === 0
            ? {
                status: "empty",
                icon: <WalletIcon />,
                message: "No Payments recorded yet.",
                action: (
                  <Link href="/payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Record your first Payment
                  </Link>
                ),
              }
            : { status: "success", rows: payments }
        }
      />
    </>
  );
}
