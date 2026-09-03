"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, FilterIcon, HashIcon, MapPinIcon, PlusIcon, SelectField, TextField, TextareaField } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createSiteAction, type CreateSiteFormState } from "./actions";
import { parseCreateSiteForm } from "./parse";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Create Site
    </Button>
  );
}

const initialState: CreateSiteFormState = {};

export default function NewSitePage() {
  const [state, formAction] = useActionState(createSiteAction, initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateSiteForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Site</h1>
      <Card>
        <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<MapPinIcon className="size-4" />}
            placeholder="e.g. Riverside Tower"
            error={errorFor("name")}
          />
          <TextField
            label="Location"
            name="location"
            required
            maxLength={500}
            icon={<MapPinIcon className="size-4" />}
            placeholder="e.g. 12 MG Road, Pune"
            error={errorFor("location")}
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue="ACTIVE"
            icon={<FilterIcon className="size-4" />}
            options={STATUS_OPTIONS}
            error={errorFor("status")}
          />
          <TextField
            label="Contract reference"
            name="contractReference"
            hint="Optional"
            maxLength={200}
            icon={<HashIcon className="size-4" />}
            error={errorFor("contractReference")}
          />
          <TextareaField
            label="Description"
            name="description"
            hint="Optional"
            rows={3}
            maxLength={2000}
            error={errorFor("description")}
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
