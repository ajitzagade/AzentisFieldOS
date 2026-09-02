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
  const [contract, entries] = await Promise.all([getSiteContract(contractId), getWorkEntries(contractId)]);

  if (!contract || contract.siteId !== siteId) {
    notFound();
  }

  const entry = entries.find((e) => e.id === entryId);
  if (!entry) {
    notFound();
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
          quantity: Number(entry.quantity),
          workDate: entry.workDate.slice(0, 10),
          note: entry.note ?? undefined,
        }}
      />
    </div>
  );
}
