"use client";

import { Suspense, type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  cn,
  ConfirmDialog,
  DownloadIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  QuickAddSheet,
  SearchIcon,
  Toaster,
  ToastProvider,
  XIcon,
} from "@azentisfieldos/ui";
import { SEARCH_ACTIONS, type Role } from "@azentisfieldos/shared";
import {
  HELP_NAV_ITEM,
  NAV_GROUPS,
  OWNER_QUICK_BAR_LINKS,
  SETTINGS_NAV_ITEM,
  SUPERVISOR_NAV_GROUPS,
  SUPERVISOR_QUICK_BAR_ITEMS,
  SUPERVISOR_UNGROUPED_NAV_ITEMS,
  UNGROUPED_NAV_ITEMS,
  type NavItem,
} from "./nav-config";
import { FlashToast } from "./flash-toast";
import {
  ACTION_ICONS,
  AdvanceQuickEntryPanel,
  GlobalSearchButton,
  GlobalSearchContext,
  GlobalSearchDialog,
  useGlobalSearchController,
} from "./global-search";
import { APP_DISPLAY_NAME } from "../../../lib/tenant";
import { usePwaInstall } from "../../../lib/use-pwa-install";
import { clearRememberedSite } from "./site-field";
import { clearRecentlyViewed } from "../../../lib/recently-viewed";

// Every role gets the same sidebar-driven shell (product direction 2026-08-27,
// superseding EXPERIENCE.md's original Owner/Admin-sidebar vs Supervisor-top-bar
// split): the left nav rail on the left, the selected item's content on the
// right, for all accounts. What differs by role is the nav *content*
// (simplicity review 2026-09-01): the Supervisor rail is a task-first trim
// (see SUPERVISOR_* in nav-config.ts) plus a fixed mobile bottom quick-bar;
// the Owner keeps the full rail. Settings stays Owner/Admin-only, since that
// surface hard-404s for a Site Supervisor (Story 14.2's server-side guard),
// so surfacing it to them would be a broken link, not access.
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
  pwaAvailable,
  onRequestInstall,
  onOpenSearch,
}: {
  pathname: string;
  role: Role;
  onNavigate?: () => void;
  pwaAvailable: boolean;
  onRequestInstall: () => void;
  onOpenSearch: () => void;
}) {
  // Task-first trim for the Supervisor (simplicity review 2026-09-01): six
  // daily surfaces instead of the Owner's full 14-item rail. Owner surfaces
  // stay reachable via the Supervisor Home's "More" list and direct URLs —
  // this is de-emphasis, not access control (server @Roles guards remain
  // the real boundary).
  const ungroupedItems = role === "SITE_SUPERVISOR" ? SUPERVISOR_UNGROUPED_NAV_ITEMS : UNGROUPED_NAV_ITEMS;
  const navGroups = role === "SITE_SUPERVISOR" ? SUPERVISOR_NAV_GROUPS : NAV_GROUPS;

  return (
    <>
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent-teal-700 text-body-sm font-bold text-white">
          {APP_DISPLAY_NAME[0]}
        </div>
        <div className="text-card-title font-semibold tracking-tight">{APP_DISPLAY_NAME}</div>
      </div>

      {/* Story 16.2: one search entry point, visible in the shell — the
          same rail that already hosts the install/download action below. */}
      <GlobalSearchButton
        onClick={onOpenSearch}
        className="mb-4 text-ink-on-accent/80 hover:bg-white/10 hover:text-ink-on-accent"
      />

      {ungroupedItems.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}

      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="px-2 pt-4 pb-1 text-eyebrow text-ink-on-accent/50 uppercase">{group.label}</div>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
          ))}
        </div>
      ))}

      {/* Help & Guides is visible to both roles (unlike Settings below) —
          this is the surface a Supervisor learns the app from unsupervised. */}
      <NavLink item={HELP_NAV_ITEM} active={isActive(pathname, HELP_NAV_ITEM.href)} onNavigate={onNavigate} />

      {/* Settings is Owner/Admin-only — it hard-404s for a Site Supervisor
          (Story 14.2's server guard), so a link would be broken, not access. */}
      {role === "OWNER_ADMIN" ? (
        <NavLink item={SETTINGS_NAV_ITEM} active={isActive(pathname, SETTINGS_NAV_ITEM.href)} onNavigate={onNavigate} />
      ) : null}

      {/* Story 1.9: a deliberate, user-initiated affordance instead of an
          unprompted floating banner — only rendered when the browser has
          actually signaled installability (Android's beforeinstallprompt,
          or iOS Safari not yet installed). Confirmed via a dialog rather
          than firing the native prompt (or navigating to instructions)
          straight from the click. */}
      {pwaAvailable ? (
        <button
          type="button"
          onClick={onRequestInstall}
          className="mt-auto flex w-full items-center gap-3 rounded-md px-3 py-2 text-body-sm font-medium text-ink-on-accent/80 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-white/10 hover:text-ink-on-accent"
        >
          <DownloadIcon className="size-4 shrink-0" />
          Download app
        </button>
      ) : null}

      {/* Plain POST form, not a client-side handler — works even before any
          client JS has hydrated, and mirrors /api/auth/logout's own plain
          Route Handler (clears the session cookie, redirects to /sign-in). */}
      {/* Sign-out also clears the device-remembered Site and the
          recently-viewed shortcuts list (Story 19.6) — on a shared phone
          the next user must not inherit the previous user's defaults or
          browsing history. */}
      <form
        action="/api/auth/logout"
        method="post"
        onSubmit={() => {
          clearRememberedSite();
          clearRecentlyViewed();
        }}
        className={pwaAvailable ? "pt-4" : "mt-auto pt-4"}
      >
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

// The Supervisor's persistent mobile bottom bar (simplicity review 2026-09-01):
// the one-tap layer the hamburger drawer can't provide. Four fixed items,
// thumb-reachable, visible on every screen below `lg`. Active state pairs
// color with weight + aria-current (never color alone — accessibility floor).
function SupervisorQuickBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-hairline bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex">
        {SUPERVISOR_QUICK_BAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-caption transition-colors duration-(--default-transition-duration) ease-(--ease-standard) focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none",
                active ? "font-semibold text-accent-teal-700" : "font-medium text-ink-500 hover:text-ink-700",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// The Owner's persistent mobile bottom bar (Story 19.4) — mirrors
// SupervisorQuickBar's shell (fixed inset-x-0 bottom-0, safe-area padding,
// isActive/aria-current active-state convention) but is entity-spanning
// rather than single-task: 2 of its 5 slots are plain links
// (OWNER_QUICK_BAR_LINKS: Dashboard, Sites), the other 3 are actions
// against state SidebarShell already owns — no new global-search
// controller instance, no new full-sidebar drawer (Design Notes: not worth
// generalizing NavItem for a five-slot, non-reused widget).
function OwnerQuickBar({
  pathname,
  onOpenSearch,
  onOpenNav,
}: {
  pathname: string;
  onOpenSearch: () => void;
  onOpenNav: () => void;
}) {
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);

  // Same curated list Story 19.2's Search/Action palette shows
  // (packages/shared's SEARCH_ACTIONS) — no second curated-actions list.
  const quickAddItems = SEARCH_ACTIONS.map((action) => ({
    id: action.id,
    title: action.title,
    description: action.description,
    icon: ACTION_ICONS[action.id],
  }));

  function handleQuickAddSelect(id: string) {
    const action = SEARCH_ACTIONS.find((item) => item.id === id);
    setQuickAddOpen(false);
    if (!action) return;
    if (action.href === null) {
      // Record Advance — opens 19.1's shared modal in place, no navigation.
      setAdvanceOpen(true);
    } else {
      router.push(action.href);
    }
  }

  const itemClassName =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-caption font-medium text-ink-500 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:text-ink-700 focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none";

  return (
    <>
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border-hairline bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="flex">
          {OWNER_QUICK_BAR_LINKS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(itemClassName, active && "font-semibold text-accent-teal-700 hover:text-accent-teal-700")}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}

          <button type="button" onClick={() => setQuickAddOpen(true)} aria-label="Quick Add" className={itemClassName}>
            <span className="-mt-6 flex size-10 items-center justify-center rounded-full bg-accent-teal-700 text-white shadow-2">
              <PlusIcon className="size-5" />
            </span>
          </button>

          <button type="button" onClick={onOpenSearch} className={itemClassName}>
            <SearchIcon className="size-5" />
            Search
          </button>

          <button type="button" onClick={onOpenNav} className={itemClassName}>
            <MenuIcon className="size-5" />
            More
          </button>
        </div>
      </nav>

      <QuickAddSheet
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        items={quickAddItems}
        onSelect={handleQuickAddSelect}
      />
      <AdvanceQuickEntryPanel open={advanceOpen} onOpenChange={setAdvanceOpen} />
    </>
  );
}

function SidebarShell({ pathname, role, children }: { pathname: string; role: Role; children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pwaInstall = usePwaInstall();
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const search = useGlobalSearchController();

  async function handleConfirmInstall() {
    setInstallDialogOpen(false);
    await pwaInstall.install();
  }

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
    // Story 19.3: exposes the one real controller's setOpen to descendants
    // that can't call useGlobalSearchController() themselves (the
    // Dashboard's Server Component tree, via dashboard-search-button.tsx) —
    // never a second independent controller instance.
    <GlobalSearchContext.Provider value={{ open: () => search.setOpen(true) }}>
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        {/* Desktop rail — shown from lg up. The shell pins it to the viewport
            (lg:h-screen + lg:overflow-hidden on the root) and each pane scrolls
            on its own: the rail keeps its full nav reachable however long the
            page content is, and the content scrolls without carrying the rail
            off-screen. */}
        <aside className="hidden w-62 shrink-0 flex-col gap-1 overflow-y-auto bg-accent-navy-800 px-4 py-6 text-ink-on-accent lg:flex">
          <SidebarNav
            pathname={pathname}
            role={role}
            pwaAvailable={pwaInstall.available}
            onRequestInstall={() => setInstallDialogOpen(true)}
            onOpenSearch={() => search.setOpen(true)}
          />
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
          {/* Story 16.2: reachable in one tap on mobile, not gated behind the drawer. */}
          <GlobalSearchButton
            iconOnly
            onClick={() => search.setOpen(true)}
            className="ml-auto text-ink-700 hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none"
          />
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
              <SidebarNav
                pathname={pathname}
                role={role}
                onNavigate={() => setNavOpen(false)}
                pwaAvailable={pwaInstall.available}
                onRequestInstall={() => setInstallDialogOpen(true)}
                onOpenSearch={() => search.setOpen(true)}
              />
            </aside>
          </div>
        ) : null}

        {/* Content gets extra bottom padding below lg for both roles so their
            respective fixed quick-bar never covers the last row / submit
            button of a page. */}
        <main
          className={cn(
            "flex-1 px-4 py-6 lg:overflow-y-auto lg:px-10 lg:py-8",
            (role === "SITE_SUPERVISOR" || role === "OWNER_ADMIN") && "pb-24 lg:pb-8",
          )}
        >
          <div className="max-w-310">{children}</div>
        </main>

        {role === "SITE_SUPERVISOR" ? <SupervisorQuickBar pathname={pathname} /> : null}
        {role === "OWNER_ADMIN" ? (
          <OwnerQuickBar
            pathname={pathname}
            onOpenSearch={() => search.setOpen(true)}
            onOpenNav={() => setNavOpen(true)}
          />
        ) : null}

        <ConfirmDialog
          open={installDialogOpen}
          onOpenChange={setInstallDialogOpen}
          title={pwaInstall.isIos ? "Install this app" : "Install this app?"}
          description={
            pwaInstall.isIos
              ? "iOS doesn't allow installing directly — tap Share, then Add to Home Screen."
              : "Get faster, full-screen access from your home screen."
          }
          confirmLabel={pwaInstall.isIos ? "Got it" : "Install"}
          cancelLabel={pwaInstall.isIos ? "Close" : "Not now"}
          onConfirm={pwaInstall.isIos ? () => setInstallDialogOpen(false) : handleConfirmInstall}
        />

        <GlobalSearchDialog controller={search} />
      </div>
    </GlobalSearchContext.Provider>
  );
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();

  // Sidebar shell for every role (product direction) — the `role` decides the
  // nav set (Supervisor trim + bottom quick-bar vs the Owner's full rail) and
  // the Settings item, not whether there's a rail.
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
