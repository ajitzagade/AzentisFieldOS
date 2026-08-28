import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { Badge, BuildingIcon, DataTable, PlusIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  materialsSupplied: string[];
}

export interface VendorPurchaseSummary {
  totalThisYear: number;
  notFullyPaidTotal: number;
}

interface VendorRow extends Vendor {
  summary: VendorPurchaseSummary | null;
}

async function getVendors(): Promise<Vendor[]> {
  const res = await authedFetch(`/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

export async function getVendorPurchaseSummary(id: string): Promise<VendorPurchaseSummary> {
  const res = await authedFetch(`/vendors/${id}/purchase-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendor purchase summary (${res.status})`);
  }
  return res.json();
}

// A single Vendor's summary fetch failing (deleted mid-request, transient
// 5xx) must not blank the whole table — every other row still loaded fine.
// `null` means "couldn't load," rendered as an honest "—", never
// defaulted to 0/Fully Paid, which would misrepresent what's actually owed.
async function getVendorPurchaseSummarySafe(id: string): Promise<VendorPurchaseSummary | null> {
  try {
    return await getVendorPurchaseSummary(id);
  } catch {
    return null;
  }
}

const columns: DataTableColumn<VendorRow>[] = [
  { header: "Vendor", cell: (vendor) => <span className="font-semibold">{vendor.name}</span> },
  {
    header: "Contact person",
    cell: (vendor) => vendor.contactPerson ?? <span className="text-ink-500">—</span>,
  },
  { header: "Phone", cell: (vendor) => vendor.phone ?? <span className="text-ink-500">—</span> },
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

export default async function VendorsPage() {
  const vendors = await getVendors();
  const summaries = await Promise.all(vendors.map((vendor) => getVendorPurchaseSummarySafe(vendor.id)));
  const rows: VendorRow[] = vendors.map((vendor, index) => ({ ...vendor, summary: summaries[index]! }));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Vendors</h1>
          <p className="text-body-sm text-ink-500">Materials, RMC and services suppliers across all sites</p>
        </div>
        <Link href="/vendors/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Vendor
        </Link>
      </div>

      <DataTable
        columns={columns}
        rowKey={(vendor) => vendor.id}
        rowHref={(vendor) => `/vendors/${vendor.id}`}
        state={
          rows.length === 0
            ? {
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
    </>
  );
}
