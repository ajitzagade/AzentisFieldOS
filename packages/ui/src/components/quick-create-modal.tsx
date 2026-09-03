"use client";

import { type FormEvent, type ReactNode, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui-components/react/dialog";
import { Button } from "./button";
import { usePreventFormResetOnError } from "../lib/use-prevent-form-reset-on-error";

export interface QuickCreateResult {
  id: string;
  name: string;
}

export interface QuickCreateFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only on a resolved success — mirrors the
   * createAdvanceAction/createAdvanceQuickAction split (never set by a
   * redirecting full-page action, which this modal never calls). */
  success?: boolean;
  id?: string;
  name?: string;
}

export interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** The bound createXQuickAction Server Action — resolves
   * { success: true, id, name } instead of redirecting. */
  action: (prevState: QuickCreateFormState, formData: FormData) => Promise<QuickCreateFormState>;
  /** Composed by the caller from useClientValidation(parseCreateXForm)
   * (AD-7) — the same sibling parse.ts the Server Action itself runs. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  validationErrors?: Record<string, string[]>;
  /** Fires once when the action resolves { success: true, id, name } — the
   * caller prepends the record into its picker's local options and selects
   * it, then closes the modal (this modal never redirects, so it never uses
   * the ?flash= pattern). */
  onSuccess: (result: QuickCreateResult) => void;
  submitLabel: string;
  submitIcon?: ReactNode;
  /** Render prop so this shell stays generic across every entity's field
   * set — receives the same errorFor(field) merge of client + server
   * validation every other form in the app uses. */
  children: (errorFor: (field: string) => string | undefined) => ReactNode;
}

const initialState: QuickCreateFormState = {};

function SubmitButton({ label, icon }: { label: string; icon?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {icon}
      {label}
    </Button>
  );
}

// The single generic "+ Add {label}" modal shell (AD-5) — every quick-create
// wrapper (Vendor, Subcontractor, Material, Team Member) is a thin caller of
// this component, never a re-forked Dialog. Modeled on
// advance-quick-entry-modal.tsx: Base UI's plain Dialog (this modal IS the
// primary action, not a confirmation layered on one), useActionState +
// usePreventFormResetOnError so a server-returned validation error never
// wipes what the user typed, and an announcedRef guard so onSuccess only
// fires once per resolved success within a single mount. The caller keys
// this component (key={formKey}) so it remounts fresh every time it's
// reopened — useActionState's internal state otherwise outlives a
// close/reopen cycle.
export function QuickCreateModal({
  open,
  onOpenChange,
  title,
  description,
  action,
  onSubmit,
  validationErrors,
  onSuccess,
  submitLabel,
  submitIcon,
  children,
}: QuickCreateModalProps) {
  const [state, dispatch] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  const announcedRef = useRef(false);
  useEffect(() => {
    if (state.success && state.id && state.name && !announcedRef.current) {
      announcedRef.current = true;
      onSuccess({ id: state.id, name: state.name });
    }
  }, [state.success, state.id, state.name, onSuccess]);

  const errorFor = (field: string) => validationErrors?.[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-1 p-6 shadow-3">
          <Dialog.Title className="mb-1 text-card-title text-ink-900">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mb-4 text-body-sm text-ink-500">{description}</Dialog.Description> : null}

          <form
            ref={formRef}
            action={dispatch}
            // Every caller renders this modal as a JSX descendant of the
            // originating picker's own <form> (the parent form is exactly
            // where the "+ Add X" button lives) — React bubbles a submit
            // event through the *React* tree even across this Dialog's
            // portal, so without stopPropagation the parent form's own
            // onSubmit/action would also fire on every quick-create submit,
            // running the parent's validation against the wrong FormData and
            // potentially double-submitting. This never showed up in
            // AdvanceQuickEntryModal (this shell's template) because that
            // modal is never nested inside another <form>.
            onSubmit={(event) => {
              event.stopPropagation();
              onSubmit?.(event);
            }}
            noValidate
          >
            {children(errorFor)}

            {state.formError ? (
              <p role="alert" className="mb-4 text-caption text-danger-700">
                {state.formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close render={<Button type="button" variant="secondary" />}>Cancel</Dialog.Close>
              <SubmitButton label={submitLabel} icon={submitIcon} />
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
