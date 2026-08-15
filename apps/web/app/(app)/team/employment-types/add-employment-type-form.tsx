"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, PlusIcon, TextField } from "@azentisfieldos/ui";
import { createEmploymentTypeAction, type CreateEmploymentTypeFormState } from "./actions";

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

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex items-end gap-2">
      <div className="flex-1">
        <TextField label="Employment Type name" name="name" required maxLength={100} error={state.errors?.name?.[0]} />
      </div>
      <SubmitButton />
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
