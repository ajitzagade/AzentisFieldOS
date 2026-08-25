import Link from "next/link";
import { Button, DataTable, PlusIcon, ReceiptIcon, type DataTableColumn } from "@azentisfieldos/ui";

interface ExpenseRow {
  id: string;
  amount: string;
  description: string | null;
  paymentMethod: string | null;
  personOrVendor: string | null;
  incurredAt: string;
  site: { id: string; name: string };
  category: { id: string; name: string };
}

async function getExpenses(): Promise<ExpenseRow[]> {
  const res = await fetch(`${process.env.API_URL}/expenses`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expenses (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const columns: DataTableColumn<ExpenseRow>[] = [
  { header: "Date", cell: (row) => formatDate(row.incurredAt) },
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Category", cell: (row) => row.category.name },
  {
    header: "Description",
    cell: (row) => row.description ?? <span className="text-ink-500">—</span>,
  },
  { header: "Paid to", cell: (row) => row.personOrVendor ?? <span className="text-ink-500">—</span> },
  { header: "Method", cell: (row) => row.paymentMethod ?? <span className="text-ink-500">—</span> },
  {
    header: "Amount",
    align: "right",
    cell: (row) => <span className="font-semibold text-gold-700">₹{Number(row.amount).toLocaleString("en-IN")}</span>,
  },
];

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const totalThisMonth = expenses
    .filter((e) => new Date(e.incurredAt).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Expenses</h1>
          <p className="text-body-sm text-ink-500">
            Site expenses across all Sites — fuel, labour welfare, and site miscellaneous
            {totalThisMonth > 0 ? (
              <>
                {" "}
                — <span className="font-semibold text-ink-700">₹{totalThisMonth.toLocaleString("en-IN")}</span> this
                month
              </>
            ) : null}
          </p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <PlusIcon className="size-4" />
            Record Expense
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          expenses.length === 0
            ? {
                status: "empty",
                icon: <ReceiptIcon />,
                message: "No Expenses recorded yet.",
                action: (
                  <Link href="/expenses/new">
                    <Button>
                      <PlusIcon className="size-4" />
                      Record Expense
                    </Button>
                  </Link>
                ),
              }
            : { status: "success", rows: expenses }
        }
      />

      <p className="mt-4 text-caption text-ink-500">
        Expenses can be recorded here directly, or logged as part of a Daily Site Report.
      </p>
    </>
  );
}
