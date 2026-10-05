import { type ReactNode } from "react";
import Link from "next/link";
import { Button, buttonVariants, type ButtonProps } from "./button";
import { cn } from "../lib/cn";

// The single Correct action implementation (AD-5, AD-9). A labelled
// secondary/sm button (pencil icon + visible "Edit" text by default) —
// matches the row's other labelled action buttons (Confirm Receipt, Add
// Pricing) instead of being the one unlabeled icon in the row. AD-9 still
// governs what happens after the click (an append-only correction, never a
// literal row UPDATE) — this only changes how the affordance reads; wiring
// it to an actual reason-required correction flow is each consuming
// screen's own domain-specific responsibility.
export type CorrectActionProps = {
  icon: ReactNode;
  /** Visible label and accessible name. Defaults to "Edit". */
  label?: string;
} & (
  | { href: string; onClick?: never }
  | { href?: undefined; onClick: ButtonProps["onClick"] }
);

export function CorrectAction({ icon, label = "Edit", href, onClick }: CorrectActionProps) {
  if (href) {
    return (
      // next/link's Link (not a plain <a>) so this navigates client-side
      // instead of a full page reload; prefetch disabled since a list can
      // render many rows, each with its own Edit link.
      <Link
        href={href}
        prefetch={false}
        className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}
