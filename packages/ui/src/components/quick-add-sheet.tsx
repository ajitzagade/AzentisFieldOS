"use client";

import { type ReactNode } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { cn } from "../lib/cn";

// Story 19.4: the Owner mobile quick-bar's center "+" opens this
// bottom-anchored sheet — restyles AdvanceQuickEntryModal's
// Dialog.Root/Portal/Backdrop/Popup skeleton (advance-quick-entry-modal.tsx)
// bottom-anchored instead of centered. Kept purely prop-driven with no data
// fetching and no next/navigation dependency, matching SearchPalette's
// precedent: apps/web's app-shell.tsx owns the curated action list (Story
// 19.2's SEARCH_ACTIONS — no second list), the icon lookup, and what
// selecting an item does (navigate, or open the Advance quick-entry modal).
export interface QuickAddItem {
  id: string;
  title: string;
  description: string;
  /** Icon rendered in the row's solid tile. Resolved by the caller (kept
   * optional so a caller/test can render a plain text-only row). */
  icon?: ReactNode;
}

export interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QuickAddItem[];
  onSelect: (id: string) => void;
  title?: string;
}

export function QuickAddSheet({ open, onOpenChange, items, onSelect, title = "Quick Add" }: QuickAddSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] w-full overflow-y-auto rounded-t-xl bg-surface-1 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-3">
          <div aria-hidden="true" className="mx-auto mb-4 h-1 w-9 rounded-full bg-border-strong" />
          <Dialog.Title className="mb-3 px-1 text-card-title text-ink-900">{title}</Dialog.Title>
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none",
                )}
              >
                {item.icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-teal-700 text-white [&_svg]:size-4"
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-col items-start">
                  <span className="text-body-sm text-ink-900">{item.title}</span>
                  <span className="text-eyebrow text-ink-500">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
