"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createEmploymentTypeAction, type CreateEmploymentTypeFormState } from "./actions";
import { parseCreateEmploymentTypeForm } from "./parse";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Employment Type
    </Button>
  );
}

const initialState: CreateEmploymentTypeFormState = {};

export function AddEmploymentTypeForm() {
  const [state, formAction] = useActionState(createEmploymentTypeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateEmploymentTypeForm);

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate className="flex items-start gap-2">
      <div className="flex-1">
        <TextField
          label="Employment Type name"
          name="name"
          required
          maxLength={100}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Daily Wage, Monthly"
          error={validation.errors.name?.[0] ?? state.errors?.name?.[0]}
        />
      </div>
      <div className="mt-6">
        <SubmitButton />
      </div>
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
