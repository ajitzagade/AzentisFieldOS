"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, SelectField, TextField } from "@azentisfieldos/ui";
import { createSiteAction, type CreateSiteFormState } from "./actions";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Create Site
    </Button>
  );
}

const initialState: CreateSiteFormState = {};

export default function NewSitePage() {
  const [state, formAction] = useActionState(createSiteAction, initialState);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Site</h1>
      <Card>
        <form action={formAction} noValidate>
          <TextField label="Name" name="name" required maxLength={200} error={state.errors?.name?.[0]} />
          <TextField label="Location" name="location" required maxLength={500} error={state.errors?.location?.[0]} />
          <SelectField
            label="Status"
            name="status"
            defaultValue="ACTIVE"
            options={STATUS_OPTIONS}
            error={state.errors?.status?.[0]}
          />
          <TextField
            label="Contract reference"
            name="contractReference"
            hint="Optional"
            maxLength={200}
            error={state.errors?.contractReference?.[0]}
          />

          {state.formError ? (
            <p role="alert" className="mb-4 text-caption text-danger-700">
              {state.formError}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      </Card>
    </div>
  );
}
