import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ClipboardIcon, DataTable, PencilIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";
import type { Vendor } from "../page";

interface VendorPurchase {
  id: string;
  quantity: string;
  rate: string;
  totalAmount: string;
  invoiceOrChallanNo: string | null;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  purchasedAt: string;
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

async function getVendor(id: string): Promise<Vendor | null> {
  const res = await authedFetch(`/vendors/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vendor (${res.status})`);
  }
  return res.json();
}

async function getVendorPurchases(id: string): Promise<VendorPurchase[]> {
  const res = await authedFetch(`/vendors/${id}/purchases`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendor purchases (${res.status})`);
  }
  return res.json();
}

const PAYMENT_STATUS_BADGE: Record<VendorPurchase["paymentStatus"], { variant: "success" | "warning" | "danger"; label: string }> = {
  PAID: { variant: "success", label: "Paid" },
  PARTIAL: { variant: "warning", label: "Partial" },
  UNPAID: { variant: "danger", label: "Unpaid" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const purchaseColumns: DataTableColumn<VendorPurchase>[] = [
  {
    header: "Material",
    cell: (purchase) => `${purchase.materialSize.material.name} (${purchase.materialSize.label})`,
  },
  {
    header: "Quantity",
    align: "right",
    cell: (purchase) => `${purchase.quantity} ${purchase.materialSize.material.unit.name}`,
  },
  {
    header: "Amount",
    align: "right",
    cell: (purchase) => (
      <span className="font-semibold text-gold-700 tabular-nums">
        ₹{Number(purchase.totalAmount).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    header: "Invoice / Challan #",
    cell: (purchase) => purchase.invoiceOrChallanNo ?? <span className="text-ink-500">—</span>,
  },
  {
    header: "Payment status",
    cell: (purchase) => {
      // Purchase.paymentStatus is a plain DB column, not a Prisma enum
      // (unlike Site.status) — fall back rather than crash on a value
      // outside PAID/PARTIAL/UNPAID.
      const badge = PAYMENT_STATUS_BADGE[purchase.paymentStatus] ?? { variant: "neutral" as const, label: purchase.paymentStatus };
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  { header: "Date", cell: (purchase) => <span className="text-ink-500">{formatDate(purchase.purchasedAt)}</span> },
];

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  const purchases = await getVendorPurchases(id);

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/vendors" className="hover:text-accent-teal-700 hover:underline">
          Vendors
        </Link>{" "}
        / {vendor.name}
      </div>

      <div className="mb-8 rounded-lg border border-border-hairline bg-surface-1 p-6 shadow-2">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h1 className="text-page-title text-ink-900">{vendor.name}</h1>
          <Link href={`/vendors/${vendor.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <PencilIcon className="size-4" />
            Edit Vendor
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Contact person</div>
            <div className="text-body-sm text-ink-900">{vendor.contactPerson ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Phone</div>
            <div className="text-body-sm text-ink-900">{vendor.phone ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Email</div>
            <div className="text-body-sm text-ink-900">{vendor.email ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Address</div>
            <div className="text-body-sm text-ink-900">{vendor.address ?? "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1 text-eyebrow uppercase text-ink-500">Materials &amp; services supplied</div>
            {vendor.materialsSupplied.length === 0 ? (
              <span className="text-body-sm text-ink-500">—</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {vendor.materialsSupplied.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 text-section-header text-ink-900">Purchase History</div>
      <DataTable
        columns={purchaseColumns}
        rowKey={(purchase) => purchase.id}
        state={
          purchases.length === 0
            ? { status: "empty", icon: <ClipboardIcon />, message: "No Purchases recorded yet for this Vendor." }
            : { status: "success", rows: purchases }
        }
      />
    </>
  );
}
