import { notFound } from "next/navigation";
import { EditTeamMemberForm } from "./edit-team-member-form";

export interface TeamMemberDetail {
  id: string;
  name: string;
  designation: string | null;
  contact: string | null;
  isActive: boolean;
  employmentType: { id: string; name: string };
  outstandingAdvanceBalance: string;
}

interface EmploymentTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getTeamMember(id: string): Promise<TeamMemberDetail | null> {
  const res = await fetch(`${process.env.API_URL}/team-members/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Team Member (${res.status})`);
  }
  return res.json();
}

async function getEmploymentTypes(): Promise<EmploymentTypeOption[]> {
  const res = await fetch(`${process.env.API_URL}/employment-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Employment Types (${res.status})`);
  }
  return res.json();
}

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [teamMember, employmentTypes] = await Promise.all([getTeamMember(id), getEmploymentTypes()]);

  if (!teamMember) {
    notFound();
  }

  // The Team Member's own current Employment Type must remain selectable
  // even if it's since been disabled (same rule Epic 4 applied to a
  // Material's current Category).
  const employmentTypeOptions = employmentTypes.filter((e) => e.isActive || e.id === teamMember.employmentType.id);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Team Member</h1>
      <EditTeamMemberForm teamMember={teamMember} employmentTypes={employmentTypeOptions} />
    </div>
  );
}
