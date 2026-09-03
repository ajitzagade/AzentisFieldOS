"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, HashIcon, TextField } from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { confirmMovementReceiptAction, type ConfirmMovementReceiptFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Confirm Receipt
    </Button>
  );
}

const initialState: ConfirmMovementReceiptFormState = {};

export function ConfirmReceiptForm({ movementId, sentQuantity }: { movementId: string; sentQuantity: string }) {
  const [state, formAction] = useActionState(confirmMovementReceiptAction.bind(null, movementId), initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <Card>
      <form ref={formRef} action={formAction} noValidate>
        <TextField
          label="Received Quantity"
          name="receivedQuantity"
          type="number"
          step="any"
          required
          icon={<HashIcon className="size-4" />}
          hint={`Sent: ${sentQuantity}. Any shortfall stays visible — never auto-reconciled to the sent amount.`}
          error={state.errors?.receivedQuantity?.[0]}
        />

        {state.formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </Card>
  );
}
