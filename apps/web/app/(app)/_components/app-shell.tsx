"use client";

import { Suspense, type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, LogoutIcon, MenuIcon, Toaster, ToastProvider, XIcon } from "@azentisfieldos/ui";
import type { Role } from "@azentisfieldos/shared";
import { NAV_GROUPS, SETTINGS_NAV_ITEM, UNGROUPED_NAV_ITEMS, type NavItem } from "./nav-config";
import { FlashToast } from "./flash-toast";
import { APP_DISPLAY_NAME } from "../../../lib/tenant";

// Every role gets the same sidebar-driven shell (product direction 2026-08-27,
// superseding EXPERIENCE.md's original Owner/Admin-sidebar vs Supervisor-top-bar
// split): the left nav rail on the left, the selected item's content on the
// right, for all accounts. The one role difference kept here is the `Settings`
// item — Owner/Admin only, since that surface hard-404s for a Site Supervisor
// (Story 14.2's server-side guard), so surfacing it to them would be a broken
// link, not access.
//
// The *layout* is viewport-responsive: the navy rail shows from `lg` up, and
// below that it collapses behind a hamburger into an accessible slide-in drawer.
// Content padding tightens on small screens so the main column is never starved.
//
// `role` is an explicit prop resolved by the route-group layout from the real
// Postgres-backed GET /users/me (Story 14.2, via apps/api's auth guard),
// never a viewport breakpoint (AD-3/AD-11).
export interface AppShellProps {
  role: Role;
  children: ReactNode;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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

// The nav's inner content (brand mark + grouped links), shared byte-for-byte
// between the desktop rail and the mobile drawer so there is one nav source.
function SidebarNav({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: Role;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent-teal-700 text-body-sm font-bold text-white">
          {APP_DISPLAY_NAME[0]}
        </div>
        <div className="text-card-title font-semibold tracking-tight">{APP_DISPLAY_NAME}</div>
      </div>

      {UNGROUPED_NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="px-2 pt-4 pb-1 text-eyebrow text-ink-on-accent/50 uppercase">{group.label}</div>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
          ))}
        </div>
      ))}

      {/* Settings is Owner/Admin-only — it hard-404s for a Site Supervisor
          (Story 14.2's server guard), so a link would be broken, not access. */}
      {role === "OWNER_ADMIN" ? (
        <NavLink item={SETTINGS_NAV_ITEM} active={isActive(pathname, SETTINGS_NAV_ITEM.href)} onNavigate={onNavigate} />
      ) : null}

      {/* Plain POST form, not a client-side handler — works even before any
          client JS has hydrated, and mirrors /api/auth/logout's own plain
          Route Handler (clears the session cookie, redirects to /sign-in). */}
      <form action="/api/auth/logout" method="post" className="mt-auto pt-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-body-sm font-medium text-ink-on-accent/80 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-white/10 hover:text-ink-on-accent"
        >
          <LogoutIcon className="size-4 shrink-0" />
          Sign out
        </button>
      </form>
    </>
  );
}

function SidebarShell({ pathname, role, children }: { pathname: string; role: Role; children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drawer whenever the route changes (a nav link was followed, or
  // the user hit back/forward). This is the React-endorsed "adjust state while
  // rendering on a prop change" pattern — cheaper and more correct than a
  // route-watching effect (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setNavOpen(false);
  }

  // Escape closes the open drawer; move focus into it on open so keyboard
  // users are not stranded behind the overlay.
  useEffect(() => {
    if (!navOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* Desktop rail — shown from lg up. The shell pins it to the viewport
          (lg:h-screen + lg:overflow-hidden on the root) and each pane scrolls
          on its own: the rail keeps its full nav reachable however long the
          page content is, and the content scrolls without carrying the rail
          off-screen. */}
      <aside className="hidden w-62 shrink-0 flex-col gap-1 overflow-y-auto bg-accent-navy-800 px-4 py-6 text-ink-on-accent lg:flex">
        <SidebarNav pathname={pathname} role={role} />
      </aside>

      {/* Mobile top bar — below lg only. */}
      <header className="flex items-center gap-3 border-b border-border-hairline bg-surface-1 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={navOpen}
          aria-controls="app-mobile-nav"
          className="flex size-9 items-center justify-center rounded-md text-ink-700 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none"
        >
          <MenuIcon className="size-5" />
        </button>
        <span className="text-card-title font-semibold text-ink-900">{APP_DISPLAY_NAME}</span>
      </header>

      {/* Mobile drawer + scrim — below lg only, mounted while open. */}
      {navOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-40 bg-ink-900/50"
          />
          <aside
            id="app-mobile-nav"
            className="fixed inset-y-0 left-0 z-50 flex w-62 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-accent-navy-800 px-4 py-6 text-ink-on-accent shadow-3"
          >
            <div className="mb-2 flex justify-end">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation menu"
                className="flex size-9 items-center justify-center rounded-md text-ink-on-accent/80 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-white/10 hover:text-ink-on-accent focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} role={role} onNavigate={() => setNavOpen(false)} />
          </aside>
        </div>
      ) : null}

      <main className="flex-1 px-4 py-6 lg:overflow-y-auto lg:px-10 lg:py-8">
        <div className="max-w-310">{children}</div>
      </main>
    </div>
  );
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();

  // Sidebar shell for every role (product direction) — the `role` only decides
  // whether the Settings item is shown (Owner/Admin), not whether there's a rail.
  // The toast system mounts once here so every page (and every Server
  // Action redirect carrying ?flash=) reports success through one channel.
  return (
    <ToastProvider>
      <SidebarShell pathname={pathname} role={role}>
        {children}
      </SidebarShell>
      <Toaster />
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </ToastProvider>
  );
}
