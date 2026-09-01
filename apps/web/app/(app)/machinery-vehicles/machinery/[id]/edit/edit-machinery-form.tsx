"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, CheckCircleIcon, FilterIcon, GearIcon, HashIcon, LayersIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { updateMachineryAction, type UpdateMachineryFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseUpdateMachineryForm } from "./parse";
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
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateMachineryForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          defaultValue={machinery.name}
          error={errorFor("name")}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue={machinery.type.id}
          icon={<FilterIcon className="size-4" />}
          options={machineryTypes.map((t) => ({ value: t.id, label: t.name }))}
          error={errorFor("typeId")}
        />
        <TextField
          label="Asset / Registration Number"
          name="assetNumber"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          defaultValue={machinery.assetNumber}
          error={errorFor("assetNumber")}
        />
        <TextField
          label="Model"
          name="model"
          hint="Optional"
          maxLength={200}
          icon={<GearIcon className="size-4" />}
          defaultValue={machinery.model ?? undefined}
          error={errorFor("model")}
        />
        <TextField
          label="Ownership"
          name="ownership"
          hint="Optional"
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          defaultValue={machinery.ownership ?? undefined}
          error={errorFor("ownership")}
        />
        <TextField
          label="Operator"
          name="operator"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={machinery.operator ?? undefined}
          error={errorFor("operator")}
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
