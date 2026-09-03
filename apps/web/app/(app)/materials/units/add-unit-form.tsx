"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createUnitAction, type CreateUnitFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Unit
    </Button>
  );
}

const initialState: CreateUnitFormState = {};

export function AddUnitForm() {
  const [state, formAction] = useActionState(createUnitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <form ref={formRef} action={formAction} noValidate className="flex items-start gap-2">
      <div className="flex-1">
        <TextField
          label="Unit name"
          name="name"
          required
          maxLength={50}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Bag, Cum, Ton"
          error={state.errors?.name?.[0]}
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
