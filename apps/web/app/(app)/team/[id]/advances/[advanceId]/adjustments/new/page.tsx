import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { HelpBubble } from "@azentisfieldos/ui";
import { AdjustmentForm } from "../adjustment-form";

// An Adjustment reduces the Outstanding Balance — the shared
// outstanding-balance explanation is the concept a first-time user needs
// here (one shared content source, same as Help & Guides).
const OUTSTANDING_BALANCE_HELP = HELP_CONTENT.contextualHelp.find((h) => h.key === "outstanding-balance");

interface TeamMemberOption {
  id: string;
  name: string;
  outstandingAdvanceBalance: string;
}

async function getTeamMember(id: string): Promise<TeamMemberOption | null> {
  const res = await authedFetch(`/team-members/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Team Member (${res.status})`);
  }
  return res.json();
}

export default async function NewAdjustmentPage({ params }: { params: Promise<{ id: string; advanceId: string }> }) {
  const { id, advanceId } = await params;
  const [role, teamMember] = await Promise.all([currentRole(), getTeamMember(id)]);

  if (role !== "OWNER_ADMIN" || !teamMember) {
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
      <h1 className="mb-6 flex items-center gap-2 text-page-title text-ink-900">
        Record an Advance Adjustment
        {OUTSTANDING_BALANCE_HELP ? <HelpBubble>{OUTSTANDING_BALANCE_HELP.explanation}</HelpBubble> : null}
      </h1>
      <AdjustmentForm
        mode="new"
        teamMemberId={teamMember.id}
        advanceId={advanceId}
        outstandingBalance={teamMember.outstandingAdvanceBalance}
      />
    </div>
  );
}
