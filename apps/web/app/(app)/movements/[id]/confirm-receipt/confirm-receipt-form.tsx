"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, TextField } from "@azentisfieldos/ui";
import { confirmMovementReceiptAction, type ConfirmMovementReceiptFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Confirm Receipt
    </Button>
  );
}

const initialState: ConfirmMovementReceiptFormState = {};

export function ConfirmReceiptForm({ movementId, sentQuantity }: { movementId: string; sentQuantity: string }) {
  const [state, formAction] = useActionState(confirmMovementReceiptAction.bind(null, movementId), initialState);

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Received Quantity"
          name="receivedQuantity"
          type="number"
          step="any"
          required
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
