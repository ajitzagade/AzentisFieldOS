"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, AmountField, Button, CalendarIcon, Card, CheckCircleIcon, PencilIcon, RotateCcwIcon, TextField, WalletIcon } from "@azentisfieldos/ui";
import { createAdvanceAction, type CreateAdvanceFormState } from "./actions";

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

export function AdvanceForm({
  mode,
  teamMemberId,
  correctsId,
  initial,
}: {
  mode: "new" | "correct";
  teamMemberId: string;
  correctsId?: string;
  initial?: AdvanceFormInitialValues;
}) {
  const [state, formAction] = useActionState(createAdvanceAction, initialState);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();

  return (
    <form action={formAction} onSubmit={confirmation.guard()} noValidate>
      <input type="hidden" name="teamMemberId" value={teamMemberId} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Advance is never edited or deleted (AD-9). Enter the
            amount to add or remove as a signed adjustment (e.g. -2000), not the corrected total.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField
            label="Reason for this correction"
            name="correctionReason"
            required
            icon={<PencilIcon className="size-4" />}
            error={state.errors?.correctionReason?.[0]}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        <AmountField
          label={mode === "correct" ? "Amount adjustment" : "Amount"}
          name="amount"
          required
          defaultValue={initial?.amount}
          hint={mode === "correct" ? "Signed delta applied on top of the current balance — e.g. -2000." : undefined}
          error={state.errors?.amount?.[0]}
        />
        <TextField
          label="Date"
          name="givenAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.givenAt ?? todayDate()}
          error={state.errors?.givenAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Reason"
          name="reason"
          hint="Optional — why this Advance was given, e.g. medical emergency"
          icon={<PencilIcon className="size-4" />}
          defaultValue={initial?.reason}
          error={state.errors?.reason?.[0]}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          icon={<WalletIcon className="size-4" />}
          placeholder="e.g. Cash, Bank Transfer"
          defaultValue={initial?.paymentMethod}
          error={state.errors?.paymentMethod?.[0]}
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
        <ConfirmDialogRow label="Amount" value={formValue(confirmation.values, "amount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
