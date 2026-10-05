"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  ConfirmDialog,
  ConfirmDialogRow,
  formValue,
  useSubmitConfirmation,
  Button,
  Card,
  CorrectedValueField,
  PencilIcon,
  RotateCcwIcon,
  TextField,
  WalletIcon,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { correctVendorAdvanceAction, type CorrectVendorAdvanceFormState } from "./actions";
import { parseCorrectVendorAdvanceForm } from "./parse";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <RotateCcwIcon className="size-4" />
      Submit Correction
    </Button>
  );
}

const initialState: CorrectVendorAdvanceFormState = {};

export interface VendorAdvanceCorrectFormProps {
  correctsId: string;
  originalAmount: number;
  initialPaymentMethod?: string;
}

// A Vendor Advance only ever comes into existence as a side effect of a
// HIRED Waste Disposal entry — this form is the correction-only path
// (AD-9), same pattern as the Team Advance correct form. The redirect
// target after submit comes from the server's response (actions.ts), not a
// client-supplied vendorId — this form never needs one.
export function VendorAdvanceCorrectForm({
  correctsId,
  originalAmount,
  initialPaymentMethod,
}: VendorAdvanceCorrectFormProps) {
  const [state, formAction] = useActionState(correctVendorAdvanceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));
  const validation = useClientValidation(parseCorrectVendorAdvanceForm);
  const confirmation = useSubmitConfirmation();
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <form ref={formRef} action={formAction} onSubmit={validation.guard(confirmation.guard())} noValidate>
      <Card className="mb-4 border-warning-700 bg-warning-100">
        <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
          <RotateCcwIcon className="size-4" />
          Filing a correction
        </h2>
        <p className="mb-3 text-body-sm text-warning-700">
          This creates a new, linked entry — the original Vendor Advance is never edited or deleted (AD-9).
        </p>
        <input type="hidden" name="correctsId" value={correctsId} />
        <TextField
          label="Reason for this correction"
          name="reason"
          required
          icon={<PencilIcon className="size-4" />}
          error={errorFor("reason")}
        />
      </Card>

      <Card className="mb-4">
        <CorrectedValueField
          label="Corrected amount"
          name="amount"
          originalValue={originalAmount}
          unit="₹"
          required
          error={errorFor("amount")}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          icon={<WalletIcon className="size-4" />}
          placeholder="e.g. Cash, Bank Transfer"
          defaultValue={initialPaymentMethod}
          error={errorFor("paymentMethod")}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Submit this correction?"
        description="A correction is a new, permanent ledger entry — please re-verify the details."
        confirmLabel="Submit Correction"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Amount change" value={formValue(confirmation.values, "amount")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
