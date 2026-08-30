import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

// The single Button implementation (AD-5). Every screen composes this —
// no screen defines its own <button className="..."> styling. New visual
// needs extend `buttonVariants`, they don't fork this component.
//
// The three DESIGN.md variants (primary/secondary/ghost) plus `danger` for
// destructive actions (soft delete) — added through this prop API per AD-5,
// never as one-off per-screen styling.
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold",
    "transition-[background-color,box-shadow,transform,border-color] duration-(--default-transition-duration) ease-(--ease-standard)",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-100 focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent-teal-700 text-white shadow-1 hover:bg-accent-teal-600 hover:shadow-2 hover:-translate-y-px",
        secondary:
          "bg-surface-1 text-ink-900 border border-border-strong hover:bg-surface-2 hover:border-accent-teal-700",
        ghost: "bg-transparent text-ink-700 hover:bg-surface-2 hover:text-ink-900",
        danger:
          "bg-surface-1 text-danger-700 border border-danger-700 hover:bg-danger-100",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      iconOnly: {
        true: "px-0 aspect-square",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders a spinner and disables the button — the state a submit
   * action must show, per AD-6's full-state-set rule. */
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconOnly, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
