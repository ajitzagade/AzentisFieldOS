import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContract } from "../../../page";
import { SubcontractorPaymentForm } from "../../subcontractor-payment-form";

interface SubcontractorPaymentRecord {
  id: string;
  siteContractId: string;
  type: "ADVANCE" | "PAYMENT";
  // Prisma Decimal — serialized as a string over JSON.
  amount: string;
  paymentMethod: string | null;
  paidAt: string;
  note: string | null;
}

async function getPayments(siteContractId: string): Promise<SubcontractorPaymentRecord[]> {
  const res = await authedFetch(`/subcontractor-payments?siteContractId=${siteContractId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Payments (${res.status})`);
  }
  return res.json();
}

export default async function CorrectSubcontractorPaymentPage({
  params,
}: {
  params: Promise<{ id: string; contractId: string; paymentId: string }>;
}) {
  const { id: siteId, contractId, paymentId } = await params;
  const [contract, payments] = await Promise.all([getSiteContract(contractId), getPayments(contractId)]);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) {
    notFound();
  }

  const amount = Number(payment.amount);
  if (Number.isNaN(amount)) {
    throw new Error(`Payment ${payment.id} has a non-numeric amount`);
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/sites/${siteId}/contracts/${contractId}`} className="hover:text-accent-teal-700 hover:underline">
          {contract.workCategory}
        </Link>{" "}
        / Correct Payment
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Payment</h1>
      <SubcontractorPaymentForm
        mode="correct"
        siteId={siteId}
        contractId={contractId}
        correctsId={payment.id}
        initial={{
          type: payment.type,
          amount,
          paymentMethod: payment.paymentMethod ?? undefined,
          paidAt: (payment.paidAt ?? "").slice(0, 10),
          note: payment.note ?? undefined,
        }}
      />
    </div>
  );
}
