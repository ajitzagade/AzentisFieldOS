"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui-components/react/dialog";
import { AmountField, Button, CalendarIcon, CheckCircleIcon, SelectField, TextField } from "@azentisfieldos/ui";
import { formatMoney } from "@/lib/format";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createWeeklyPaymentAction, type LabourPaymentFormState } from "../actions";
import { parseCreateWeeklyPaymentForm } from "../parse";

export interface AdvanceOption {
  id: string;
  amount: number;
  givenAt: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Payment
    </Button>
  );
}

const initialState: LabourPaymentFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function WeeklyPaymentFormModal({
  open,
  onOpenChange,
  labourerId,
  weekStartDate,
  weekLabel,
  totalEarned,
  outstandingBalance,
  advances,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labourerId: string;
  weekStartDate: string;
  weekLabel: string;
  totalEarned: number;
  outstandingBalance: number;
  advances: AdvanceOption[];
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(createWeeklyPaymentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));
  const validation = useClientValidation(parseCreateWeeklyPaymentForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const [adjustAdvanceId, setAdjustAdvanceId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const netPayable = totalEarned - (Number(adjustAmount) || 0);

  const announcedRef = useRef(false);
  useEffect(() => {
    if (state.success && !announcedRef.current) {
      announcedRef.current = true;
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-1 p-6 shadow-3">
          <Dialog.Title className="mb-1 text-card-title text-ink-900">Make Payment</Dialog.Title>
          <Dialog.Description className="mb-4 text-body-sm text-ink-500">{weekLabel}</Dialog.Description>

          <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
            <input type="hidden" name="labourerId" value={labourerId} />
            <input type="hidden" name="weekStartDate" value={weekStartDate} />

            <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-body-sm text-ink-700">
              Total Earned this week: <span className="font-semibold">{formatMoney(totalEarned)}</span>
            </p>

            {advances.length > 0 ? (
              <>
                <SelectField
                  label="Adjust an Advance"
                  name="adjustAdvanceId"
                  hint={`Outstanding Advance Balance: ${formatMoney(outstandingBalance)}`}
                  value={adjustAdvanceId}
                  onChange={(e) => setAdjustAdvanceId(e.target.value)}
                  options={[
                    { value: "", label: "Don't adjust an advance this week" },
                    ...advances.map((a) => ({
                      value: a.id,
                      label: `${formatMoney(a.amount)} given ${a.givenAt}`,
                    })),
                  ]}
                />
                {adjustAdvanceId ? (
                  <>
                    <AmountField
                      label="Advance Amount to Adjust"
                      name="adjustAmount"
                      required
                      hint="You decide how much of the outstanding balance to adjust this week — never the full amount automatically"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      error={errorFor("advanceAdjustment")}
                    />
                    <TextField label="Adjustment Note" name="adjustNote" hint="Optional" />
                  </>
                ) : null}
              </>
            ) : null}

            <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-body-sm text-ink-700">
              Net Payable: <span className="font-semibold">{formatMoney(netPayable)}</span>
            </p>

            <AmountField label="Amount Paid" name="amountPaid" required error={errorFor("amountPaid")} />
            <SelectField
              label="Payment Status"
              name="status"
              required
              defaultValue="PAID"
              options={[
                { value: "PAID", label: "Paid" },
                { value: "PARTIAL", label: "Partial" },
                { value: "UNPAID", label: "Unpaid" },
              ]}
              error={errorFor("status")}
            />
            <TextField
              label="Payment Date"
              name="paidAt"
              type="date"
              icon={<CalendarIcon className="size-4" />}
              defaultValue={todayDate()}
              error={errorFor("paidAt")}
            />

            {state.formError ? (
              <p role="alert" className="mb-4 text-caption text-danger-700">
                {state.formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close render={<Button type="button" variant="secondary" />}>Cancel</Dialog.Close>
              <SubmitButton />
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
