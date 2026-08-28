"use client";

import { type FormEvent, type ReactNode, useCallback, useRef, useState } from "react";
import { AlertDialog } from "@base-ui-components/react/alert-dialog";
import { Button } from "./button";

// The single confirmation dialog (AD-5), for submissions that are hard to
// take back — corrections (append-only, FR-54), money movements
// (Payments, Advances, Adjustments). It plays back what was entered so
// the user re-verifies the details, not just the intent. Built on Base
// UI's AlertDialog so focus trapping, Escape, and aria-modal semantics
// are not hand-maintained.
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One-line framing above the detail rows. */
  description?: string;
  /** The entered details being confirmed — usually <ConfirmDialogRow>s. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm & Submit",
  cancelLabel = "Go back",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-1 p-6 shadow-3">
          <AlertDialog.Title className="mb-1 text-card-title text-ink-900">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mb-3 text-body-sm text-ink-500">{description}</AlertDialog.Description>
          ) : null}
          {children ? <div className="mb-4 rounded-md border border-border-hairline bg-surface-2 p-3">{children}</div> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Close
              render={<Button type="button" variant="secondary" />}
            >
              {cancelLabel}
            </AlertDialog.Close>
            <Button type="button" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// One label/value line inside the dialog's detail block.
export function ConfirmDialogRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-caption font-semibold text-ink-500">{label}</span>
      <span className="text-right text-body-sm text-ink-900">{value}</span>
    </div>
  );
}

// Intercepts a form's submit so it only proceeds after explicit
// confirmation. Wire `onSubmit={guard(handler?)}` and render a
// ConfirmDialog with `open`/`onOpenChange`/`onConfirm`:
// the first submit is held and the dialog opened; Confirm re-dispatches
// the original submission, which then passes straight through (both for
// `action`-based forms and onSubmit-handler forms).
export function useSubmitConfirmation() {
  const [open, setOpen] = useState(false);
  // The form's entered values, snapshotted at the moment the submission
  // was held — the dialog reads these to play the entry back, without
  // every field needing its own tracking state. Note: disabled controls
  // never appear in FormData (native behavior) — correction forms already
  // mirror their locked fields through hidden inputs.
  const [values, setValues] = useState<FormData | null>(null);
  const confirmedRef = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const guard = useCallback(
    (onSubmit?: (event: FormEvent<HTMLFormElement>) => void) =>
      (event: FormEvent<HTMLFormElement>) => {
        if (confirmedRef.current) {
          confirmedRef.current = false;
          onSubmit?.(event);
          return;
        }
        event.preventDefault();
        formRef.current = event.currentTarget;
        setValues(new FormData(event.currentTarget));
        setOpen(true);
      },
    [],
  );

  const confirm = useCallback(() => {
    setOpen(false);
    confirmedRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return { open, onOpenChange: setOpen, guard, confirm, values };
}

// Convenience for dialogs fed by the FormData snapshot above.
export function formValue(values: FormData | null, name: string): string {
  const raw = values?.get(name);
  return typeof raw === "string" && raw.trim() !== "" ? raw : "—";
}
