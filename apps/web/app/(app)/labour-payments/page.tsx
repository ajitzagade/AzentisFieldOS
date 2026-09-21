import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { DataTable, PlusIcon, UsersIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";

export interface DailyLabourerListItem {
  id: string;
  name: string;
  category: string;
  defaultPerDayAmount: number | null;
  isActive: boolean;
  outstandingAdvanceBalance: number;
}

async function getLabourers(): Promise<DailyLabourerListItem[]> {
  const res = await authedFetch(`/daily-labourers`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Labourers (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<DailyLabourerListItem>[] = [
  { header: "Name", cell: (l) => l.name },
  { header: "Category", cell: (l) => l.category },
  {
    header: "Per-Day Amount",
    align: "right",
    cell: (l) =>
      l.defaultPerDayAmount === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        `₹${l.defaultPerDayAmount.toLocaleString("en-IN")}`
      ),
  },
  {
    header: "Outstanding Advance",
    align: "right",
    cell: (l) =>
      Number(l.outstandingAdvanceBalance) > 0 ? (
        <span className="font-semibold text-gold-700 tabular-nums">
          ₹{Number(l.outstandingAdvanceBalance).toLocaleString("en-IN")}
        </span>
      ) : (
        <span className="text-ink-500">₹0</span>
      ),
  },
];

export default async function LabourPaymentsPage() {
  const labourers = await getLabourers();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Labour Payment</h1>
          <p className="text-body-sm text-ink-500">
            Daily-wage labour — attendance, advances, and weekly settlement, tracked separately from Team &amp; Labour
          </p>
        </div>
        <Link href="/labour-payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Labourer
        </Link>
      </div>

      <DataTable
        columns={columns}
        rowKey={(l) => l.id}
        rowHref={(l) => `/labour-payments/${l.id}`}
        mobileCard={{ primary: (l) => l.name }}
        state={
          labourers.length === 0
            ? {
                status: "empty",
                icon: <UsersIcon />,
                message: "No Labourers added yet.",
                action: (
                  <Link href="/labour-payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Add your first Labourer
                  </Link>
                ),
              }
            : { status: "success", rows: labourers }
        }
      />
    </>
  );
}
