import { NewTeamMemberForm } from "./new-team-member-form";

interface EmploymentTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getEmploymentTypes(): Promise<EmploymentTypeOption[]> {
  const res = await fetch(`${process.env.API_URL}/employment-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Employment Types (${res.status})`);
  }
  return res.json();
}

export default async function NewTeamMemberPage() {
  const employmentTypes = await getEmploymentTypes();
  const activeEmploymentTypes = employmentTypes.filter((e) => e.isActive);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Team Member</h1>
      <NewTeamMemberForm employmentTypes={activeEmploymentTypes} />
    </div>
  );
}
