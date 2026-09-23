"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AmountField, Button, Card, LayersIcon, PlusIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { DAILY_LABOURER_CATEGORIES } from "@azentisfieldos/shared";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createDailyLabourerAction, type CreateDailyLabourerFormState } from "./actions";
import { parseCreateDailyLabourerForm } from "./parse";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Labourer
    </Button>
  );
}

const initialState: CreateDailyLabourerFormState = {};

export function NewLabourerForm() {
  const [state, formAction] = useActionState(createDailyLabourerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const validation = useClientValidation(parseCreateDailyLabourerForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <Card>
      <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Labour Name"
          name="name"
          required
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          error={errorFor("name")}
        />
        <SelectField
          label="Labour Category"
          name="category"
          required
          icon={<LayersIcon className="size-4" />}
          defaultValue=""
          options={[
            { value: "", label: "Select a Category" },
            ...DAILY_LABOURER_CATEGORIES.map((category) => ({ value: category, label: category })),
          ]}
          error={errorFor("category")}
        />
        <AmountField
          label="Default Per-Day Amount"
          name="defaultPerDayAmount"
          hint="Optional — prefills the quick-amount buttons on this Labourer's attendance entries"
          error={errorFor("defaultPerDayAmount")}
        />

        {state.formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </Card>
  );
}
