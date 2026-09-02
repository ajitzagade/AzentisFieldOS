"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { matchSearchActions } from "@azentisfieldos/shared";
import {
  AdvanceQuickEntryModal,
  BarChartIcon,
  BoxIcon,
  BuildingIcon,
  ClipboardIcon,
  DropletIcon,
  GearIcon,
  LayersIcon,
  MapPinIcon,
  ReceiptIcon,
  SearchIcon,
  SearchPalette,
  UserIcon,
  UsersIcon,
  WalletIcon,
  cn,
  useToast,
  type SearchResultGroup,
} from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseCreateAdvanceForm } from "@/app/(app)/team/[id]/advances/parse";
import { createAdvanceQuickAction } from "@/app/(app)/team/[id]/advances/actions";
import { useGlobalSearch } from "../../../lib/use-global-search";

const SEARCH_DEBOUNCE_MS = 300;

// Story 19.2: which icon renders in a curated Action's solid tile — keyed by
// SearchAction.id (packages/shared/src/content/help-content.ts), not
// re-derived from the title text. Exported so Story 19.4's OwnerQuickBar
// (apps/web's app-shell.tsx) can build its Quick Add sheet's item list from
// the same SEARCH_ACTIONS array with the same icons, instead of a second
// hand-maintained icon map.
export const ACTION_ICONS: Record<string, ReactNode> = {
  "new-daily-report": <ClipboardIcon />,
  "record-payment": <WalletIcon />,
  "record-advance": <WalletIcon />,
  "add-purchase": <BoxIcon />,
  "add-vendor": <BuildingIcon />,
  "add-team-member": <UsersIcon />,
  "add-subcontractor": <UserIcon />,
  "review-and-price": <BoxIcon />,
  "open-reports": <BarChartIcon />,
  "open-settings": <GearIcon />,
};

export interface GlobalSearchController {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  groups: SearchResultGroup[];
  loading: boolean;
  error: string | null;
  handleSelect: (groupKey: string, item: { id: string; label: string; description?: string }) => void;
  handleSeeAll: (groupKey: string) => void;
  /** Story 19.2: selecting the "Record Advance" Action opens 19.1's modal
   * in place instead of navigating — this is that modal's open state,
   * owned here (not inside GlobalSearchDialog) so handleSelect can flip it. */
  advanceModalOpen: boolean;
  setAdvanceModalOpen: (open: boolean) => void;
}

// Story 19.3: lets a descendant that can't call useGlobalSearchController()
// itself (e.g. the Dashboard's Server Component tree) open the one
// singleton palette without prop drilling or spawning a second, unsynced
// controller instance. app-shell.tsx (already the sole owner of the real
// controller) provides this around its render tree, wired to that
// controller's setOpen; default is `null` so any accidental render outside
// that provider fails loudly via useOpenGlobalSearch() below instead of
// silently no-oping.
export const GlobalSearchContext = createContext<{ open: () => void } | null>(null);

// Throws instead of returning a no-op — a Search control that silently did
// nothing on click would be a worse bug than a dev-time crash, and this
// should never occur given the fixed app-router layout (app-shell.tsx
// always wraps every page).
export function useOpenGlobalSearch(): { open: () => void } {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useOpenGlobalSearch must be used within app-shell.tsx's GlobalSearchContext.Provider");
  }
  return context;
}

// The one global-search controller — mounted ONCE per app-shell (in
// SidebarShell) so its `Cmd/Ctrl+K` listener and dialog state aren't
// duplicated across the sidebar's desktop/drawer/mobile-header trigger
// buttons, which all share this single instance via props.
export function useGlobalSearchController(): GlobalSearchController {
  const router = useRouter();
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Cmd+K (Mac) / Ctrl+K (Windows/Linux) — the de facto command-palette
  // convention. Fires regardless of current focus, matching how every
  // other command-palette (GitHub, Linear, Vercel) implements it.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenState(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function reset() {
    clearTimeout(debounceRef.current);
    setQuery("");
    setDebouncedQuery("");
  }

  function setOpen(next: boolean) {
    setOpenState(next);
    if (!next) reset();
  }

  function onQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), SEARCH_DEBOUNCE_MS);
  }

  const { data, loading, error } = useGlobalSearch(debouncedQuery);

  // Actions matching is instant, plain-text `.includes()` over a fixed
  // curated list (Story 19.2's Boundaries) — driven by the live `query`,
  // not the debounced one, since it needs no network round-trip. Renders
  // first in `groups` below so it appears above entity groups when both
  // match (AC #2); SearchPalette only shows a group once it has items, so
  // this is a no-op entry when nothing matches.
  const matchedActions = matchSearchActions(query);

  const groups: SearchResultGroup[] = [
    {
      key: "actions",
      label: "Actions",
      tone: "solid",
      items: matchedActions.map((action) => ({
        id: action.id,
        label: action.title,
        description: action.description,
        icon: ACTION_ICONS[action.id],
      })),
      total: matchedActions.length,
    },
    {
      key: "sites",
      label: "Sites",
      items: (data?.sites?.results ?? []).map((site) => ({
        id: site.id,
        label: site.name,
        description: site.location,
        icon: <MapPinIcon />,
      })),
      total: data?.sites?.total ?? 0,
    },
    {
      key: "materials",
      label: "Materials",
      items: (data?.materials?.results ?? []).map((material) => ({
        id: material.id,
        label: material.name,
        description: material.category.name,
        icon: <LayersIcon />,
      })),
      total: data?.materials?.total ?? 0,
    },
    {
      key: "vendors",
      label: "Vendors",
      items: (data?.vendors?.results ?? []).map((vendor) => ({
        id: vendor.id,
        label: vendor.name,
        description: vendor.contactPerson ?? vendor.phone ?? undefined,
        icon: <BuildingIcon />,
      })),
      total: data?.vendors?.total ?? 0,
    },
    {
      key: "teamMembers",
      label: "Team Members",
      items: (data?.teamMembers?.results ?? []).map((member) => ({
        id: member.id,
        label: member.name,
        description: member.designation ?? undefined,
        icon: <UsersIcon />,
      })),
      total: data?.teamMembers?.total ?? 0,
    },
    {
      key: "payments",
      label: "Payments",
      items: (data?.payments?.results ?? []).map((payment) => ({
        id: payment.id,
        label: payment.teamMemberName,
        description: payment.payPeriod ?? undefined,
        icon: <WalletIcon />,
      })),
      total: data?.payments?.total ?? 0,
    },
    {
      key: "purchases",
      label: "Purchases",
      items: (data?.purchases?.results ?? []).map((purchase) => ({
        id: purchase.id,
        label: `${purchase.materialName} — ${purchase.vendorName}`,
        description: purchase.totalAmount === null ? "Pricing pending" : undefined,
        icon: <BoxIcon />,
      })),
      total: data?.purchases?.total ?? 0,
    },
    {
      key: "subcontractors",
      label: "Subcontractors",
      items: (data?.subcontractors?.results ?? []).map((sub) => ({
        id: sub.id,
        label: sub.name,
        description: sub.contactPerson ?? sub.phone ?? undefined,
        icon: <UserIcon />,
      })),
      total: data?.subcontractors?.total ?? 0,
    },
    {
      key: "rmc",
      label: "RMC",
      items: (data?.rmc?.results ?? []).map((entry) => ({
        id: entry.id,
        label: `${entry.grade} — ${entry.siteName}`,
        description: entry.vendorName,
        icon: <DropletIcon />,
      })),
      total: data?.rmc?.total ?? 0,
    },
    {
      key: "expenses",
      label: "Expenses",
      items: (data?.expenses?.results ?? []).map((expense) => ({
        id: expense.id,
        label: expense.description ?? expense.siteName,
        description: expense.description ? expense.siteName : undefined,
        icon: <ReceiptIcon />,
      })),
      total: data?.expenses?.total ?? 0,
    },
  ];

  function handleSelect(groupKey: string, item: { id: string }) {
    if (groupKey === "actions") {
      const action = matchedActions.find((a) => a.id === item.id);
      setOpen(false);
      if (!action) return;
      if (action.href === null) {
        // Record Advance — opens 19.1's modal in place, no navigation.
        setAdvanceModalOpen(true);
      } else {
        router.push(action.href);
      }
      return;
    }

    setOpen(false);
    if (groupKey === "sites") {
      router.push(`/sites/${item.id}`);
    } else if (groupKey === "materials") {
      router.push(`/materials/${item.id}/availability`);
    } else if (groupKey === "vendors") {
      router.push(`/vendors/${item.id}`);
    } else if (groupKey === "teamMembers") {
      router.push(`/team/${item.id}`);
    } else if (groupKey === "subcontractors") {
      router.push(`/subcontractors/${item.id}`);
    } else if (groupKey === "payments") {
      router.push(`/payments/${item.id}/correct`);
    } else if (groupKey === "rmc") {
      router.push(`/rmc/${item.id}/correct`);
    } else if (groupKey === "expenses") {
      router.push(`/expenses/${item.id}/correct`);
    } else if (groupKey === "purchases") {
      // D7: an unpriced Purchase (totalAmount null) routes to the Owner's
      // one-time pricing screen instead of the Correct flow.
      const purchase = data?.purchases?.results.find((p) => p.id === item.id);
      if (purchase && purchase.totalAmount === null) {
        router.push(`/movements/purchases/${item.id}/pricing`);
      } else {
        router.push(`/movements/purchases/${item.id}/correct`);
      }
    }
  }

  function handleSeeAll(groupKey: string) {
    const q = encodeURIComponent(debouncedQuery);
    setOpen(false);
    if (groupKey === "sites") {
      router.push(`/sites?q=${q}`);
    } else if (groupKey === "materials") {
      router.push(`/materials?q=${q}`);
    } else if (groupKey === "vendors") {
      router.push(`/vendors?q=${q}`);
    } else if (groupKey === "teamMembers") {
      router.push(`/team?q=${q}`);
    } else if (groupKey === "subcontractors") {
      router.push(`/subcontractors?q=${q}`);
    } else if (groupKey === "payments") {
      router.push(`/payments?q=${q}`);
    } else if (groupKey === "rmc") {
      router.push(`/rmc?q=${q}`);
    } else if (groupKey === "expenses") {
      router.push(`/expenses?q=${q}`);
    } else if (groupKey === "purchases") {
      // Purchases live inside the Movements log, filtered by type — there
      // is no standalone /purchases list page.
      router.push(`/movements?type=PURCHASE&q=${q}`);
    }
  }

  return {
    open,
    setOpen,
    query,
    onQueryChange,
    groups,
    loading,
    error,
    handleSelect,
    handleSeeAll,
    advanceModalOpen,
    setAdvanceModalOpen,
  };
}

// The visible entry point (AC #1) — rendered wherever the shell needs a
// trigger (desktop rail, mobile drawer, mobile top bar); every instance
// shares the one controller above via its `onClick`.
export function GlobalSearchButton({
  onClick,
  className,
  iconOnly,
}: {
  onClick: () => void;
  className?: string;
  /** Compact rendering for tight spaces (the mobile top bar) — icon only, still labelled for screen readers. */
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search"
      className={cn(
        "flex items-center gap-3 rounded-md text-body-sm font-medium transition-colors duration-(--default-transition-duration) ease-(--ease-standard)",
        iconOnly ? "size-9 justify-center" : "px-3 py-2",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0" />
      {iconOnly ? null : (
        <>
          Search
          <kbd className="ml-auto hidden text-eyebrow opacity-60 sm:inline">⌘K</kbd>
        </>
      )}
    </button>
  );
}

interface TeamMemberOption {
  id: string;
  name: string;
}

// Story 19.2: wires 19.1's shared AdvanceQuickEntryModal to the palette's
// "Record Advance" Action — same on-open Team Member fetch, bound
// non-redirecting Server Action, client validation (AD-7), and success
// toast as the Dashboard's AdvanceQuickEntryTrigger (apps/web/app/(app)/
// _components/advance-quick-entry-trigger.tsx), just without that
// component's own trigger button since `open` is driven by the caller's
// own controller instead of a local click handler. Exported (and named
// generically, not "GlobalSearch...") because Story 19.4's OwnerQuickBar
// reuses this exact wiring for its Quick Add sheet's "Record Advance" row —
// the modal itself must be reused, never forked a third time.
export function AdvanceQuickEntryPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formKey, setFormKey] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);

  const authedFetch = useAuthedFetch();
  const toast = useToast();
  const router = useRouter();
  const validation = useClientValidation(parseCreateAdvanceForm);

  const loadTeamMembers = useCallback(
    async (signal: AbortSignal) => {
      setTeamMembersLoading(true);
      setTeamMembersError(null);
      try {
        const res = await authedFetch("/team-members", { signal });
        if (!res.ok) throw new Error(`Failed to load Team Members (${res.status})`);
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("Malformed Team Members response");
        if (!signal.aborted) setTeamMembers(data as TeamMemberOption[]);
      } catch {
        if (!signal.aborted) setTeamMembersError("Couldn't load Team Members");
      } finally {
        if (!signal.aborted) setTeamMembersLoading(false);
      }
    },
    [authedFetch],
  );

  // Fetches only while the modal is open, and aborts on close — mirrors
  // AdvanceQuickEntryTrigger's effect. The formKey bump here remounts the
  // modal every time it's freshly opened, so its internal useActionState
  // (success/errors from a previous open) never leaks into this one.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the on-open fetch and remount key together, mirroring AdvanceQuickEntryTrigger's handleOpen
    setFormKey((key) => key + 1);
    loadTeamMembers(controller.signal);
    return () => controller.abort();
  }, [open, loadTeamMembers]);

  return (
    <AdvanceQuickEntryModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      teamMembers={teamMembers}
      teamMembersLoading={teamMembersLoading}
      teamMembersError={teamMembersError}
      action={createAdvanceQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={() => {
        toast.success("Advance recorded");
        onOpenChange(false);
        router.refresh();
      }}
    />
  );
}

export function GlobalSearchDialog({ controller }: { controller: GlobalSearchController }) {
  return (
    <>
      <SearchPalette
        open={controller.open}
        onOpenChange={controller.setOpen}
        query={controller.query}
        onQueryChange={controller.onQueryChange}
        groups={controller.groups}
        loading={controller.loading}
        error={controller.error}
        onSelect={controller.handleSelect}
        onSeeAll={controller.handleSeeAll}
      />
      <AdvanceQuickEntryPanel open={controller.advanceModalOpen} onOpenChange={controller.setAdvanceModalOpen} />
    </>
  );
}
