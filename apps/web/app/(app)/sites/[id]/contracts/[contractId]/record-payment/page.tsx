import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContract } from "../page";
import { SubcontractorPaymentForm } from "../payments/subcontractor-payment-form";

export default async function RecordPaymentPage({
  params,
}: {
  params: Promise<{ id: string; contractId: string }>;
}) {
  const { id: siteId, contractId } = await params;
  const contract = await getSiteContract(contractId);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/sites/${siteId}/contracts/${contractId}`} className="hover:text-accent-teal-700 hover:underline">
          {contract.workCategory}
        </Link>{" "}
        / Record Payment
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Record Payment</h1>
      <SubcontractorPaymentForm mode="new" siteId={siteId} contractId={contractId} />
    </div>
  );
}
