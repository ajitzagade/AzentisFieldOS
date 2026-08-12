import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

// The single Stat Tile implementation (AD-5). Icon is injected (ReactNode),
// never hardcoded — decouples this component from story 1.4's icon set.
// Value formatting (currency symbols, separators) is a caller concern.
const tintVariants = cva("flex size-8 items-center justify-center rounded-md [&>svg]:size-4", {
  variants: {
    tint: {
      teal: "bg-accent-teal-100 text-accent-teal-700",
      gold: "bg-gold-100 text-gold-700",
      success: "bg-success-100 text-success-700",
      danger: "bg-danger-100 text-danger-700",
    },
  },
  defaultVariants: {
    tint: "teal",
  },
});

export interface StatTileProps extends VariantProps<typeof tintVariants> {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  /** When present, the whole tile renders as a real link — never an
   * onClick-driven false affordance. */
  href?: string;
  className?: string;
}

export function StatTile({ icon, value, label, tint, href, className }: StatTileProps) {
  const content = (
    <>
      <div className={tintVariants({ tint })}>{icon}</div>
      <div className="text-kpi-numeral tabular-nums">{value}</div>
      <div className="mt-1 text-caption text-ink-500">{label}</div>
    </>
  );

  const baseClass = cn(
    "block bg-surface-1 border border-border-hairline rounded-lg shadow-1 p-5 transition-shadow duration-(--default-transition-duration) ease-(--ease-standard) hover:shadow-2",
    className,
  );

  if (href) {
    return (
      <a href={href} className={baseClass}>
        {content}
      </a>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
