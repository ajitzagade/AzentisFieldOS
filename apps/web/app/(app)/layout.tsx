import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { currentRole } from "@/lib/current-role";
import { currentTenantName } from "@/lib/current-tenant-name";
import { AppShell } from "./_components/app-shell";
import AppLoading from "./loading";

// The browser tab title for every authenticated page, live from the same
// BrandingConfig row the sidebar reads below — overrides the root layout's
// static APP_DISPLAY_NAME title once a session exists. Next generates
// metadata independently of the body stream below, so this doesn't block it.
export async function generateMetadata(): Promise<Metadata> {
  return { title: await currentTenantName() };
}

// Perf review 2026-09-03: role/tenantName are `no-store` (deliberately —
// see Suspense boundary below, not caching, is the fix here), so this re-runs
// on every navigation. Split into its own async component, wrapped in
// <Suspense> below, so the server can start STREAMING (app)/loading.tsx's
// skeleton to the browser immediately while these two fetches resolve in
// the background — before this fix, AppLayout's own top-level `await`
// blocked the entire RSC response (nothing streamed, not even the loading
// skeleton) until both round-trips finished, which is exactly why every
// tab open felt frozen rather than "loading."
export async function AppShellWithChrome({ children }: { children: ReactNode }) {
  const [role, tenantName] = await Promise.all([currentRole(), currentTenantName()]);
  return (
    <AppShell role={role} tenantName={tenantName}>
      {children}
    </AppShell>
  );
}

// Wraps every sidebar-navigable route (everything except /sign-in, which
// stays outside this route group with its own full-viewport shell).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppShellWithChrome>{children}</AppShellWithChrome>
    </Suspense>
  );
}
