"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, CheckCircleIcon } from "@azentisfieldos/ui";
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
export function MarkPaidButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(markPaymentPaidAction.bind(null, id), initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <SubmitButton />
      </form>
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </div>
  );
}
