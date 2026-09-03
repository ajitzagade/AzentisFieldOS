"use client";

import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui-components/react/dialog";
import { AmountField } from "./amount-field";
import { Button } from "./button";
import { ComboboxField } from "./combobox-field";
import { TextField } from "./field";
import { usePreventFormResetOnError } from "../lib/use-prevent-form-reset-on-error";
import { CalendarIcon } from "../icons/calendar-icon";
import { CheckCircleIcon } from "../icons/check-circle-icon";
import { PencilIcon } from "../icons/pencil-icon";
import { UserIcon } from "../icons/user-icon";

export interface AdvanceQuickEntryTeamMemberOption {
  id: string;
  name: string;
}

export interface AdvanceQuickEntryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
}

export interface AdvanceQuickEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Full-ish Team Member list — fetched by the caller on open; this
   * component never fetches its own data (matches SearchPalette's
   * prop-driven precedent). */
  teamMembers: AdvanceQuickEntryTeamMemberOption[];
  teamMembersLoading?: boolean;
  /** Set when the caller's on-open GET /team-members failed — the
   * combobox shows this inline instead of blocking the rest of the modal. */
  teamMembersError?: string | null;
  /** The bound createAdvanceQuickAction Server Action — resolves
   * { success: true } instead of redirecting. */
  action: (
    prevState: AdvanceQuickEntryFormState,
    formData: FormData,
  ) => Promise<AdvanceQuickEntryFormState>;
  /** Composed by the caller from useClientValidation(parseCreateAdvanceForm)
   * (AD-7) — the same sibling parse.ts the Server Action itself runs. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  validationErrors?: Record<string, string[]>;
  /** Fires once when the action resolves { success: true } — the caller
   * closes the modal and shows the success toast (this modal never
   * redirects, so it never uses the ?flash= pattern). */
  onSuccess: () => void;
}

const initialState: AdvanceQuickEntryFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Record Advance
    </Button>
  );
}

// Story 19.1 (AD-5): the Dashboard's one-step Advance entry point — a new
// shared primitive, not a fork of the full advances/advance-form.tsx (its
// mode="new"/"correct" behavior and redirect-on-success are untouched).
// Built on Base UI's plain Dialog (matching SearchPalette's chrome, not
// ConfirmDialog's AlertDialog — this modal IS the primary action here, not
// a confirmation layered on top of one; the "lightweight" framing in the
// spec rules out an extra confirm step). Prop-driven, no data fetching, no
// next/navigation dependency — the caller (apps/web's
// AdvanceQuickEntryTrigger) owns the Team Member fetch, the bound Server
// Action, client validation, and the success toast.
export function AdvanceQuickEntryModal({
  open,
  onOpenChange,
  teamMembers,
  teamMembersLoading,
  teamMembersError,
  action,
  onSubmit,
  validationErrors,
  onSuccess,
}: AdvanceQuickEntryModalProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [teamMemberId, setTeamMemberId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  // The caller keys this component so it remounts fresh every time it's
  // reopened (useActionState's internal state otherwise outlives a
  // close/reopen cycle) — this ref just guards against onSuccess firing
  // more than once per resolved success within a single mount.
  const announcedRef = useRef(false);
  useEffect(() => {
    if (state.success && !announcedRef.current) {
      announcedRef.current = true;
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const errorFor = (field: string) => validationErrors?.[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-1 p-6 shadow-3">
          <Dialog.Title className="mb-1 text-card-title text-ink-900">Record Advance</Dialog.Title>
          <Dialog.Description className="mb-4 text-body-sm text-ink-500">
            Creates the same Advance record as the full form — updates the Outstanding Balance immediately.
          </Dialog.Description>

          <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate>
            <ComboboxField
              label="Team Member"
              required
              icon={<UserIcon className="size-4" />}
              options={teamMembers.map((member) => ({ value: member.id, label: member.name }))}
              value={teamMemberId || null}
              onValueChange={(value) => setTeamMemberId(value ?? "")}
              placeholder="Type a name…"
              emptyMessage="No matching Team Member"
              loading={teamMembersLoading}
              disabled={Boolean(teamMembersError)}
              error={teamMembersError ?? errorFor("teamMemberId")}
            />
            <input type="hidden" name="teamMemberId" value={teamMemberId} />

            <AmountField label="Amount" name="amount" required error={errorFor("amount")} />
            <TextField
              label="Date"
              name="givenAt"
              type="date"
              required
              icon={<CalendarIcon className="size-4" />}
              defaultValue={todayDate()}
              error={errorFor("givenAt")}
            />
            <TextField
              label="Reason"
              name="reason"
              hint="Optional — why this Advance was given"
              icon={<PencilIcon className="size-4" />}
              error={errorFor("reason")}
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
