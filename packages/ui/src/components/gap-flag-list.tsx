import { type ReactNode } from "react";
import { cn } from "../lib/cn";
import { DetailsDisclosure } from "./details-disclosure";

// A Tenant with many flagged Sites turned a screen into a wall of full-width
// GapFlag rows (e.g. Owner Dashboard, 2026-09-03 review). Below `threshold`
// every flag still renders inline, exactly as FR-35 requires ("never a silent
// absence in a list"); at/above it they fold behind one summary line — each
// Site stays individually named and actionable once expanded, it's just not
// all visible at once. Built on the one DetailsDisclosure primitive (AD-5),
// not a new collapse implementation. Defaults closed (2026-09-22 revision):
// the 2026-09-05 defaults-open choice made the dashboard open with a wall of
// warning rows expanded whenever a Tenant had several flagged Sites — the
// summary line itself already satisfies FR-35 ("never a silent absence"),
// since the count and every Site's presence is named there unexpanded.
export interface GapFlagListProps {
  count: number;
  summary: string;
  threshold?: number;
  children: ReactNode;
  className?: string;
}

export function GapFlagList({ count, summary, threshold = 3, children, className }: GapFlagListProps) {
  if (count === 0) {
    return null;
  }

  if (count < threshold) {
    return <div className={cn("flex flex-col gap-3", className)}>{children}</div>;
  }

  return (
    <DetailsDisclosure
      summary={summary}
      className={cn("border-solid border-gap-flag-border bg-warning-100", className)}
    >
      <div className="flex flex-col gap-3">{children}</div>
    </DetailsDisclosure>
  );
}
