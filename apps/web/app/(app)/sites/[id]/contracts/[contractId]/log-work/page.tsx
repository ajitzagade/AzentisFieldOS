import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContract } from "../page";
import { WorkEntryForm } from "../work-entries/work-entry-form";
import { quantityUnitLabel } from "../quantity-unit-label";

export default async function LogWorkPage({ params }: { params: Promise<{ id: string; contractId: string }> }) {
  const { id: siteId, contractId } = await params;
  const contract = await getSiteContract(contractId);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  // FR-58/AC #2-3: Work Entries only attach to an Active, non-Fixed-Cost
  // contract — the API enforces this too, but the page explains why the
  // form isn't here rather than presenting a form that will just 400.
  if (contract.status !== "ACTIVE" || contract.rateType === "FIXED_COST" || !contract.rateType) {
    return (
      <div className="max-w-160">
        <h1 className="mb-4 text-page-title text-ink-900">Log Work</h1>
        <p className="text-body-sm text-ink-700">
          {contract.rateType === "FIXED_COST"
            ? "Fixed Cost contracts don't track billable quantity — this contract's completion is tracked by its status (Draft → Active → Completed) instead."
            : "Work can only be logged against an Active contract."}{" "}
          <Link href={`/sites/${siteId}/contracts/${contractId}`} className="font-semibold text-accent-teal-700 hover:underline">
            Back to the Site Contract
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/sites/${siteId}/contracts/${contractId}`} className="hover:text-accent-teal-700 hover:underline">
          {contract.workCategory}
        </Link>{" "}
        / Log Work
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Log Work</h1>
      <WorkEntryForm mode="new" siteId={siteId} contractId={contractId} quantityUnitLabel={quantityUnitLabel(contract)} />
    </div>
  );
}
