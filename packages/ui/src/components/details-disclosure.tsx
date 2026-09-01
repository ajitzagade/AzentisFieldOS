import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { ChevronRightIcon } from "../icons/chevron-right-icon";

// The single progressive-disclosure fold (AD-5), approved by the 2026-09-01
// simplicity review (decision D5): optional form fields collapse behind one
// "More details" toggle so the required path reads short on a phone. Built on
// native <details>/<summary> — zero JS, and the collapsed fields stay in the
// DOM, so a server-action form still submits every value inside the fold.
export interface DetailsDisclosureProps {
  /** Toggle label, e.g. "More details — challan no., photo, vehicle, notes" */
  summary: string;
  /** Open on first render — pass true when any field inside has a value. */
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function DetailsDisclosure({ summary, defaultOpen, children, className }: DetailsDisclosureProps) {
  return (
    <details open={defaultOpen} className={cn("group mb-4 rounded-md border border-dashed border-border-strong bg-surface-0", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-md px-3 py-2.5 text-body-sm font-semibold text-ink-700 hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon aria-hidden="true" className="size-4 rotate-90 transition-transform duration-(--default-transition-duration) ease-(--ease-standard) group-open:-rotate-90" />
        {summary}
      </summary>
      <div className="px-3 pt-3">{children}</div>
    </details>
  );
}
