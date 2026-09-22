import { type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

// The single Gap Flag implementation (AD-5). `action` is required, not
// optional — a gap flag is never a bare warning with no next step
// (EXPERIENCE.md), enforced here at the type level rather than by
// convention alone.
export interface GapFlagProps {
  icon: ReactNode;
  message: ReactNode;
  /** The one primary action — required, per AC #3. Pass a Button (from
   * story 1.2) sized/variant per the caller's judgment. */
  action: ReactElement;
  className?: string;
}

export function GapFlag({ icon, message, action, className }: GapFlagProps) {
  return (
    <div
      className={cn(
        // Mobile bug (2026-09-22): a long message (a Site name that wraps to
        // several lines) forced this whole row wider than the viewport,
        // clipping `action` off the right edge — a single-row flex item
        // needs `min-w-0` to shrink/wrap instead of pushing its siblings
        // out, which a plain `flex-1` alone does not provide. Stacking the
        // action below the message on narrow viewports (`flex-col`,
        // `sm:flex-row` from here up) removes the failure mode entirely
        // rather than just tightening the overflow math.
        "flex flex-col gap-3 rounded-md border border-gap-flag-border bg-warning-100 px-4 py-3 text-body-sm font-semibold text-warning-700 sm:flex-row sm:items-center",
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <span className="shrink-0 [&>svg]:size-5" aria-hidden>
          {icon}
        </span>
        <p className="min-w-0 flex-1">{message}</p>
      </span>
      <span className="shrink-0">{action}</span>
    </div>
  );
}
