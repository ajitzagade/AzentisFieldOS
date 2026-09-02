"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AmountField,
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ConfirmDialog,
  ConfirmDialogRow,
  CorrectedValueField,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  formValue,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { requireOriginal } from "@/lib/require-original";
import { createSubcontractorPaymentAction, type SubcontractorPaymentFormState } from "./actions";
import { parseSubcontractorPaymentForm } from "./parse";

export interface SubcontractorPaymentFormInitialValues {
  type?: "ADVANCE" | "PAYMENT";
  amount?: number;
  paymentMethod?: string;
  paidAt?: string;
  note?: string;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function SubmitButton({ correcting }: { correcting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {correcting ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {correcting ? "Submit Correction" : "Record Payment"}
    </Button>
  );
}

const initialState: SubcontractorPaymentFormState = {};

export function SubcontractorPaymentForm({
  mode,
  siteId,
  contractId,
  correctsId,
  initial,
  amountPayable,
}: {
  mode: "new" | "correct";
  siteId: string;
  contractId: string;
  correctsId?: string;
  initial?: SubcontractorPaymentFormInitialValues;
  // FR-59 AC #2: no payable cap — an amount that exceeds this is legitimate
  // (an advance ahead of completed work). Only present for a fresh Payment;
  // undefined suppresses the informational note below.
  amountPayable?: number | null;
}) {
  const action = createSubcontractorPaymentAction.bind(null, siteId, contractId);
  const [state, formAction] = useActionState(action, initialState);
  const validation = useClientValidation(parseSubcontractorPaymentForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const confirmation = useSubmitConfirmation();
  const [amountEntered, setAmountEntered] = useState<number | null>(initial?.amount ?? null);
  const exceedsPayable =
    mode === "new" &&
    amountPayable !== undefined &&
    amountPayable !== null &&
    amountEntered !== null &&
    amountEntered > amountPayable;

  return (
    <form
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
            This creates a new, linked entry — the original Payment is never edited or deleted (AD-9).
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
        <SelectField
          label="Type"
          name="type"
          required
          disabled={mode === "correct"}
          defaultValue={initial?.type ?? "PAYMENT"}
          options={[
            { value: "PAYMENT", label: "Payment" },
            { value: "ADVANCE", label: "Advance" },
          ]}
          error={errorFor("type")}
        />
        {mode === "correct" ? <input type="hidden" name="type" value={initial?.type} /> : null}

        {mode === "correct" ? (
          <CorrectedValueField
            label="Corrected amount"
            name="amount"
            originalValue={requireOriginal(initial?.amount, "amount")}
            unit="₹"
            required
            error={errorFor("amount")}
          />
        ) : (
          <>
            <AmountField
              label="Amount"
              name="amount"
              required
              defaultValue={initial?.amount ?? ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                setAmountEntered(e.target.value === "" || Number.isNaN(value) ? null : value);
              }}
              error={errorFor("amount")}
            />
            {exceedsPayable ? (
              <p className="mb-4 text-body-sm text-ink-700">
                This exceeds the current amount payable — recorded as an advance against future work.
              </p>
            ) : null}
          </>
        )}

        <TextField
          label="Payment method"
          name="paymentMethod"
          hint="Optional — e.g. Bank transfer, UPI, Cash"
          defaultValue={initial?.paymentMethod ?? ""}
          error={errorFor("paymentMethod")}
        />
        <TextField
          label="Date"
          name="paidAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.paidAt ?? todayDate()}
          error={errorFor("paidAt")}
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
        <ConfirmDialogRow label="Amount change" value={formValue(confirmation.values, "amount")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
