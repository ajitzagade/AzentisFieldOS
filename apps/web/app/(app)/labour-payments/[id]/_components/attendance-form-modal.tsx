"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui-components/react/dialog";
import {
  AmountField,
  Button,
  CalendarIcon,
  CheckCircleIcon,
  SelectField,
  TextField,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { SiteField, type SiteOption } from "../../../_components/site-field";
import { createAttendanceAction, type LabourPaymentFormState } from "../actions";
import { parseCreateAttendanceForm } from "../parse";

const QUICK_AMOUNTS = [800, 900, 1000];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save
    </Button>
  );
}

const initialState: LabourPaymentFormState = {};

export function AttendanceFormModal({
  open,
  onOpenChange,
  labourerId,
  defaultPerDayAmount,
  workDate,
  shift,
  sites,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labourerId: string;
  defaultPerDayAmount: number | null;
  workDate: string;
  shift: "DAY" | "NIGHT";
  sites: SiteOption[];
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(createAttendanceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));
  const validation = useClientValidation(parseCreateAttendanceForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const [attended, setAttended] = useState(true);
  const [perDayAmount, setPerDayAmount] = useState(defaultPerDayAmount ? String(defaultPerDayAmount) : "");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [advanceGiven, setAdvanceGiven] = useState(false);

  // Tracks the last Full-Day amount the user actually saw/entered, so
  // toggling Day Type can always suggest a live half/full figure instead of
  // a stale `defaultPerDayAmount` (which is often null for a first-time
  // entry, silently no-op'ing the toggle) or ignoring a quick-amount/typed
  // value the user picked after opening the modal.
  const fullDayAmountRef = useRef(defaultPerDayAmount ? String(defaultPerDayAmount) : "");

  function handlePerDayAmountChange(value: string) {
    setPerDayAmount(value);
    if (!isHalfDay) fullDayAmountRef.current = value;
  }

  function handleDayTypeChange(half: boolean) {
    setIsHalfDay(half);
    if (half) {
      const base = Number(perDayAmount || fullDayAmountRef.current || defaultPerDayAmount || 0);
      if (base > 0) setPerDayAmount(String(base / 2));
    } else if (fullDayAmountRef.current) {
      setPerDayAmount(fullDayAmountRef.current);
    }
  }

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
          <Dialog.Title className="mb-1 text-card-title text-ink-900">Record Attendance</Dialog.Title>
          <Dialog.Description className="mb-4 text-body-sm text-ink-500">
            {workDate} · {shift === "DAY" ? "Day" : "Night"} shift
          </Dialog.Description>

          <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
            <input type="hidden" name="labourerId" value={labourerId} />
            <input type="hidden" name="workDate" value={workDate} />
            <input type="hidden" name="shift" value={shift} />
            <input type="hidden" name="attended" value={attended ? "1" : "0"} />
            <input type="hidden" name="isHalfDay" value={isHalfDay ? "1" : "0"} />

            <SiteField sites={sites} required error={errorFor("siteId")} />

            <SelectField
              label="Attended"
              name="attendedSelect"
              icon={<CalendarIcon className="size-4" />}
              value={attended ? "1" : "0"}
              onChange={(e) => {
                const nowAttended = e.target.value === "1";
                setAttended(nowAttended);
                if (!nowAttended) setIsHalfDay(false);
              }}
              options={[
                { value: "1", label: "Present" },
                { value: "0", label: "Absent" },
              ]}
            />

            {attended ? (
              <SelectField
                label={shift === "NIGHT" ? "Night Type" : "Day Type"}
                name="dayTypeSelect"
                value={isHalfDay ? "half" : "full"}
                onChange={(e) => handleDayTypeChange(e.target.value === "half")}
                hint={`Half ${shift === "NIGHT" ? "Night" : "Day"} only suggests half the amount below — always editable`}
                options={
                  shift === "NIGHT"
                    ? [
                        { value: "full", label: "Full Night" },
                        { value: "half", label: "Half Night" },
                      ]
                    : [
                        { value: "full", label: "Full Day" },
                        { value: "half", label: "Half Day" },
                      ]
                }
              />
            ) : null}

            <div className="mb-1 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={perDayAmount === String(amount) ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    fullDayAmountRef.current = String(amount);
                    setPerDayAmount(isHalfDay ? String(amount / 2) : String(amount));
                  }}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
            <AmountField
              label="Per-Day Amount"
              name="perDayAmount"
              required
              hint="Quick amounts above stay editable — type any other figure directly"
              value={perDayAmount}
              onChange={(e) => handlePerDayAmountChange(e.target.value)}
              error={errorFor("perDayAmount")}
            />

            <label className="mb-4 flex items-center gap-2 text-body-sm text-ink-900">
              <input
                type="checkbox"
                name="advanceGivenCheckbox"
                checked={advanceGiven}
                onChange={(e) => setAdvanceGiven(e.target.checked)}
                className="size-4"
              />
              Advance given today
            </label>
            <input type="hidden" name="advanceGiven" value={advanceGiven ? "1" : "0"} />

            {advanceGiven ? (
              <>
                <AmountField
                  label="Advance Amount"
                  name="advanceAmount"
                  required
                  error={errorFor("advance")}
                />
                <TextField label="Description / Notes" name="advanceDescription" hint="Optional" />
              </>
            ) : null}

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
