"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, CheckCircleIcon, FilterIcon, GearIcon, HashIcon, LayersIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { updateMachineryAction, type UpdateMachineryFormState } from "./actions";
import type { MachineryDetail } from "./page";

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

const initialState: UpdateMachineryFormState = {};

// Machinery is master data, not transaction history — a normal in-place
// Edit form (never CorrectAction), same as Team Member/Material.
// currentStatus/currentSiteId are deliberately not fields on this form —
// they're exclusively written by Story 8.2's movement-recording
// transaction (AC #3).
export function EditMachineryForm({
  machinery,
  machineryTypes,
}: {
  machinery: MachineryDetail;
  machineryTypes: Option[];
}) {
  const [state, formAction] = useActionState(updateMachineryAction.bind(null, machinery.id), initialState);

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          defaultValue={machinery.name}
          error={state.errors?.name?.[0]}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue={machinery.type.id}
          icon={<FilterIcon className="size-4" />}
          options={machineryTypes.map((t) => ({ value: t.id, label: t.name }))}
          error={state.errors?.typeId?.[0]}
        />
        <TextField
          label="Asset / Registration Number"
          name="assetNumber"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          defaultValue={machinery.assetNumber}
          error={state.errors?.assetNumber?.[0]}
        />
        <TextField
          label="Model"
          name="model"
          hint="Optional"
          maxLength={200}
          icon={<GearIcon className="size-4" />}
          defaultValue={machinery.model ?? undefined}
          error={state.errors?.model?.[0]}
        />
        <TextField
          label="Ownership"
          name="ownership"
          hint="Optional"
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          defaultValue={machinery.ownership ?? undefined}
          error={state.errors?.ownership?.[0]}
        />
        <TextField
          label="Operator"
          name="operator"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={machinery.operator ?? undefined}
          error={state.errors?.operator?.[0]}
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
