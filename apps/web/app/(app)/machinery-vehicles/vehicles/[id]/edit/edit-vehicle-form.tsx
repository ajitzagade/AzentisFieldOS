"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, CheckCircleIcon, FilterIcon, HashIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { updateVehicleAction, type UpdateVehicleFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseUpdateVehicleForm } from "./parse";
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
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateVehicleForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Number"
          name="number"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          defaultValue={vehicle.number}
          error={errorFor("number")}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue={vehicle.type.id}
          icon={<FilterIcon className="size-4" />}
          options={vehicleTypes.map((t) => ({ value: t.id, label: t.name }))}
          error={errorFor("typeId")}
        />
        <TextField
          label="Ownership"
          name="ownership"
          hint="Optional"
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          defaultValue={vehicle.ownership ?? undefined}
          error={errorFor("ownership")}
        />
        <TextField
          label="Driver"
          name="driver"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={vehicle.driver ?? undefined}
          error={errorFor("driver")}
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
