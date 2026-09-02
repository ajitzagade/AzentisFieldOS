"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  ChevronRightIcon,
  CorrectAction,
  DataTable,
  Pagination,
  PlusIcon,
  RotateCcwIcon,
  TextField,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { formatMoney } from "../../../lib/format";
import { MarkPaidButton } from "./mark-paid-button";

export interface PaymentListItem {
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

// canManage gates the write actions (Mark Paid, Correct — both ultimately
// hit apps/api's now OWNER_ADMIN-gated /payments endpoints) column-builder
// style, since these are module-level column/mobileCard definitions rather
// than JSX with direct access to the component's props.
function buildColumns(canManage: boolean): DataTableColumn<PaymentListItem>[] {
  return [
  { header: "Team Member", cell: (p) => p.teamMember.name },
  {
    header: "Period",
    cell: (p) => p.payPeriod ?? <span className="text-ink-500">—</span>,
    sortKey: "payPeriod",
  },
  {
    header: "Base Pay",
    align: "right",
    cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.basePay))}</span>,
    sortKey: "basePay",
  },
  {
    header: "Additional",
    align: "right",
    cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.additionalAmount))}</span>,
    sortKey: "additionalAmount",
  },
  {
    header: "Deductions",
    align: "right",
    cell: (p) => <span className="tabular-nums">{formatMoney(Number(p.deductions))}</span>,
    sortKey: "deductions",
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
    sortKey: "netPayable",
  },
  {
    header: "Status",
    cell: (p) => (p.status === "paid" ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Pending</Badge>),
    sortKey: "status",
  },
  {
    header: "",
    cell: (p) => (
      <div className="flex items-center justify-end gap-1">
        {canManage && p.status === "pending" ? <MarkPaidButton id={p.id} /> : null}
        {canManage ? (
          <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/payments/${p.id}/correct`} />
        ) : null}
        <Link
          href={`/team/${p.teamMember.id}`}
          aria-label={`View ${p.teamMember.name}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    ),
  },
  ];
}

function buildMobileCard(canManage: boolean): DataTableMobileCard<PaymentListItem> {
  return {
    primary: (p) => p.teamMember.name,
    omitHeaders: ["Team Member"],
    action: (p) => (
      <>
        {canManage ? (
          <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/payments/${p.id}/correct`} />
        ) : null}
        <Link
          href={`/team/${p.teamMember.id}`}
          aria-label={`View ${p.teamMember.name}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      </>
    ),
    footer: (p) => (canManage && p.status === "pending" ? <MarkPaidButton id={p.id} /> : null),
  };
}

export function PaymentsListClient({
  rows,
  total,
  page,
  pageSize,
  canManage,
}: {
  rows: PaymentListItem[];
  total: number;
  page: number;
  pageSize: number;
  canManage: boolean;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);

  const hasActiveSearch = Boolean(query.q);
  const columns = buildColumns(canManage);
  const mobileCard = buildMobileCard(canManage);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search"
          placeholder="Team Member name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(p) => p.id}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <WalletIcon />,
                  message: "No Payments match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <WalletIcon />,
                  message: "No Payments recorded yet.",
                  action: canManage ? (
                    <Link href="/payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Record your first Payment
                    </Link>
                  ) : undefined,
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
