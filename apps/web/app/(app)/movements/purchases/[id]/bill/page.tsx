import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@azentisfieldos/ui";
import { AttachBillForm, type BillItem } from "./attach-bill-form";

interface PurchaseForBill {
  id: string;
  quantity: string;
  purchasedAt: string;
  vendor: { name: string };
  site: { name: string } | null;
  destination: "GODOWN" | "SITE";
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
  bills: BillItem[];
}

async function getPurchase(id: string): Promise<PurchaseForBill | null> {
  const res = await authedFetch(`/purchases/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Purchase (${res.status})`);
  }
  return res.json();
}

// Attach Bill (2026-09-22): entirely optional record-keeping — a Purchase
// is already valid and complete with zero bills attached (material commonly
// arrives before the vendor's invoice does). Owner/Admin-only, same pattern
// as the pricing page (a Supervisor 404s here, matching the API's @Roles
// guard on the confirm endpoint).
export default async function PurchaseBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [role, purchase] = await Promise.all([currentRole(), getPurchase(id)]);
  if (role !== "OWNER_ADMIN" || !purchase) {
    notFound();
  }

  const quantity = Number(purchase.quantity);
  const unit = purchase.materialSize.material.unit.name;
  const deliveredTo = purchase.destination === "GODOWN" ? "Godown" : (purchase.site?.name ?? "Site");
  const when = formatDate(purchase.purchasedAt);

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Attach Bill
      </div>
      <h1 className="mb-1 text-page-title text-ink-900">Attach Bill</h1>
      <p className="mb-6 text-body-sm text-ink-500">
        Optional record-keeping — nothing here is required, and this Purchase already stands on its own.
      </p>

      <Card className="mb-4">
        <div className="text-body font-semibold text-ink-900">
          {purchase.materialSize.material.name} ({purchase.materialSize.label}) — {quantity.toLocaleString("en-IN")} {unit}
        </div>
        <p className="mt-1 text-body-sm text-ink-700">
          {purchase.vendor.name} → {deliveredTo} · {when}
        </p>
      </Card>

      <Card>
        <AttachBillForm purchaseId={purchase.id} initialBills={purchase.bills} />
      </Card>
    </div>
  );
}
