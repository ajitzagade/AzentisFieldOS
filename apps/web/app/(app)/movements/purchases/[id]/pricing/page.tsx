import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@azentisfieldos/ui";
import { PricingForm } from "./pricing-form";

interface PurchaseForPricing {
  id: string;
  quantity: string;
  totalAmount: string | null;
  purchasedAt: string;
  receiverName: string | null;
  vendor: { name: string };
  site: { name: string } | null;
  destination: "GODOWN" | "SITE";
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

async function getPurchase(id: string): Promise<PurchaseForPricing | null> {
  const res = await authedFetch(`/purchases/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Purchase (${res.status})`);
  }
  return res.json();
}

// D7: the Owner's pricing completion for a Supervisor's unpriced inward
// entry. Owner/Admin-only — a Supervisor 404s here (same pattern as
// /settings), matching the API's @Roles guard on the PATCH.
export default async function PurchasePricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [role, purchase] = await Promise.all([currentRole(), getPurchase(id)]);
  if (role !== "OWNER_ADMIN" || !purchase) {
    notFound();
  }
  // Already priced: nothing to complete — changes go through Correct.
  if (purchase.totalAmount !== null) {
    redirect(`/movements?flash=${encodeURIComponent("This Purchase is already priced")}`);
  }

  const quantity = Number(purchase.quantity);
  const unit = purchase.materialSize.material.unit.name;
  const deliveredTo = purchase.destination === "GODOWN" ? "Godown" : (purchase.site?.name ?? "Site");
  const when = new Date(purchase.purchasedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Add Pricing
      </div>
      <h1 className="mb-1 text-page-title text-ink-900">Add Pricing</h1>
      <p className="mb-6 text-body-sm text-ink-500">
        Recorded at the gate without the bill — complete the money details to move it off the pending list.
      </p>

      {/* What the Supervisor recorded — read-only context for verification,
          never re-entered (the quantity feeds the auto-calculated Total). */}
      <Card className="mb-4">
        <div className="text-body font-semibold text-ink-900">
          {purchase.materialSize.material.name} ({purchase.materialSize.label}) — {quantity.toLocaleString("en-IN")} {unit}
        </div>
        <p className="mt-1 text-body-sm text-ink-700">
          {purchase.vendor.name} → {deliveredTo} · {when}
          {purchase.receiverName ? ` · received by ${purchase.receiverName}` : ""}
        </p>
      </Card>

      <Card>
        <PricingForm purchaseId={purchase.id} quantity={quantity} />
      </Card>
    </div>
  );
}
