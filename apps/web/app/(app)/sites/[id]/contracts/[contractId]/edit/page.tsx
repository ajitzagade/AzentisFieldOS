import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { SiteContractForm, type SubcontractorOption } from "../../site-contract-form";
import { getSiteContract } from "../page";
import { updateSiteContractAction } from "./actions";

async function getSubcontractors(): Promise<SubcontractorOption[]> {
  const res = await authedFetch(`/subcontractors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractors (${res.status})`);
  }
  return res.json();
}

function toDateInputValue(iso: string | null): string | null {
  return iso ? iso.slice(0, 10) : null;
}

export default async function EditSiteContractPage({
  params,
}: {
  params: Promise<{ id: string; contractId: string }>;
}) {
  const { id: siteId, contractId } = await params;
  const [contract, subcontractors] = await Promise.all([getSiteContract(contractId), getSubcontractors()]);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  const action = updateSiteContractAction.bind(null, siteId, contractId);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Site Contract</h1>
      <SiteContractForm
        mode="edit"
        siteId={siteId}
        subcontractors={subcontractors}
        initial={{
          id: contract.id,
          subcontractorId: contract.subcontractorId,
          workCategory: contract.workCategory,
          description: contract.description,
          rateType: contract.rateType,
          rateUnitLabel: contract.rateUnitLabel,
          rate: contract.rate,
          fixedAmount: contract.fixedAmount,
          estimatedQuantity: contract.estimatedQuantity,
          status: contract.status,
          startDate: toDateInputValue(contract.startDate),
          endDate: toDateInputValue(contract.endDate),
        }}
        action={action}
      />
    </div>
  );
}
