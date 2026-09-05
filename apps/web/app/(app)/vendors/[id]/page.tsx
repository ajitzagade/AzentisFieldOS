import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  CameraIcon,
  ClipboardIcon,
  DataTable,
  PencilIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { getVendorPurchaseSummary, type Vendor, type VendorPurchaseSummary } from "../page";
import { DeleteEntityButton } from "../../_components/delete-entity-button";
import { RecordRecentlyViewed } from "../../_components/record-recently-viewed";
import { deleteVendorAction } from "./actions";

interface VendorPurchase {
  id: string;
  quantity: string;
  rate: string;
  totalAmount: string | null;
  invoiceOrChallanNo: string | null;
  challanPhotoUrl: string | null;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | null;
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

// The same summary the Vendors list shows per row — a transient failure
// renders an honest "—" here rather than blanking the whole detail page
// (mirrors the list's fault-isolation rule).
async function getVendorPurchaseSummarySafe(id: string): Promise<VendorPurchaseSummary | null> {
  try {
    const summary = await getVendorPurchaseSummary(id);
    return typeof summary?.totalThisYear === "number" && typeof summary?.notFullyPaidTotal === "number"
      ? summary
      : null;
  } catch {
    return null;
  }
}

const PAYMENT_STATUS_BADGE: Record<NonNullable<VendorPurchase["paymentStatus"]>, { variant: "success" | "warning" | "danger"; label: string }> = {
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
        {/* D7: an unpriced entry has no amount yet — pending, never ₹0. */}
        {purchase.totalAmount === null ? (
          <span className="text-ink-500">—</span>
        ) : (
          <>₹{Number(purchase.totalAmount).toLocaleString("en-IN")}</>
        )}
      </span>
    ),
  },
  {
    header: "Invoice / Challan #",
    cell: (purchase) => (
      <span className="flex items-center gap-1.5">
        {purchase.invoiceOrChallanNo ?? <span className="text-ink-500">—</span>}
        {purchase.challanPhotoUrl ? (
          <a
            href={purchase.challanPhotoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View challan photo"
            className="text-accent-teal-700 hover:text-accent-teal-800"
          >
            <CameraIcon className="size-3.5" />
          </a>
        ) : null}
      </span>
    ),
  },
  {
    header: "Payment status",
    cell: (purchase) => {
      // Purchase.paymentStatus is a plain DB column, not a Prisma enum
      // (unlike Site.status) — fall back rather than crash on a value
      // outside PAID/PARTIAL/UNPAID.
      const badge =
        purchase.paymentStatus === null
          ? { variant: "warning" as const, label: "Pricing pending" }
          : (PAYMENT_STATUS_BADGE[purchase.paymentStatus] ?? { variant: "neutral" as const, label: purchase.paymentStatus });
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  { header: "Date", cell: (purchase) => <span className="text-ink-500">{formatDate(purchase.purchasedAt)}</span> },
];

const purchaseMobileCard: DataTableMobileCard<VendorPurchase> = {
  primary: (purchase) => formatDate(purchase.purchasedAt),
  omitHeaders: ["Date"],
};

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  const [purchases, summary, viewerRole] = await Promise.all([
    getVendorPurchases(id),
    getVendorPurchaseSummarySafe(id),
    currentRole(),
  ]);

  // The confirmation must surface live consequences: unpaid purchases
  // disappear from Vendor Outstanding / Cash Tied Up with the Vendor.
  const deleteWarning =
    summary && summary.notFullyPaidTotal > 0
      ? ` Note: ₹${summary.notFullyPaidTotal.toLocaleString("en-IN")} of purchases are not yet marked Paid — deleting this Vendor removes that amount from Vendor Outstanding and Cash Tied Up.`
      : "";

  return (
    <>
      <RecordRecentlyViewed type="vendor" id={vendor.id} name={vendor.name} />

      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/vendors" className="hover:text-accent-teal-700 hover:underline">
          Vendors
        </Link>{" "}
        / {vendor.name}
      </div>

      <div className="mb-8 rounded-lg border border-border-hairline bg-surface-1 p-6 shadow-2">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-page-title text-ink-900">{vendor.name}</h1>
          <div className="action-button-row">
            <Link href={`/vendors/${vendor.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
              <PencilIcon className="size-4" />
              Edit Vendor
            </Link>
            {viewerRole === "OWNER_ADMIN" ? (
              <DeleteEntityButton
                label="Delete Vendor"
                title={`Delete ${vendor.name}?`}
                description={`This Vendor will disappear from every list and picker. Their purchase, RMC and disposal history stays in the database and is not destroyed.${deleteWarning}`}
                action={deleteVendorAction.bind(null, vendor.id)}
              />
            ) : null}
          </div>
        </div>

        {/* The same figures the Vendors list computes per row (GET
            /vendors/:id/purchase-summary) — surfaced here too so opening a
            Vendor never loses the money answer the list already gave. */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Total purchases (this year)</div>
            <div className="text-kpi-numeral tabular-nums text-ink-900">
              {summary === null ? (
                <span className="text-ink-500">—</span>
              ) : (
                `₹${summary.totalThisYear.toLocaleString("en-IN")}`
              )}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Payment status</div>
            {summary === null ? (
              <div className="text-kpi-numeral text-ink-500">—</div>
            ) : summary.notFullyPaidTotal === 0 ? (
              <div className="mt-1">
                <Badge variant="success">Fully Paid</Badge>
              </div>
            ) : (
              <div className="text-kpi-numeral tabular-nums text-warning-700">
                ₹{summary.notFullyPaidTotal.toLocaleString("en-IN")}
                <span className="ml-2 text-body-sm font-normal text-ink-500">not marked Paid</span>
              </div>
            )}
          </div>
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
        mobileCard={purchaseMobileCard}
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
