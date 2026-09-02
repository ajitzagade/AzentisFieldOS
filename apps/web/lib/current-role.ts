import { cache } from "react";
import { authedFetch } from "@/lib/api";
import type { Role } from "@azentisfieldos/shared";

// The real, Postgres-backed role from GET /users/me (resolved by apps/api's
// auth guard — Story 14.2). Shared by the route-group layout (which picks the
// shell) and the landing page (which picks Supervisor Home vs Owner Dashboard),
// so the two can never disagree about who is signed in — React cache()
// dedupes the fetch per request, making that a guarantee rather than a hope.
export const currentRole = cache(async (): Promise<Role> => {
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
});
