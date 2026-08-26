"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { createExpenseCategoryAction, type CreateExpenseCategoryFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Category
    </Button>
  );
}

const initialState: CreateExpenseCategoryFormState = {};

export function AddExpenseCategoryForm() {
  const [state, formAction] = useActionState(createExpenseCategoryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label="Expense Category name"
          name="name"
          required
          maxLength={100}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Material, Fuel, Repairs"
          error={state.errors?.name?.[0]}
        />
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
