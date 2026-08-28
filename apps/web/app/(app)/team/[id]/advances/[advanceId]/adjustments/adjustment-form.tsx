"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, AmountField, Button, CalendarIcon, Card, CheckCircleIcon, PencilIcon, RotateCcwIcon, TextField } from "@azentisfieldos/ui";
import { createAdvanceAdjustmentAction, type CreateAdvanceAdjustmentFormState } from "./actions";

export interface AdjustmentFormInitialValues {
  note?: string;
  adjustedAt?: string;
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

const initialState: CreateAdvanceAdjustmentFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(amount: string) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function AdjustmentForm({
  mode,
  teamMemberId,
  advanceId,
  correctsId,
  outstandingBalance,
  initial,
}: {
  mode: "new" | "correct";
  teamMemberId: string;
  advanceId: string;
  correctsId?: string;
  outstandingBalance: string;
  initial?: AdjustmentFormInitialValues;
}) {
  const [state, formAction] = useActionState(createAdvanceAdjustmentAction, initialState);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();

  return (
    <form action={formAction} onSubmit={confirmation.guard()} noValidate>
      <input type="hidden" name="teamMemberId" value={teamMemberId} />
      <input type="hidden" name="advanceId" value={advanceId} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Adjustment is never edited or deleted (AD-9). Enter the
            amount to add or remove as a signed adjustment (e.g. -1000), not the corrected total.
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
          label={mode === "correct" ? "Amount adjustment" : "Adjustment amount"}
          name="amount"
          required
          hint={
            mode === "correct"
              ? "Signed delta applied on top of the current balance — e.g. -1000."
              : `Cannot exceed ${formatMoney(outstandingBalance)} (current Outstanding Balance)`
          }
          error={state.errors?.amount?.[0]}
        />
        <TextField
          label="Date"
          name="adjustedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.adjustedAt ?? todayDate()}
          error={state.errors?.adjustedAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Reason"
          name="note"
          hint="Optional — e.g. adjusted against this week's payment"
          icon={<PencilIcon className="size-4" />}
          defaultValue={initial?.note}
          error={state.errors?.note?.[0]}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Adjustment"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={mode === "correct" ? "Submit this correction?" : "Record this Adjustment?"}
        description={mode === "correct" ? "A correction is a new, permanent ledger entry — please re-verify the details." : "An Adjustment permanently reduces the Outstanding Balance — please re-verify the amount."}
        confirmLabel={"Confirm & Submit"}
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Amount" value={formValue(confirmation.values, "amount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
