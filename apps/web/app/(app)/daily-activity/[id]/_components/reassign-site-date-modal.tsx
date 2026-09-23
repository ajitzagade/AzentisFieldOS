"use client";

import { type FormEvent, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui-components/react/dialog";
import { ArrowsIcon, Button, CalendarIcon, TextField } from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { SiteField, type SiteOption } from "../../../_components/site-field";
import type { ReassignSiteDateFormState } from "../reassign-actions";

export interface ReassignSiteDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fetched by the caller on open (ReassignSiteDateTrigger) — this modal
   * never fetches its own data, same convention as AdvanceQuickEntryModal. */
  sites: SiteOption[];
  sitesLoading?: boolean;
  sitesError?: string | null;
  currentSiteId: string;
  currentReportDate: string;
  /** The bound reassignDsrSiteDateAction Server Action (dsrId already
   * bound by the caller — useActionState reserves the first two args for
   * (prevState, formData), same .bind(null, id) convention as
   * completePricingAction/pricing-form.tsx). */
  action: (
    prevState: ReassignSiteDateFormState,
    formData: FormData,
  ) => Promise<ReassignSiteDateFormState>;
  /** Composed by the caller from useClientValidation(parseReassignSiteDateForm)
   * (AD-7) — the same sibling parse.ts the Server Action itself runs. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  validationErrors?: Record<string, string[]>;
  /** Fires once when the action resolves { success: true } — the caller
   * closes the modal and router.refresh()es (this modal never redirects). */
  onSuccess: () => void;
}

const initialState: ReassignSiteDateFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Reassign
    </Button>
  );
}

// spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" — a narrow,
// sanctioned AD-9 exception (same class as D7's Purchase-pricing
// completion, AGENTS.md), deliberately separate from the normal Edit/
// correction flow. Hand-rolled Base UI Dialog (same chrome as
// AdvanceQuickEntryModal/attendance-form-modal.tsx) rather than a new
// packages/ui primitive — this feature is small and has exactly one
// caller (the Daily Report detail page), so it lives beside that page.
export function ReassignSiteDateModal({
  open,
  onOpenChange,
  sites,
  sitesLoading,
  sitesError,
  currentSiteId,
  currentReportDate,
  action,
  onSubmit,
  validationErrors,
  onSuccess,
}: ReassignSiteDateModalProps) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  // The caller keys this component (key={formKey}) so it remounts fresh
  // every time it's reopened — useActionState's internal state otherwise
  // outlives a close/reopen cycle. This ref just guards against onSuccess
  // firing more than once per resolved success within a single mount.
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
          <Dialog.Title className="mb-1 flex items-center gap-2 text-card-title text-ink-900">
            <ArrowsIcon className="size-4" />
            Reassign Site/Date
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-body-sm text-ink-500">
            Moves this report to a different Site or date, in place. Only available for a report that
            has never been edited.
          </Dialog.Description>

          <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate>
            <SiteField
              sites={sites}
              initialSiteId={currentSiteId}
              remember={false}
              required
              disabled={sitesLoading}
              error={sitesError ?? errorFor("siteId")}
            />
            <TextField
              label="Date"
              name="reportDate"
              type="date"
              required
              icon={<CalendarIcon className="size-4" />}
              defaultValue={currentReportDate}
              error={errorFor("reportDate")}
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
