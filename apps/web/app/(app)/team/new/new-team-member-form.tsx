"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, ClipboardIcon, LayersIcon, PhoneIcon, PlusIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { createTeamMemberAction, type CreateTeamMemberFormState } from "./actions";
import { parseCreateTeamMemberForm } from "./parse";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Create Team Member
    </Button>
  );
}

const initialState: CreateTeamMemberFormState = {};

export function NewTeamMemberForm({ employmentTypes }: { employmentTypes: Option[] }) {
  const [state, formAction] = useActionState(createTeamMemberAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateTeamMemberForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  if (employmentTypes.length === 0) {
    return (
      <Card>
        <p className="mb-3 text-body-sm text-ink-500">
          No Employment Types yet —{" "}
          <Link href="/team/employment-types" className="font-semibold text-accent-teal-700 underline">
            create one first
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          error={errorFor("name")}
        />
        <TextField
          label="Role / Designation"
          name="designation"
          hint="Optional"
          maxLength={200}
          icon={<ClipboardIcon className="size-4" />}
          placeholder="e.g. Site Supervisor, Mason, Helper"
          error={errorFor("designation")}
        />
        <TextField
          label="Contact"
          name="contact"
          type="tel"
          hint="Optional"
          maxLength={100}
          icon={<PhoneIcon className="size-4" />}
          error={errorFor("contact")}
        />
        <SelectField
          label="Employment Type"
          name="employmentTypeId"
          required
          icon={<LayersIcon className="size-4" />}
          defaultValue=""
          options={[
            { value: "", label: "Select an Employment Type" },
            ...employmentTypes.map((e) => ({ value: e.id, label: e.name })),
          ]}
          error={errorFor("employmentTypeId")}
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
