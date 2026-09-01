"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, FilterIcon, HashIcon, MapPinIcon, SelectField, TextField, TextareaField } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { updateSiteAction, type UpdateSiteFormState } from "./actions";
import { parseUpdateSiteForm } from "./parse";
import type { Site } from "../../page";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateSiteFormState = {};

export function EditSiteForm({ site }: { site: Site }) {
  const [state, formAction] = useActionState(updateSiteAction.bind(null, site.id), initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateSiteForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<MapPinIcon className="size-4" />}
          defaultValue={site.name}
          error={errorFor("name")}
        />
        <TextField
          label="Location"
          name="location"
          required
          maxLength={500}
          icon={<MapPinIcon className="size-4" />}
          defaultValue={site.location}
          error={errorFor("location")}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={site.status}
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
          defaultValue={site.contractReference ?? ""}
          error={errorFor("contractReference")}
        />
        <TextareaField
          label="Description"
          name="description"
          hint="Optional"
          rows={3}
          maxLength={2000}
          defaultValue={site.description ?? ""}
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
  );
}
