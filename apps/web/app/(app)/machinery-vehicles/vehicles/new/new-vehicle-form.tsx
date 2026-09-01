"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, FilterIcon, HashIcon, PlusIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { createVehicleAction, type CreateVehicleFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseCreateVehicleForm } from "./parse";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Register Vehicle
    </Button>
  );
}

const initialState: CreateVehicleFormState = {};

export function NewVehicleForm({ vehicleTypes }: { vehicleTypes: Option[] }) {
  const [state, formAction] = useActionState(createVehicleAction, initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateVehicleForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  if (vehicleTypes.length === 0) {
    return (
      <Card>
        <p className="mb-3 text-body-sm text-ink-500">
          No Vehicle Types yet —{" "}
          <Link href="/machinery-vehicles/vehicle-types" className="font-semibold text-accent-teal-700 underline">
            create one first
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Number"
          name="number"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          placeholder="e.g. MH12AB1234"
          error={errorFor("number")}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue=""
          icon={<FilterIcon className="size-4" />}
          options={[
            { value: "", label: "Select a Vehicle Type" },
            ...vehicleTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
          error={errorFor("typeId")}
        />
        <TextField label="Ownership" name="ownership" hint="Optional" maxLength={200} icon={<BuildingIcon className="size-4" />} placeholder="e.g. Owned, Rented" error={errorFor("ownership")} />
        <TextField
          label="Driver"
          name="driver"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
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
