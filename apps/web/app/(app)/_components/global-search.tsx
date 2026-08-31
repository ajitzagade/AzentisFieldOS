"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, SearchPalette, cn, type SearchResultGroup } from "@azentisfieldos/ui";
import { useGlobalSearch } from "../../../lib/use-global-search";

const SEARCH_DEBOUNCE_MS = 300;

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

  const groups: SearchResultGroup[] = [
    {
      key: "sites",
      label: "Sites",
      items: (data?.sites.results ?? []).map((site) => ({
        id: site.id,
        label: site.name,
        description: site.location,
      })),
      total: data?.sites.total ?? 0,
    },
    {
      key: "materials",
      label: "Materials",
      items: (data?.materials.results ?? []).map((material) => ({
        id: material.id,
        label: material.name,
        description: material.category.name,
      })),
      total: data?.materials.total ?? 0,
    },
  ];

  function handleSelect(groupKey: string, item: { id: string }) {
    setOpen(false);
    if (groupKey === "sites") {
      router.push(`/sites/${item.id}`);
    } else if (groupKey === "materials") {
      router.push(`/materials/${item.id}/availability`);
    }
  }

  function handleSeeAll(groupKey: string) {
    const q = encodeURIComponent(debouncedQuery);
    setOpen(false);
    if (groupKey === "sites") {
      router.push(`/sites?q=${q}`);
    } else if (groupKey === "materials") {
      router.push(`/materials?q=${q}`);
    }
  }

  return { open, setOpen, query, onQueryChange, groups, loading, error, handleSelect, handleSeeAll };
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

export function GlobalSearchDialog({ controller }: { controller: GlobalSearchController }) {
  return (
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
  );
}
