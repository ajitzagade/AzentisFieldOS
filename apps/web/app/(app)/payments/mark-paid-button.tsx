"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  useSubmitConfirmation,
  useToast,
} from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { markPaymentPaidAction, type MarkPaymentPaidFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Mark Paid
    </Button>
  );
}

const initialState: MarkPaymentPaidFormState = {};

// A narrow, one-directional status transition (pending -> paid), visually
// distinct from CorrectAction's icon-only ghost button per this epic's own
// AD-9 discipline — never routed through correctsId, never reversible.
// Because it can't be undone, it's confirmed first; success is announced
// via toast since the row updates in place (no redirect to carry a flash).
export function MarkPaidButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(markPaymentPaidAction.bind(null, id), initialState);
  const confirmation = useSubmitConfirmation();
  const toast = useToast();
  const announcedDone = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!state.formError);

  useEffect(() => {
    if (state.done && !announcedDone.current) {
      announcedDone.current = true;
      toast.success("Payment marked as paid");
    }
    if (state.formError) {
      toast.error(state.formError);
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col items-end gap-1">
      <form ref={formRef} action={formAction} onSubmit={confirmation.guard()}>
        <SubmitButton />
      </form>
      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Mark this Payment as paid?"
        description="This is one-directional — a paid Payment cannot be set back to pending."
        confirmLabel="Mark Paid"
        onConfirm={confirmation.confirm}
      />
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </div>
  );
}
