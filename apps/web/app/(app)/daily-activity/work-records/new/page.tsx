import { WorkRecordForm } from "./work-record-form";

interface SiteOption {
  id: string;
  name: string;
}

interface TeamMemberOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getSites(): Promise<SiteOption[]> {
  const res = await fetch(`${process.env.API_URL}/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getTeamMembers(): Promise<TeamMemberOption[]> {
  const res = await fetch(`${process.env.API_URL}/team-members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Members (${res.status})`);
  }
  return res.json();
}

export default async function NewWorkRecordPage() {
  const [sites, teamMembers] = await Promise.all([getSites(), getTeamMembers()]);
  const activeTeamMembers = teamMembers.filter((t) => t.isActive);

  return (
    <div className="max-w-160">
      <h1 className="mb-1 text-page-title text-ink-900">Record Attendance</h1>
      <p className="mb-6 text-body-sm text-ink-500">Check who was present at this Site today — defaulted from the last day worked.</p>
      <WorkRecordForm sites={sites} teamMembers={activeTeamMembers} />
    </div>
  );
}
