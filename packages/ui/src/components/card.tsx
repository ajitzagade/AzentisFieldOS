import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

// The single Card implementation (AD-5). Resting elevation is shadow-2, not
// shadow-1 — DESIGN.md is explicit that a flat, hairline-only panel is a
// defect (the pre-feedback Direction C mistake), not a lighter style choice.
// Every card deepens its shadow on hover for tactile depth; only an
// `interactive` card (a real click target) additionally lifts and shows a
// pointer cursor, so hover affordance never lies about clickability.
export const cardVariants = cva(
  "bg-surface-1 border border-border-hairline rounded-lg shadow-2 p-6 transition-[box-shadow,transform] duration-(--default-transition-duration) ease-(--ease-standard) hover:shadow-2-hover",
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, ...props }, ref) => {
    return <div ref={ref} className={cn(cardVariants({ interactive }), className)} {...props} />;
  },
);
Card.displayName = "Card";
