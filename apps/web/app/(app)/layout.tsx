import type { ReactNode } from "react";
import { currentRole } from "@/lib/current-role";
import { AppShell } from "./_components/app-shell";

// Wraps every sidebar-navigable route (everything except /sign-in, which
// stays outside this route group with its own full-viewport shell).
//
// Story 14.2 closes the long-standing AGENTS.md TODO: the real, Postgres-backed
// role now comes from GET /users/me (resolved by apps/api's auth guard),
// not a hardcoded literal. The role drives which nav set the shell renders
// (Supervisor's task-first trim vs the Owner's full rail) — see nav-config.ts.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = await currentRole();
  return <AppShell role={role}>{children}</AppShell>;
}
