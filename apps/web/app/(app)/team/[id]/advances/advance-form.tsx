"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, AmountField, Button, CalendarIcon, Card, CheckCircleIcon, CorrectedValueField, PencilIcon, RotateCcwIcon, TextField, WalletIcon } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createAdvanceAction, type CreateAdvanceFormState } from "./actions";
import { parseCreateAdvanceForm } from "./parse";

export interface AdvanceFormInitialValues {
  amount?: string;
  reason?: string;
  paymentMethod?: string;
  givenAt?: string;
}

function SubmitButton({ label, correcting }: { label: string; correcting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {correcting ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {label}
    </Button>
  );
}

const initialState: CreateAdvanceFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type AdvanceFormProps = {
  teamMemberId: string;
  initial?: AdvanceFormInitialValues;
} & (
  | { mode: "new"; correctsId?: undefined; originalAmount?: undefined }
  // The value currently on the ledger — CorrectedValueField reads it so the
  // user types the corrected amount, never a delta they computed in their
  // head (simplicity review 2026-09-01, decision D4).
  | { mode: "correct"; correctsId: string; originalAmount: number }
);

export function AdvanceForm({ mode, teamMemberId, correctsId, originalAmount, initial }: AdvanceFormProps) {
  const [state, formAction] = useActionState(createAdvanceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  // Inline pre-submit validation via the same parse the Server Action runs
  // (AD-7) — the confirmation dialog only opens once the input parses.
  const validation = useClientValidation(parseCreateAdvanceForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <form ref={formRef} action={formAction} onSubmit={validation.guard(confirmation.guard())} noValidate>
      <input type="hidden" name="teamMemberId" value={teamMemberId} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Advance is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField
            label="Reason for this correction"
            name="correctionReason"
            required
            icon={<PencilIcon className="size-4" />}
            error={errorFor("correctionReason")}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        {mode === "correct" ? (
          <CorrectedValueField
            label="Corrected amount"
            name="amount"
            originalValue={originalAmount}
            unit="₹"
            required
            error={errorFor("amount")}
          />
        ) : (
          <AmountField label="Amount" name="amount" required defaultValue={initial?.amount} error={errorFor("amount")} />
        )}
        <TextField
          label="Date"
          name="givenAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.givenAt ?? todayDate()}
          error={errorFor("givenAt")}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Reason"
          name="reason"
          hint="Optional — why this Advance was given, e.g. medical emergency"
          icon={<PencilIcon className="size-4" />}
          defaultValue={initial?.reason}
          error={errorFor("reason")}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          icon={<WalletIcon className="size-4" />}
          placeholder="e.g. Cash, Bank Transfer"
          defaultValue={initial?.paymentMethod}
          error={errorFor("paymentMethod")}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Advance"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={mode === "correct" ? "Submit this correction?" : "Record this Advance?"}
        description={mode === "correct" ? "A correction is a new, permanent ledger entry — please re-verify the details." : "An Advance immediately updates the Outstanding Balance — please re-verify the amount."}
        confirmLabel={"Confirm & Submit"}
        onConfirm={confirmation.confirm}
      >
        {/* In correct mode the submitted "amount" field carries the signed
            delta derived from the typed corrected value — label it as the
            change so the replay stays truthful. */}
        <ConfirmDialogRow label={mode === "correct" ? "Amount change" : "Amount"} value={formValue(confirmation.values, "amount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "correctionReason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
