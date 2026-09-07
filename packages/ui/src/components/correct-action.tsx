import { type ReactNode } from "react";
import Link from "next/link";
import { Button, buttonVariants, type ButtonProps } from "./button";
import { cn } from "../lib/cn";

// The single Correct action implementation (AD-5, AD-9). Always the
// ghost/icon-only rotate pattern — no `variant` prop exists on this
// component, so a caller cannot configure it to look like an Edit
// affordance on a transaction-history row. This component only renders
// the affordance; wiring it to an actual reason-required correction flow
// is each consuming screen's own domain-specific responsibility.
export type CorrectActionProps = {
  /** Story 1.4's rotate-ccw "correct" icon, once that story lands. */
  icon: ReactNode;
  /** Accessible name for the icon-only button. Defaults to "Correct". */
  label?: string;
} & (
  | { href: string; onClick?: never }
  | { href?: undefined; onClick: ButtonProps["onClick"] }
);

export function CorrectAction({ icon, label = "Correct", href, onClick }: CorrectActionProps) {
  if (href) {
    return (
      // next/link's Link (not a plain <a>) so this navigates client-side
      // instead of a full page reload; prefetch disabled since a list can
      // render many rows, each with its own Correct link.
      <Link
        href={href}
        prefetch={false}
        aria-label={label}
        className={cn(buttonVariants({ variant: "ghost", size: "sm", iconOnly: true }))}
      >
        {icon}
      </Link>
    );
  }

  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={label} onClick={onClick}>
      {icon}
    </Button>
  );
}
