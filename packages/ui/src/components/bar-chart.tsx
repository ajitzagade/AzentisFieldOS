import { type ReactNode } from "react";
import { cn } from "../lib/cn";

// The single horizontal bar-chart implementation (AD-5) — plain inline
// markup (no charting library, AD-4's no-external-CDN/offline-first
// posture), reused wherever Reports/Dashboard need to compare a handful
// of labeled quantities at a glance. `tint` follows DESIGN.md's meaning-
// locked palette: gold for money figures, teal for everything else —
// never decided per call site.
export interface BarChartRow {
  label: string;
  value: number;
  displayValue?: ReactNode;
}

export interface BarChartProps {
  rows: BarChartRow[];
  tint?: "teal" | "gold";
  className?: string;
}

const trackTint = {
  teal: "bg-accent-teal-700",
  gold: "bg-gold-500",
};

export function BarChart({ rows, tint = "teal", className }: BarChartProps) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <div className="w-32 shrink-0 truncate text-body-sm text-ink-700" title={row.label}>
            {row.label}
          </div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn("h-full rounded-full", trackTint[tint])}
              style={{ width: `${Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0)}%` }}
            />
          </div>
          <div className="w-24 shrink-0 text-right text-body-sm font-semibold tabular-nums text-ink-900">
            {row.displayValue ?? row.value.toLocaleString("en-IN")}
          </div>
        </div>
      ))}
    </div>
  );
}
