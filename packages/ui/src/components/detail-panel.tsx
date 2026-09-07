"use client";

import { type ReactNode } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { cn } from "../lib/cn";
import { XIcon } from "../icons/x-icon";

// Story: Vendor & Subcontractor detail side panel. A generic, presentation-
// only right-anchored sheet — same Dialog.Root/Portal/Backdrop/Popup
// skeleton as quick-add-sheet.tsx (bottom-anchored there, right-anchored
// here), with no data fetching and no next/navigation dependency: the
// caller owns what "open" means (a URL param, in every current use), what
// content renders, and what happens on close. Built on Base UI's Dialog so
// the backdrop, focus trap, and Escape-to-close aren't hand-maintained.
export interface DetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DetailPanel({ open, onOpenChange, title, children, className }: DetailPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface-1 p-6 shadow-3",
            className,
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <Dialog.Title className="text-card-title text-ink-900">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close panel"
              className="shrink-0 rounded-sm text-ink-500 hover:text-ink-900 focus-visible:outline-none"
            >
              <XIcon className="size-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
