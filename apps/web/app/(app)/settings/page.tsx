import Link from "next/link";
import { notFound } from "next/navigation";
import { authedFetch } from "@/lib/api";
import type { Role } from "@azentisfieldos/shared";
import {
  BellIcon,
  BuildingIcon,
  Card,
  ClipboardIcon,
  GearIcon,
  LayersIcon,
  UsersIcon,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";
import { BrandingForm, type BrandingConfig } from "./branding-form";
import { UsersRolesSection, type UserRow } from "./users-roles-section";
import {
  NotificationChannelsSection,
  type ChannelSetting,
} from "./notification-channels-section";

interface NamedType {
  id: string;
  name: string;
  isActive: boolean;
}
interface LowStockThreshold {
  id: string;
  name: string;
  lowStockThreshold: string;
  unit: string;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await authedFetch(`${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json();
}

export default async function SettingsPage() {
  // Story 14.2 (AC #4): Settings is an Owner/Admin-only surface. AppShell
  // already hides it from a Site Supervisor's minimal nav, but a directly-typed
  // /settings URL must not render a broken page — a Supervisor hits 404 here.
  // (The apps/api Users-admin endpoints enforce the same 403 server-side, so
  // this is defence-in-depth, not the only gate.)
  const me = await getJSON<{ role: Role }>("/users/me");
  if (me.role !== "OWNER_ADMIN") notFound();

  const [
    branding,
    users,
    employmentTypes,
    machineryTypes,
    vehicleTypes,
    expenseCategories,
    materialCategories,
    units,
    thresholds,
    notificationSettings,
  ] = await Promise.all([
    getJSON<BrandingConfig>("/branding-config"),
    getJSON<UserRow[]>("/users"),
    getJSON<NamedType[]>("/employment-types"),
    getJSON<NamedType[]>("/machinery-types"),
    getJSON<NamedType[]>("/vehicle-types"),
    getJSON<NamedType[]>("/expense-categories"),
    getJSON<NamedType[]>("/material-categories"),
    getJSON<NamedType[]>("/units"),
    getJSON<LowStockThreshold[]>("/materials/thresholds"),
    getJSON<ChannelSetting[]>("/notification-settings"),
  ]);

  // Story 14.3 (FR-49): each category family is a compact card linking out to
  // its own dedicated admin route (extended with rename/disable in this story),
  // rather than an inline editor duplicated here — the Settings page is the
  // discoverability hub (AC #3). Material Categories & Low-stock Thresholds
  // already have full admin surfaces elsewhere, so their cards are pure links.
  const categoryFamilies: { label: string; href: string; types: NamedType[] }[] = [
    { label: "Employment Types", href: "/team/employment-types", types: employmentTypes },
    { label: "Machinery Types", href: "/machinery-vehicles/machinery-types", types: machineryTypes },
    { label: "Vehicle Types", href: "/machinery-vehicles/vehicle-types", types: vehicleTypes },
    { label: "Expense Categories", href: "/expenses/categories", types: expenseCategories },
    { label: "Material Categories", href: "/materials/categories", types: materialCategories },
    { label: "Units", href: "/materials/units", types: units },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Settings</h1>
          <p className="text-body-sm text-ink-500">Deployment branding, users, and configurable category lists.</p>
        </div>
        <Link href="/settings/audit-log" className={cn(buttonVariants({ variant: "secondary" }))}>
          <ClipboardIcon className="size-4" />
          Audit Log
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* Story 14.1 owns the Branding section. Stories 14.2/14.3 add their
            own sections (Users & Roles, Categories) to this same page — each
            section is a self-contained <Card>, so they slot in without
            touching this one. */}
        <Card>
          <div className="mb-1 flex items-center gap-2">
            <BuildingIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Branding</h2>
          </div>
          <p className="mb-6 text-body-sm text-ink-500">
            How your organisation appears on every generated report — this is fully yours to
            configure, and changes reflect in the next report with no publish step.
          </p>
          <BrandingForm config={branding} />
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-2">
            <UsersIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Users &amp; Roles</h2>
          </div>
          <p className="mb-6 text-body-sm text-ink-500">
            Everyone with access to this deployment. Invite a teammate as an Owner/Admin or Site
            Supervisor — the two roles this platform has (AD-11) — and change an active user&apos;s role
            at any time.
          </p>
          <UsersRolesSection users={users} />
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-2">
            <BellIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Notification Channels</h2>
          </div>
          <p className="mb-6 text-body-sm text-ink-500">
            Choose which channels deliver the automated daily report, and who receives it — the next
            report delivers to exactly what you configure here, with no manual forwarding.
          </p>
          <NotificationChannelsSection settings={notificationSettings} users={users} />
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-2">
            <LayersIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Categories &amp; Config</h2>
          </div>
          <p className="mb-6 text-body-sm text-ink-500">
            Every category set is fully yours to configure — add, rename, or disable entries and the
            change reflects immediately in the relevant entry forms. Nothing here is hardcoded.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryFamilies.map((family) => {
              const active = family.types.filter((t) => t.isActive);
              const disabledCount = family.types.length - active.length;
              return (
                <div
                  key={family.href}
                  className="flex flex-col gap-3 rounded-lg border border-border-hairline bg-surface-1 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-eyebrow uppercase text-ink-500">{family.label}</span>
                    <Link
                      href={family.href}
                      className="text-caption text-accent-teal-700 underline hover:no-underline"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.length === 0 ? (
                      <span className="text-caption text-ink-500">None configured yet.</span>
                    ) : (
                      active.map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption text-ink-700"
                        >
                          {t.name}
                        </span>
                      ))
                    )}
                  </div>
                  {disabledCount > 0 ? (
                    <span className="text-eyebrow text-ink-500">
                      {disabledCount} disabled
                    </span>
                  ) : null}
                </div>
              );
            })}

            {/* Low-stock Thresholds — read/discovery-only (AC #3): each Material's
                threshold is edited on the Material's own page, not bulk-edited here. */}
            <div className="flex flex-col gap-3 rounded-lg border border-border-hairline bg-surface-1 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-eyebrow uppercase text-ink-500">Low-stock Thresholds</span>
                <Link
                  href="/materials"
                  className="text-caption text-accent-teal-700 underline hover:no-underline"
                >
                  Edit
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {thresholds.length === 0 ? (
                  <span className="text-caption text-ink-500">No thresholds set yet.</span>
                ) : (
                  thresholds.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption text-ink-700"
                    >
                      {t.name} — {t.lowStockThreshold} {t.unit}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-caption text-ink-500">
        <GearIcon className="size-3.5 shrink-0" />
        Branding, users, and every category set above are fully admin-configurable — changes take
        effect immediately, with no publish step.
      </p>
    </>
  );
}
