import type { ReactNode } from "react";
import { AppShell } from "./_components/app-shell";

// Wraps every sidebar-navigable route (everything except /sign-in, which
// stays outside this route group with its own full-viewport shell).
//
// `role` is hardcoded pending a real Postgres-backed current-user/role
// fetch — see the AGENTS.md TODO this story adds and app-shell.tsx's own
// module comment for the full reasoning.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell role="OWNER_ADMIN">{children}</AppShell>;
}
