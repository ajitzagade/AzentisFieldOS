import type { Metadata } from "next";
import type { ReactNode } from "react";
import { currentRole } from "@/lib/current-role";
import { currentTenantName } from "@/lib/current-tenant-name";
import { AppShell } from "./_components/app-shell";

// The browser tab title for every authenticated page, live from the same
// BrandingConfig row the sidebar reads below — overrides the root layout's
// static APP_DISPLAY_NAME title once a session exists.
export async function generateMetadata(): Promise<Metadata> {
  return { title: await currentTenantName() };
}

// Wraps every sidebar-navigable route (everything except /sign-in, which
// stays outside this route group with its own full-viewport shell).
//
// Story 14.2 closes the long-standing AGENTS.md TODO: the real, Postgres-backed
// role now comes from GET /users/me (resolved by apps/api's auth guard),
// not a hardcoded literal. The role drives which nav set the shell renders
// (Supervisor's task-first trim vs the Owner's full rail) — see nav-config.ts.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const [role, tenantName] = await Promise.all([currentRole(), currentTenantName()]);
  return (
    <AppShell role={role} tenantName={tenantName}>
      {children}
    </AppShell>
  );
}
