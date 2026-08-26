import type { ReactNode } from "react";
import { authedFetch } from "@/lib/api";
import type { Role } from "@azentisfieldos/shared";
import { AppShell } from "./_components/app-shell";

// Wraps every sidebar-navigable route (everything except /sign-in, which
// stays outside this route group with its own full-viewport shell).
//
// Story 14.2 closes the long-standing AGENTS.md TODO: the real, Postgres-backed
// role now comes from GET /users/me (resolved by apps/api's Clerk auth guard),
// not a hardcoded literal. The sidebar-vs-minimal-top-bar split is a role
// distinction (EXPERIENCE.md), driven by this real value.
async function currentRole(): Promise<Role> {
  try {
    const res = await authedFetch("/users/me", { cache: "no-store" });
    if (res.ok) {
      const me = (await res.json()) as { role: Role };
      return me.role;
    }
  } catch {
    // fall through to the least-privilege default below
  }
  // If the identity lookup fails transiently, default to the least-privileged
  // role — never over-grant the Owner/Admin surface on an unverified identity.
  return "SITE_SUPERVISOR";
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = await currentRole();
  return <AppShell role={role}>{children}</AppShell>;
}
