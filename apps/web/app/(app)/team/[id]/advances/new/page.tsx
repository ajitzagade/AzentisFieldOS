import Link from "next/link";
import { notFound } from "next/navigation";
import { AdvanceForm } from "../advance-form";

interface TeamMemberOption {
  id: string;
  name: string;
}

async function getTeamMember(id: string): Promise<TeamMemberOption | null> {
  const res = await fetch(`${process.env.API_URL}/team-members/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Team Member (${res.status})`);
  }
  return res.json();
}

export default async function NewAdvancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
        / Record Advance
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Record an Advance</h1>
      <AdvanceForm mode="new" teamMemberId={teamMember.id} />
    </div>
  );
}
