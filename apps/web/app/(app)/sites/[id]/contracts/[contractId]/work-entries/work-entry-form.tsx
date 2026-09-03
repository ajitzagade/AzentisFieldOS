"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ConfirmDialog,
  ConfirmDialogRow,
  CorrectedValueField,
  HashIcon,
  PencilIcon,
  RotateCcwIcon,
  TextField,
  formValue,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { requireOriginal } from "@/lib/require-original";
import { createWorkEntryAction, type WorkEntryFormState } from "./actions";
import { parseWorkEntryForm } from "./parse";

export interface WorkEntryFormInitialValues {
  quantity?: number;
  workDate?: string;
  note?: string;
}

function SubmitButton({ correcting }: { correcting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {correcting ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {correcting ? "Submit Correction" : "Log Work"}
    </Button>
  );
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const initialState: WorkEntryFormState = {};

export function WorkEntryForm({
  mode,
  siteId,
  contractId,
  correctsId,
  quantityUnitLabel,
  initial,
}: {
  mode: "new" | "correct";
  siteId: string;
  contractId: string;
  correctsId?: string;
  /** e.g. "trips", "pipes", "bags" — restates the unit on the quantity label. */
  quantityUnitLabel: string;
  initial?: WorkEntryFormInitialValues;
}) {
  const action = createWorkEntryAction.bind(null, siteId, contractId);
  const [state, formAction] = useActionState(action, initialState);
  const validation = useClientValidation(parseWorkEntryForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const confirmation = useSubmitConfirmation();

  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={mode === "correct" ? validation.guard(confirmation.guard()) : validation.guard()}
      noValidate
    >
      <input type="hidden" name="siteContractId" value={contractId} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Work Entry is never edited or deleted (AD-9).
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
      ) : null}

      <Card>
        {mode === "correct" ? (
          <CorrectedValueField
            label={`Corrected quantity (${quantityUnitLabel})`}
            name="quantity"
            originalValue={requireOriginal(initial?.quantity, "quantity")}
            unit={quantityUnitLabel}
            required
            error={errorFor("quantity")}
          />
        ) : (
          <TextField
            label={`Quantity (${quantityUnitLabel})`}
            name="quantity"
            type="number"
            step="any"
            min={0}
            inputMode="decimal"
            required
            icon={<HashIcon className="size-4" />}
            error={errorFor("quantity")}
          />
        )}
        <TextField
          label="Date"
          name="workDate"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.workDate ?? todayDate()}
          error={errorFor("workDate")}
        />
        <TextField
          label="Note"
          name="note"
          hint="Optional"
          icon={<PencilIcon className="size-4" />}
          defaultValue={initial?.note ?? ""}
          error={errorFor("note")}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mt-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <div className="mt-4">
        <SubmitButton correcting={mode === "correct"} />
      </div>

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Submit this correction?"
        description="A correction is a new, permanent ledger entry — please re-verify the details."
        confirmLabel="Submit Correction"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Quantity change" value={formValue(confirmation.values, "quantity")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
