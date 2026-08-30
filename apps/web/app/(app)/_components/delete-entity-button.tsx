"use client";

import { useState, useTransition } from "react";
import { Button, ConfirmDialog } from "@azentisfieldos/ui";

// The single soft-delete affordance (AD-5/AD-6): a danger button that always
// confirms with an entity-specific message before calling its Server Action.
// Only master data (Site, Vendor) gets this — AD-9 transaction rows are
// corrected, never deleted.
export function DeleteEntityButton({
  label,
  title,
  description,
  action,
  icon,
}: {
  label: string;
  title: string;
  description: string;
  /** Server Action that performs the soft delete and redirects. */
  action: () => Promise<void>;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button type="button" variant="danger" isLoading={isPending} onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={label}
        onConfirm={() => {
          setOpen(false);
          startTransition(async () => {
            await action();
          });
        }}
      />
    </>
  );
}
