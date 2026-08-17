import Link from "next/link";
import { notFound } from "next/navigation";
import { AdjustmentForm } from "../adjustment-form";

interface TeamMemberOption {
  id: string;
  name: string;
  outstandingAdvanceBalance: string;
}

async function getTeamMember(id: string): Promise<TeamMemberOption | null> {
  const res = await fetch(`${process.env.API_URL}/team-members/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Team Member (${res.status})`);
  }
  return res.json();
}

export default async function NewAdjustmentPage({ params }: { params: Promise<{ id: string; advanceId: string }> }) {
  const { id, advanceId } = await params;
  const teamMember = await getTeamMember(id);

  if (!teamMember) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/team/${teamMember.id}`} className="hover:text-accent-teal-700 hover:underline">
          {teamMember.name}
        </Link>{" "}
        / Record Adjustment
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Record an Advance Adjustment</h1>
      <AdjustmentForm
        mode="new"
        teamMemberId={teamMember.id}
        advanceId={advanceId}
        outstandingBalance={teamMember.outstandingAdvanceBalance}
      />
    </div>
  );
}
