"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, MailIcon, MapPinIcon, PhoneIcon, TagsField, TextField, UserIcon } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { updateSubcontractorAction, type UpdateSubcontractorFormState } from "./actions";
import { parseUpdateSubcontractorForm } from "./parse";
import type { Subcontractor } from "../../page";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateSubcontractorFormState = {};

export function EditSubcontractorForm({ subcontractor }: { subcontractor: Subcontractor }) {
  const [state, formAction] = useActionState(updateSubcontractorAction.bind(null, subcontractor.id), initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateSubcontractorForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <Card>
      <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={subcontractor.name}
          error={errorFor("name")}
        />
        <TextField
          label="Contact person"
          name="contactPerson"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={subcontractor.contactPerson ?? ""}
          error={errorFor("contactPerson")}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          hint="Optional"
          maxLength={50}
          icon={<PhoneIcon className="size-4" />}
          defaultValue={subcontractor.phone ?? ""}
          error={errorFor("phone")}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          hint="Optional"
          maxLength={200}
          icon={<MailIcon className="size-4" />}
          defaultValue={subcontractor.email ?? ""}
          error={errorFor("email")}
        />
        <TextField
          label="Address"
          name="address"
          hint="Optional"
          maxLength={500}
          icon={<MapPinIcon className="size-4" />}
          defaultValue={subcontractor.address ?? ""}
          error={errorFor("address")}
        />
        <TagsField
          label="Work categories"
          name="workCategories"
          defaultValue={subcontractor.workCategories}
          error={errorFor("workCategories")}
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
