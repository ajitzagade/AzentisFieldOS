"use client";

import Link from "next/link";
import {
  Button,
  CorrectAction,
  DataTable,
  Pagination,
  PlusIcon,
  ReceiptIcon,
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

export interface ExpenseRow {
  id: string;
  amount: string;
  description: string | null;
  paymentMethod: string | null;
  personOrVendor: string | null;
  incurredAt: string;
  site: { id: string; name: string };
  category: { id: string; name: string };
}

const columns: DataTableColumn<ExpenseRow>[] = [
  { header: "Date", cell: (row) => formatDate(row.incurredAt), sortKey: "incurredAt" },
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Category", cell: (row) => row.category.name },
  {
    header: "Amount",
    align: "right",
    cell: (row) => <span className="font-semibold text-gold-700">{formatMoney(Number(row.amount))}</span>,
    sortKey: "amount",
  },
  {
    header: "Description",
    cell: (row) => row.description ?? <span className="text-ink-500">—</span>,
    sortKey: "description",
  },
  {
    header: "Payment method",
    cell: (row) => row.paymentMethod ?? <span className="text-ink-500">—</span>,
    sortKey: "paymentMethod",
  },
  {
    header: "Person / Vendor",
    cell: (row) => row.personOrVendor ?? <span className="text-ink-500">—</span>,
    sortKey: "personOrVendor",
  },
  {
    header: "",
    cell: (row) => (
      <div className="flex items-center justify-end">
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/expenses/${row.id}/correct`} />
      </div>
    ),
  },
];

const mobileCard: DataTableMobileCard<ExpenseRow> = {
  primary: (row) => (
    <>
      {row.category.name}{" "}
      <span className="text-gold-700 tabular-nums">{formatMoney(Number(row.amount))}</span>
    </>
  ),
  omitHeaders: ["Category", "Amount"],
  action: (row) => <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/expenses/${row.id}/correct`} />,
};

export function ExpensesListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: ExpenseRow[];
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
          placeholder="Description or Person/Vendor…"
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
                  icon: <ReceiptIcon />,
                  message: "No Expenses match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <ReceiptIcon />,
                  message: "No Expenses recorded yet.",
                  action: (
                    <Link href="/expenses/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Record your first Expense
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
