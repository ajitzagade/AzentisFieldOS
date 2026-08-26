import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdjustmentForm, type AdjustmentFormInitialValues } from "../../adjustment-form";

interface AdjustmentForCorrection {
  id: string;
  note: string | null;
  adjustedAt: string;
  advance: {
    id: string;
    teamMember: { id: string; name: string; outstandingAdvanceBalance: string };
  };
}

async function getAdjustment(id: string): Promise<AdjustmentForCorrection | null> {
  const res = await authedFetch(`/advance-adjustments/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Advance Adjustment (${res.status})`);
  }
  return res.json();
}

// AC #4: pre-fills from the Adjustment being corrected, submits to the
// same POST /advance-adjustments as a plain create — correctsId (set
// here) tells the API this is a correction, same pattern as Story 7.1's
// Advance.
export default async function CorrectAdjustmentPage({
  params,
}: {
  params: Promise<{ id: string; advanceId: string; adjustmentId: string }>;
}) {
  const { id, advanceId, adjustmentId } = await params;
  const adjustment = await getAdjustment(adjustmentId);

  if (!adjustment || adjustment.advance.teamMember.id !== id || adjustment.advance.id !== advanceId) {
    notFound();
  }

  const initial: AdjustmentFormInitialValues = {
    note: adjustment.note ?? undefined,
    adjustedAt: adjustment.adjustedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/team/${id}`} className="hover:text-accent-teal-700 hover:underline">
          {adjustment.advance.teamMember.name}
        </Link>{" "}
        / Correct Adjustment
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Advance Adjustment</h1>
      <AdjustmentForm
        mode="correct"
        teamMemberId={id}
        advanceId={advanceId}
        correctsId={adjustment.id}
        outstandingBalance={adjustment.advance.teamMember.outstandingAdvanceBalance}
        initial={initial}
      />
    </div>
  );
}
