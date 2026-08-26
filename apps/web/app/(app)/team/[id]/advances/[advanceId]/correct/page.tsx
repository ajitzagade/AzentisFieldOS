import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdvanceForm, type AdvanceFormInitialValues } from "../../advance-form";

interface AdvanceForCorrection {
  id: string;
  amount: string;
  reason: string | null;
  paymentMethod: string | null;
  givenAt: string;
  teamMember: { id: string; name: string };
}

async function getAdvance(id: string): Promise<AdvanceForCorrection | null> {
  const res = await authedFetch(`/advances/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Advance (${res.status})`);
  }
  return res.json();
}

// AC #2: pre-fills from the Advance being corrected, submits to the same
// POST /advances as a plain create — correctsId (set here) tells the API
// this is a correction, same pattern as Story 5.1's Purchase/Story 5.5's
// Consumption.
export default async function CorrectAdvancePage({ params }: { params: Promise<{ id: string; advanceId: string }> }) {
  const { id, advanceId } = await params;
  const advance = await getAdvance(advanceId);

  if (!advance || advance.teamMember.id !== id) {
    notFound();
  }

  const initial: AdvanceFormInitialValues = {
    reason: advance.reason ?? undefined,
    paymentMethod: advance.paymentMethod ?? undefined,
    givenAt: advance.givenAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/team/${id}`} className="hover:text-accent-teal-700 hover:underline">
          {advance.teamMember.name}
        </Link>{" "}
        / Correct Advance
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Advance</h1>
      <AdvanceForm mode="correct" teamMemberId={id} correctsId={advance.id} initial={initial} />
    </div>
  );
}
