import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmReceiptForm } from "./confirm-receipt-form";

interface MovementForReceipt {
  id: string;
  sentQuantity: string;
  receivedQuantity: string | null;
  destinationSite: { name: string };
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}

async function getMovement(id: string): Promise<MovementForReceipt | null> {
  const res = await authedFetch(`/movements/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Movement (${res.status})`);
  }
  return res.json();
}

// AC #2: the receiving Site confirms what actually arrived — a separate,
// later step than the sent-side recording (Story 5.2 Dev Notes).
export default async function ConfirmReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movement = await getMovement(id);
  if (!movement || movement.receivedQuantity !== null) {
    notFound();
  }

  const materialLabel = `${movement.materialSize.material.name} (${movement.materialSize.label})`;
  const sentQuantity = `${movement.sentQuantity} ${movement.materialSize.material.unit.name}`;

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/movements" className="hover:text-accent-teal-700 hover:underline">
          Movements
        </Link>{" "}
        / Confirm Receipt
      </div>
      <h1 className="mb-1 text-page-title text-ink-900">Confirm Receipt</h1>
      <p className="mb-6 text-body-sm text-ink-500">
        {materialLabel} arriving at {movement.destinationSite.name}
      </p>
      <ConfirmReceiptForm movementId={movement.id} sentQuantity={sentQuantity} />
    </div>
  );
}
