import { BuildingIcon, Card, GearIcon, LayersIcon, UsersIcon } from "@azentisfieldos/ui";
import { APP_DISPLAY_NAME } from "../../../lib/tenant";

interface TeamMemberRow {
  id: string;
  name: string;
  designation: string | null;
  employmentType: { name: string };
  isActive: boolean;
}
interface EmploymentType {
  id: string;
  name: string;
}
interface MachineryType {
  id: string;
  name: string;
}
interface VehicleType {
  id: string;
  name: string;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json();
}

export default async function SettingsPage() {
  const [teamMembers, employmentTypes, machineryTypes, vehicleTypes] = await Promise.all([
    getJSON<TeamMemberRow[]>("/team-members"),
    getJSON<EmploymentType[]>("/employment-types"),
    getJSON<MachineryType[]>("/machinery-types"),
    getJSON<VehicleType[]>("/vehicle-types"),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Settings</h1>
        <p className="text-body-sm text-ink-500">Deployment branding, users, and configurable category lists.</p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <BuildingIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Branding</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-md bg-accent-teal-700 text-xl font-bold text-white">
              {APP_DISPLAY_NAME[0]}
            </div>
            <div>
              <div className="text-body font-semibold text-ink-900">{APP_DISPLAY_NAME}</div>
              <div className="text-caption text-ink-500">Single-tenant deployment — this is the only organisation on this instance.</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-accent-teal-700" />
              <h2 className="text-card-title text-ink-900">Users &amp; Roles</h2>
            </div>
            <span className="text-caption text-ink-500">{teamMembers.length} people</span>
          </div>
          <div className="flex flex-col gap-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between border-b border-border-hairline py-2 last:border-b-0">
                <div>
                  <span className="text-body-sm font-medium text-ink-900">{member.name}</span>
                  {member.designation ? (
                    <span className="ml-2 text-caption text-ink-500">{member.designation}</span>
                  ) : null}
                </div>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption font-semibold text-ink-700">
                  {member.employmentType.name}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-caption text-ink-500">
            Every write is currently attributed to a placeholder system user — per-person, permission-scoped roles are
            planned separately from Team &amp; Labour&apos;s own records shown above.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <LayersIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Category Configuration</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <div className="mb-2 text-eyebrow uppercase text-ink-500">Employment Types</div>
              <div className="flex flex-wrap gap-1.5">
                {employmentTypes.map((t) => (
                  <span key={t.id} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption text-ink-700">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-eyebrow uppercase text-ink-500">Machinery Types</div>
              <div className="flex flex-wrap gap-1.5">
                {machineryTypes.map((t) => (
                  <span key={t.id} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption text-ink-700">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-eyebrow uppercase text-ink-500">Vehicle Types</div>
              <div className="flex flex-wrap gap-1.5">
                {vehicleTypes.map((t) => (
                  <span key={t.id} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption text-ink-700">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-caption text-ink-500">
        <GearIcon className="size-3.5 shrink-0" />
        This is a read-only overview. Editing branding, inviting users, and managing categories from here ships with
        Tenant Configuration &amp; Settings.
      </p>
    </>
  );
}
