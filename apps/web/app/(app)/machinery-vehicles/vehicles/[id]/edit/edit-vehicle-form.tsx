"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, HashIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { updateVehicleAction, type UpdateVehicleFormState } from "./actions";
import type { VehicleDetail } from "./page";

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

const initialState: UpdateVehicleFormState = {};

// Vehicle is master data, not transaction history — a normal in-place Edit
// form (never CorrectAction), same as Machinery/Team Member/Material.
// currentStatus/currentSiteId are deliberately not fields on this form —
// they're exclusively written by Story 8.2's movement-recording
// transaction (AC #3).
export function EditVehicleForm({ vehicle, vehicleTypes }: { vehicle: VehicleDetail; vehicleTypes: Option[] }) {
  const [state, formAction] = useActionState(updateVehicleAction.bind(null, vehicle.id), initialState);

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Number"
          name="number"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          defaultValue={vehicle.number}
          error={state.errors?.number?.[0]}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue={vehicle.type.id}
          options={vehicleTypes.map((t) => ({ value: t.id, label: t.name }))}
          error={state.errors?.typeId?.[0]}
        />
        <TextField
          label="Ownership"
          name="ownership"
          hint="Optional"
          maxLength={200}
          defaultValue={vehicle.ownership ?? undefined}
          error={state.errors?.ownership?.[0]}
        />
        <TextField
          label="Driver"
          name="driver"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={vehicle.driver ?? undefined}
          error={state.errors?.driver?.[0]}
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
