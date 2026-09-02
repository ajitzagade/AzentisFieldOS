import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContract } from "../../../page";
import { WorkEntryForm } from "../../work-entry-form";
import { quantityUnitLabel } from "../../../quantity-unit-label";

interface WorkEntryRecord {
  id: string;
  siteContractId: string;
  // Prisma Decimal — serialized as a string over JSON.
  quantity: string;
  workDate: string;
  note: string | null;
}

async function getWorkEntries(siteContractId: string): Promise<WorkEntryRecord[]> {
  const res = await authedFetch(`/subcontractor-work-entries?siteContractId=${siteContractId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Work Entries (${res.status})`);
  }
  return res.json();
}

export default async function CorrectWorkEntryPage({
  params,
}: {
  params: Promise<{ id: string; contractId: string; entryId: string }>;
}) {
  const { id: siteId, contractId, entryId } = await params;
  const contract = await getSiteContract(contractId);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  // Same rule as log-work/page.tsx, and applies to a correction too — see
  // WorkEntriesService.create()'s comment: it targets the same
  // (still-current) contract, so the Active/non-Fixed-Cost check applies
  // to corrections exactly like fresh entries.
  if (contract.status !== "ACTIVE" || contract.rateType === "FIXED_COST" || !contract.rateType) {
    return (
      <div className="max-w-160">
        <h1 className="mb-4 text-page-title text-ink-900">Correct Work Entry</h1>
        <p className="text-body-sm text-ink-700">
          {contract.rateType === "FIXED_COST"
            ? "Fixed Cost contracts don't track billable quantity — this contract's completion is tracked by its status (Draft → Active → Completed) instead."
            : "Work Entries can only be corrected against an Active contract."}{" "}
          <Link href={`/sites/${siteId}/contracts/${contractId}`} className="font-semibold text-accent-teal-700 hover:underline">
            Back to the Site Contract
          </Link>
          .
        </p>
      </div>
    );
  }

  const entries = await getWorkEntries(contractId);
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) {
    notFound();
  }

  const quantity = Number(entry.quantity);
  if (Number.isNaN(quantity)) {
    throw new Error(`Work Entry ${entry.id} has a non-numeric quantity`);
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/sites/${siteId}/contracts/${contractId}`} className="hover:text-accent-teal-700 hover:underline">
          {contract.workCategory}
        </Link>{" "}
        / Correct Work Entry
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Work Entry</h1>
      <WorkEntryForm
        mode="correct"
        siteId={siteId}
        contractId={contractId}
        correctsId={entry.id}
        quantityUnitLabel={quantityUnitLabel(contract)}
        initial={{
          quantity,
          workDate: (entry.workDate ?? "").slice(0, 10),
          note: entry.note ?? undefined,
        }}
      />
    </div>
  );
}
