"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, PhoneIcon, PlusIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { createTeamMemberAction, type CreateTeamMemberFormState } from "./actions";

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
      <form action={formAction} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          error={state.errors?.name?.[0]}
        />
        <TextField
          label="Role / Designation"
          name="designation"
          hint="Optional"
          maxLength={200}
          placeholder="e.g. Site Supervisor, Mason, Helper"
          error={state.errors?.designation?.[0]}
        />
        <TextField
          label="Contact"
          name="contact"
          type="tel"
          hint="Optional"
          maxLength={100}
          icon={<PhoneIcon className="size-4" />}
          error={state.errors?.contact?.[0]}
        />
        <SelectField
          label="Employment Type"
          name="employmentTypeId"
          required
          defaultValue=""
          options={[
            { value: "", label: "Select an Employment Type" },
            ...employmentTypes.map((e) => ({ value: e.id, label: e.name })),
          ]}
          error={state.errors?.employmentTypeId?.[0]}
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
