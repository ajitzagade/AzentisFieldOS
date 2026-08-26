"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@azentisfieldos/ui";
import type { Role } from "@azentisfieldos/shared";
import { NAV_GROUPS, SETTINGS_NAV_ITEM, UNGROUPED_NAV_ITEMS, type NavItem } from "./nav-config";
import { APP_DISPLAY_NAME } from "../../../lib/tenant";

// The desktop sidebar shell vs. the Site Supervisor's minimal mobile top
// bar is a role distinction (EXPERIENCE.md), never a viewport breakpoint —
// an Owner/Admin on a phone still gets the full sidebar-driven experience
// in a responsive fallback, so branching on screen width alone would be
// wrong the moment an Owner/Admin opens the app on a phone.
//
// `role` is an explicit prop resolved by the route-group layout from the real
// Postgres-backed GET /users/me (Story 14.2, via apps/api's Clerk auth guard) —
// the sidebar-vs-minimal-top-bar split is driven by this real value, never a
// viewport breakpoint (AD-3/AD-11).
export interface AppShellProps {
  role: Role;
  children: ReactNode;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-body-sm font-medium transition-colors duration-(--default-transition-duration) ease-(--ease-standard)",
        active ? "bg-accent-teal-700 text-white" : "text-ink-on-accent/80 hover:bg-white/10 hover:text-ink-on-accent",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex min-h-screen w-62 shrink-0 flex-col gap-1 bg-accent-navy-800 px-4 py-6 text-ink-on-accent">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent-teal-700 text-body-sm font-bold text-white">
          {APP_DISPLAY_NAME[0]}
        </div>
        <div className="text-card-title font-semibold tracking-tight">{APP_DISPLAY_NAME}</div>
      </div>

      {UNGROUPED_NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="px-2 pt-4 pb-1 text-eyebrow text-ink-on-accent/50 uppercase">{group.label}</div>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>
      ))}

      <NavLink item={SETTINGS_NAV_ITEM} active={isActive(pathname, SETTINGS_NAV_ITEM.href)} />
    </aside>
  );
}

function MinimalTopBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border-hairline bg-surface-1 px-4 py-3">
        <span className="text-card-title font-semibold text-ink-900">{APP_DISPLAY_NAME}</span>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();

  if (role === "SITE_SUPERVISOR") {
    return <MinimalTopBar>{children}</MinimalTopBar>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar pathname={pathname} />
      <main className="max-w-310 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
