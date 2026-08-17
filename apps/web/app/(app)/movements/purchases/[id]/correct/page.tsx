import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchaseForm, type PurchaseFormInitialValues } from "../../purchase-form";

interface SiteOption {
  id: string;
  name: string;
}

interface MaterialListItem {
  id: string;
  name: string;
  sizes: { id: string; label: string }[];
}

interface VendorOption {
  id: string;
  name: string;
}

interface PurchaseForCorrection {
  id: string;
  vendorId: string;
  destination: "GODOWN" | "SITE";
  siteId: string | null;
  rate: string;
  totalAmount: string;
  invoiceOrChallanNo: string | null;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  deliveryLocation: string | null;
  vehicleDetails: string | null;
  receiverName: string | null;
  notes: string | null;
  purchasedAt: string;
  materialSize: { id: string };
}

async function getPurchase(id: string): Promise<PurchaseForCorrection | null> {
  const res = await fetch(`${process.env.API_URL}/purchases/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Purchase (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await fetch(`${process.env.API_URL}/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

async function getVendors(): Promise<VendorOption[]> {
  const res = await fetch(`${process.env.API_URL}/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

// AC #3: pre-fills from the Purchase being corrected, submits to the same
// POST /purchases as a plain create — correctsId (set here) is what tells
// the API this is a correction, not a route split (story 5.1 Dev Notes).
export default async function CorrectPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [purchase, sites, materials, vendors] = await Promise.all([getPurchase(id), getSites(), getMaterials(), getVendors()]);
  if (!purchase) {
    notFound();
  }

  const materialSizes = materials.flatMap((material) =>
    material.sizes.map((size) => ({ id: size.id, label: `${material.name} (${size.label})` })),
  );

  const initial: PurchaseFormInitialValues = {
    vendorId: purchase.vendorId,
    materialSizeId: purchase.materialSize.id,
    destination: purchase.destination,
    siteId: purchase.siteId ?? undefined,
    rate: purchase.rate,
    totalAmount: purchase.totalAmount,
    invoiceOrChallanNo: purchase.invoiceOrChallanNo ?? undefined,
    paymentStatus: purchase.paymentStatus,
    deliveryLocation: purchase.deliveryLocation ?? undefined,
    vehicleDetails: purchase.vehicleDetails ?? undefined,
    receiverName: purchase.receiverName ?? undefined,
    notes: purchase.notes ?? undefined,
    purchasedAt: purchase.purchasedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Purchase</h1>
      <PurchaseForm mode="correct" correctsId={purchase.id} materialSizes={materialSizes} sites={sites} vendors={vendors} initial={initial} />
    </div>
  );
}
