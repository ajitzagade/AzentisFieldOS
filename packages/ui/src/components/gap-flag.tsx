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
        "flex items-center gap-3 rounded-md border border-gap-flag-border bg-warning-100 px-4 py-3 text-body-sm font-semibold text-warning-700",
        className,
      )}
    >
      <span className="shrink-0 [&>svg]:size-5" aria-hidden>
        {icon}
      </span>
      <p className="flex-1">{message}</p>
      {action}
    </div>
  );
}
