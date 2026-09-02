import { type ReactNode } from "react";
import { cn } from "../lib/cn";

// A navigable pill (Story 19.6's recently-viewed shortcuts) — shares
// badge.tsx's pill shape (rounded-full, caption-sized text) but is a real
// link to a record, not a status label, so it also carries a tinted icon
// tile (the same `bg-accent-teal-100`/`text-accent-teal-700` tile
// SearchPalette/StatTile use for "opens a record" affordances) and a muted
// entity-type suffix. Badge itself stays untouched (AD-5: one
// implementation per primitive, extended by a sibling component, never a
// mutation of the original). Kept prop-driven with a plain `<a>` (like
// StatTile's own `href` — this package has no next/navigation dependency),
// so apps/web's Next.js router still owns actual client-side navigation.
export interface EntityChipProps {
  href: string;
  /** Icon rendered in the pill's tinted tile — caller-supplied, matching
   * every other icon-slot primitive in this package (never hardcoded). */
  icon: ReactNode;
  name: string;
  /** Muted entity-type suffix, e.g. "Site" renders as "· Site". */
  typeLabel: string;
  className?: string;
}

export function EntityChip({ href, icon, name, typeLabel, className }: EntityChipProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-border-hairline bg-surface-1 py-1 pr-3 pl-1 text-caption transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-accent-teal-100 focus-visible:outline-none",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-teal-100 text-accent-teal-700 [&>svg]:size-3.5"
      >
        {icon}
      </span>
      <span className="max-w-40 truncate font-medium text-ink-900">{name}</span>
      <span className="shrink-0 text-ink-500">· {typeLabel}</span>
    </a>
  );
}
