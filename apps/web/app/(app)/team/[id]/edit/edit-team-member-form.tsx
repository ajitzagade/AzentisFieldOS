"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, PhoneIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { updateTeamMemberAction, type UpdateTeamMemberFormState } from "./actions";
import type { TeamMemberDetail } from "./page";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateTeamMemberFormState = {};

// Team Member is master data, not transaction history — a normal in-place
// Edit form (never CorrectAction), per DESIGN.md/EXPERIENCE.md's
// Edit-vs-Correct distinction (same call Epic 4 made for Material).
export function EditTeamMemberForm({
  teamMember,
  employmentTypes,
}: {
  teamMember: TeamMemberDetail;
  employmentTypes: Option[];
}) {
  const [state, formAction] = useActionState(updateTeamMemberAction.bind(null, teamMember.id), initialState);
  const [isActive, setIsActive] = useState(teamMember.isActive);

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={teamMember.name}
          error={state.errors?.name?.[0]}
        />
        <TextField
          label="Role / Designation"
          name="designation"
          hint="Optional"
          maxLength={200}
          defaultValue={teamMember.designation ?? undefined}
          error={state.errors?.designation?.[0]}
        />
        <TextField
          label="Contact"
          name="contact"
          type="tel"
          hint="Optional"
          maxLength={100}
          icon={<PhoneIcon className="size-4" />}
          defaultValue={teamMember.contact ?? undefined}
          error={state.errors?.contact?.[0]}
        />
        <SelectField
          label="Employment Type"
          name="employmentTypeId"
          required
          defaultValue={teamMember.employmentType.id}
          options={employmentTypes.map((e) => ({ value: e.id, label: e.name }))}
          error={state.errors?.employmentTypeId?.[0]}
        />

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 accent-accent-teal-700"
          />
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
          <label htmlFor="isActive" className="text-body-sm text-ink-900">
            Active — visible in Team Member pickers for new entries
          </label>
        </div>

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
