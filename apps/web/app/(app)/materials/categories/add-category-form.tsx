"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createMaterialCategoryAction, type CreateMaterialCategoryFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Category
    </Button>
  );
}

const initialState: CreateMaterialCategoryFormState = {};

export function AddCategoryForm() {
  const [state, formAction] = useActionState(createMaterialCategoryAction, initialState);
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
          label="Category name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Cement & Binders"
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
