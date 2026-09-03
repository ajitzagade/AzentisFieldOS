"use client";

import { type KeyboardEvent, type ReactNode, useMemo, useRef } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { cn } from "../lib/cn";
import { SearchIcon } from "../icons/search-icon";

// The first command-palette-shaped primitive in this package (AD-5) — a
// global, type-to-jump-anywhere search. Kept purely prop-driven, with no
// data fetching and no next/navigation dependency, exactly like
// Pagination/DataTable: apps/web's global-search.tsx owns fetching,
// debouncing, and routing; this owns rendering, the modal, and keyboard
// navigation between results. Built on Base UI's plain Dialog (not
// AlertDialog — this isn't a destructive confirmation) so focus trapping
// and Escape-to-close aren't hand-maintained, matching ConfirmDialog's use
// of AlertDialog.
export interface SearchResultItem {
  id: string;
  label: string;
  description?: string;
  /** Icon rendered in the row's tile. Omitted rows render with no tile at
   * all (kept optional so a caller/test can render a plain text-only row). */
  icon?: ReactNode;
}

export interface SearchResultGroup {
  key: string;
  label: string;
  items: SearchResultItem[];
  total: number;
  /** Tile style shared by every item in this group (DESIGN.md's
   * Search/Action palette spec): "tinted" (default) — `accent-teal-100`
   * background/`accent-teal-700` icon — for entity rows that open a
   * record; "solid" — filled `accent-teal-700` with a white icon — for
   * Action rows that do something instead. Set explicitly by the caller
   * (apps/web's global-search.tsx); never inferred from `key` here, so
   * this stays a plain, prop-driven primitive. A "solid" group also never
   * renders a "See all" action — Actions are a fixed curated list, not a
   * paginated dataset. */
  tone?: "tinted" | "solid";
}

// A "solid" (Action) group is a fixed curated list, not a paginated
// dataset — it never grows a "See all" regardless of what `total` the
// caller passes.
function showsSeeAll(group: SearchResultGroup): boolean {
  return group.tone !== "solid" && group.total > group.items.length;
}

export interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  groups: SearchResultGroup[];
  loading?: boolean;
  error?: string | null;
  onSelect: (groupKey: string, item: SearchResultItem) => void;
  onSeeAll: (groupKey: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  title?: string;
}

export function SearchPalette({
  open,
  onOpenChange,
  query,
  onQueryChange,
  groups,
  loading,
  error,
  onSelect,
  onSeeAll,
  placeholder = "Search sites, materials, vendors, team, payments…",
  emptyMessage = "No results",
  title = "Search",
}: SearchPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hasQuery = query.trim().length > 0;
  const showEmpty = hasQuery && !loading && !error && groups.every((group) => group.total === 0);

  // Flat, render-order index across every group's items + its trailing
  // "See all" button (when shown) — the single sequence ArrowDown/ArrowUp
  // walk, so the palette doesn't need per-group keyboard state.
  let flatIndex = -1;
  function nextFlatIndex() {
    flatIndex += 1;
    return flatIndex;
  }

  const focusableCount = useMemo(
    () =>
      groups.reduce(
        (sum, group) => sum + group.items.length + (showsSeeAll(group) ? 1 : 0),
        0,
      ),
    [groups],
  );
  buttonRefs.current = buttonRefs.current.slice(0, focusableCount);

  function focusIndex(index: number) {
    if (index < 0) {
      inputRef.current?.focus();
      return;
    }
    buttonRefs.current[index]?.focus();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && focusableCount > 0) {
      event.preventDefault();
      focusIndex(0);
    }
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusIndex(index + 1 < focusableCount ? index + 1 : index);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusIndex(index - 1);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed top-24 left-1/2 z-50 max-h-[70vh] w-[calc(100vw-2rem)] max-w-150 -translate-x-1/2 overflow-hidden rounded-lg border border-border-hairline bg-surface-1 shadow-3">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="relative border-b border-border-hairline">
            <span className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500">
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              aria-label={title}
              className="w-full bg-transparent py-4 pr-4 pl-11 text-body text-ink-900 placeholder:text-ink-500 focus:outline-none"
            />
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-2">
            {!hasQuery ? null : loading ? (
              <p role="status" className="px-3 py-6 text-center text-body-sm text-ink-500">
                Searching…
              </p>
            ) : error ? (
              <p role="alert" className="px-3 py-6 text-center text-body-sm text-danger-700">
                {error}
              </p>
            ) : showEmpty ? (
              <p className="px-3 py-6 text-center text-body-sm text-ink-500">
                {emptyMessage} for &ldquo;{query}&rdquo;
              </p>
            ) : (
              groups
                .filter((group) => group.items.length > 0)
                .map((group) => (
                  <div key={group.key} className="mb-2 last:mb-0">
                    <p className="px-3 py-1 text-eyebrow text-ink-500 uppercase">{group.label}</p>
                    {group.items.map((item) => {
                      const index = nextFlatIndex();
                      return (
                        <button
                          key={item.id}
                          type="button"
                          ref={(el) => {
                            buttonRefs.current[index] = el;
                          }}
                          onClick={() => onSelect(group.key, item)}
                          onKeyDown={(event) => handleItemKeyDown(event, index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none",
                          )}
                        >
                          {item.icon ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4",
                                group.tone === "solid"
                                  ? "bg-accent-teal-700 text-white"
                                  : "bg-accent-teal-100 text-accent-teal-700",
                              )}
                            >
                              {item.icon}
                            </span>
                          ) : null}
                          <span className="flex min-w-0 flex-col items-start">
                            <span className="text-body-sm text-ink-900">{item.label}</span>
                            {item.description ? (
                              <span className="text-eyebrow text-ink-500">{item.description}</span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                    {showsSeeAll(group)
                      ? (() => {
                          const index = nextFlatIndex();
                          return (
                            <button
                              key={`${group.key}-see-all`}
                              type="button"
                              ref={(el) => {
                                buttonRefs.current[index] = el;
                              }}
                              onClick={() => onSeeAll(group.key)}
                              onKeyDown={(event) => handleItemKeyDown(event, index)}
                              className="w-full rounded-md px-3 py-2 text-left text-body-sm font-medium text-accent-teal-700 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                            >
                              See all {group.total} results
                            </button>
                          );
                        })()
                      : null}
                  </div>
                ))
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
