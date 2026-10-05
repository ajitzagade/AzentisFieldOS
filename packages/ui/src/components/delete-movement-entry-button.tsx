"use client";

import { useState, useTransition } from "react";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";
import { TextareaField } from "./field";

// AD-9 exception (approved 2026-10-05): the single soft-delete affordance
// for a transaction-history row (Purchase/Movement/Consumption/Waste
// Material/RMC) — a duplicate or mistaken entry disappears from every
// list/aggregate, but the row itself is never destroyed (AD-5: one
// implementation, reused across every entity's list view, never
// hand-rolled per screen). Unlike DeleteEntityButton (master data — Site/
// Vendor — a plain confirm with no reason), this always requires a reason,
// same discipline as a correction.
export interface DeleteMovementEntryButtonProps {
  /** Icon-only ghost button (list rows), same visual language as CorrectAction. */
  icon: React.ReactNode;
  /** Accessible name for the icon-only trigger. Defaults to "Delete". */
  label?: string;
  title: string;
  /** One-line framing above the reason field, e.g. "This Purchase will disappear from every list and its stock effect will be reversed." */
  description?: string;
  /** Called with the typed reason once confirmed — performs the DELETE and refreshes/redirects. */
  action: (reason: string) => Promise<void>;
}

export function DeleteMovementEntryButton({
  icon,
  label = "Delete",
  title,
  description,
  action,
}: DeleteMovementEntryButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const trimmed = reason.trim();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        {icon}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setOpen(next);
          if (!next) setReason("");
        }}
        title={title}
        description={description}
        confirmLabel={label}
        confirmLoading={isPending}
        confirmDisabled={!trimmed}
        onConfirm={() => {
          if (!trimmed) return;
          startTransition(async () => {
            await action(trimmed);
            setOpen(false);
            setReason("");
          });
        }}
      >
        <TextareaField
          label="Reason for deletion"
          required
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Entered twice by mistake"
        />
      </ConfirmDialog>
    </>
  );
}
