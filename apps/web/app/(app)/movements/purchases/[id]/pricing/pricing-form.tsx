"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AmountField,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  ConfirmDialogRow,
  SelectField,
  WalletIcon,
  formValue,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { useClientValidation } from "../../../../../../lib/use-client-validation";
import { completePricingAction, type CompletePricingFormState } from "./actions";
import { parsePricingForm } from "./parse";

const initialState: CompletePricingFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Pricing
    </Button>
  );
}

// D7: Rate is what the Owner reads off the bill; Total auto-computes from
// the quantity the Supervisor recorded at the gate (shown read-only above
// this form) and stays editable for bills that carry rounding or extras.
export function PricingForm({ purchaseId, quantity }: { purchaseId: string; quantity: number }) {
  const boundAction = completePricingAction.bind(null, purchaseId);
  const [state, formAction] = useActionState(boundAction, initialState);
  const validation = useClientValidation(parsePricingForm);
  // Money write that is one-time by design (changes afterwards go through
  // Correct) — held for re-verification like every other money submission
  // (FR-54).
  const confirmation = useSubmitConfirmation();

  const [rate, setRate] = useState("");
  const [manualTotal, setManualTotal] = useState<string | null>(null);
  const computedTotal =
    rate.trim() !== "" && Number.isFinite(Number(rate)) ? String(Math.round(quantity * Number(rate) * 100) / 100) : "";
  const totalValue = manualTotal ?? computedTotal;

  const fieldError = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <form action={formAction} onSubmit={validation.guard(confirmation.guard())} noValidate>
      <AmountField
        label="Rate"
        name="rate"
        required
        value={rate}
        onChange={(e) => {
          setRate(e.target.value);
          setManualTotal(null);
        }}
        error={fieldError("rate")}
      />
      <AmountField
        label="Total Amount"
        name="totalAmount"
        required
        value={totalValue}
        onChange={(e) => setManualTotal(e.target.value)}
        error={fieldError("totalAmount")}
      />
      <SelectField
        label="Payment Status"
        name="paymentStatus"
        required
        icon={<WalletIcon className="size-4" />}
        defaultValue="UNPAID"
        options={[
          { value: "PAID", label: "Paid" },
          { value: "PARTIAL", label: "Partial" },
          { value: "UNPAID", label: "Unpaid" },
        ]}
        error={fieldError("paymentStatus")}
      />

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Save this pricing?"
        description="Pricing is completed once — later changes go through a correction entry."
        confirmLabel="Save Pricing"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Rate" value={formValue(confirmation.values, "rate")} />
        <ConfirmDialogRow label="Total amount" value={formValue(confirmation.values, "totalAmount")} />
        <ConfirmDialogRow label="Payment status" value={formValue(confirmation.values, "paymentStatus")} />
      </ConfirmDialog>
    </form>
  );
}
