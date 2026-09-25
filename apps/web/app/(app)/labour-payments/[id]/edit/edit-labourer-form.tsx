"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AmountField, Button, Card, CheckCircleIcon, LayersIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { DAILY_LABOURER_CATEGORIES } from "@azentisfieldos/shared";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { updateDailyLabourerAction, type UpdateDailyLabourerFormState } from "./actions";
import { parseUpdateDailyLabourerForm } from "./parse";
import type { EditableLabourer } from "./page";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateDailyLabourerFormState = {};

export function EditLabourerForm({ labourer }: { labourer: EditableLabourer }) {
  const [state, formAction] = useActionState(updateDailyLabourerAction.bind(null, labourer.id), initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const validation = useClientValidation(parseUpdateDailyLabourerForm);
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
          defaultValue={labourer.name}
          error={errorFor("name")}
        />
        <SelectField
          label="Labour Category"
          name="category"
          required
          icon={<LayersIcon className="size-4" />}
          defaultValue={labourer.category}
          options={DAILY_LABOURER_CATEGORIES.map((category) => ({ value: category, label: category }))}
          error={errorFor("category")}
        />
        <AmountField
          label="Default Per-Day Amount"
          name="defaultPerDayAmount"
          hint="Optional — prefills the quick-amount buttons on this Labourer's attendance entries"
          defaultValue={labourer.defaultPerDayAmount ?? ""}
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
