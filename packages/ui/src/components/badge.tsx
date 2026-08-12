import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

// The single Badge implementation (AD-5). Semantic color only — never a
// decorative accent. `neutral`'s token values come from the UX shared kit
// (_shared-kit.html's .badge-neutral); DESIGN.md's frontmatter doesn't name
// a neutral token but its Components prose lists neutral as a valid variant.
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption",
  {
    variants: {
      variant: {
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        danger: "bg-danger-100 text-danger-700",
        gold: "bg-gold-100 text-gold-700",
        neutral: "bg-surface-3 text-ink-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Optional icon rendered before the label — never hardcoded, always
   * caller-supplied so Badge stays decoupled from the icon set (story 1.4). */
  icon?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
        {icon ? (
          <span className="[&>svg]:size-3" aria-hidden>
            {icon}
          </span>
        ) : null}
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";
