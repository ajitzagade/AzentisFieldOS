"use client";

import { Popover } from "@base-ui-components/react/popover";
import { InfoIcon } from "../icons/info-icon";
import { cn } from "../lib/cn";

// The single contextual-help affordance (AD-5, DESIGN.md's help-bubble
// component): a small "ⓘ" ghost icon-button next to any field or concept a
// first-time user would find confusing. Opens a short anchored popover —
// never a full-screen takeover, never navigation away from what the user
// was doing. Content is 2-3 plain-language sentences, matching
// EXPERIENCE.md's Help & Guides / Client Presentation voice addendum.
export interface HelpBubbleProps {
  /** e.g. "How does this work?" — read by screen readers as the button's label. */
  label?: string;
  /** 2-3 plain-language sentences. Pulled from the same shared content the
   * Help & Guides pages and Client Presentation read from. */
  children: React.ReactNode;
  className?: string;
}

export function HelpBubble({ label = "How does this work?", children, className }: HelpBubbleProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={label}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full text-ink-500 hover:bg-surface-2 hover:text-accent-teal-700 focus-visible:ring-2 focus-visible:ring-accent-teal-100 focus-visible:outline-none",
          className,
        )}
      >
        <InfoIcon className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="z-50">
          <Popover.Popup className="w-72 rounded-md border border-border-hairline bg-surface-1 p-4 text-body-sm text-ink-700 shadow-2">
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
