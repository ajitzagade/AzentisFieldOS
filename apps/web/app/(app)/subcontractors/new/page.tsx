"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, MailIcon, MapPinIcon, PhoneIcon, PlusIcon, TagsField, TextField, UserIcon } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createSubcontractorAction, type CreateSubcontractorFormState } from "./actions";
import { parseCreateSubcontractorForm } from "./parse";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Create Subcontractor
    </Button>
  );
}

const initialState: CreateSubcontractorFormState = {};

export default function NewSubcontractorPage() {
  const [state, formAction] = useActionState(createSubcontractorAction, initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateSubcontractorForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Subcontractor</h1>
      <Card>
        <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            placeholder="e.g. Ganesh Pipeline Works"
            error={errorFor("name")}
          />
          <TextField
            label="Contact person"
            name="contactPerson"
            hint="Optional"
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            error={errorFor("contactPerson")}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            hint="Optional"
            maxLength={50}
            icon={<PhoneIcon className="size-4" />}
            placeholder="e.g. 98220 55671"
            error={errorFor("phone")}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            hint="Optional"
            maxLength={200}
            icon={<MailIcon className="size-4" />}
            placeholder="name@company.com"
            error={errorFor("email")}
          />
          <TextField
            label="Address"
            name="address"
            hint="Optional"
            maxLength={500}
            icon={<MapPinIcon className="size-4" />}
            error={errorFor("address")}
          />
          <TagsField label="Work categories" name="workCategories" error={errorFor("workCategories")} />

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
