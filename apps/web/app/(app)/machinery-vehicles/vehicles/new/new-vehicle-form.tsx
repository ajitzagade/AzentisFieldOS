"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, SelectField, TextField } from "@azentisfieldos/ui";
import { createVehicleAction, type CreateVehicleFormState } from "./actions";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Register Vehicle
    </Button>
  );
}

const initialState: CreateVehicleFormState = {};

export function NewVehicleForm({ vehicleTypes }: { vehicleTypes: Option[] }) {
  const [state, formAction] = useActionState(createVehicleAction, initialState);

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
      <form action={formAction} noValidate>
        <TextField label="Number" name="number" required maxLength={100} error={state.errors?.number?.[0]} />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue=""
          options={[
            { value: "", label: "Select a Vehicle Type" },
            ...vehicleTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
          error={state.errors?.typeId?.[0]}
        />
        <TextField label="Ownership" name="ownership" hint="Optional" maxLength={200} error={state.errors?.ownership?.[0]} />
        <TextField label="Driver" name="driver" hint="Optional" maxLength={200} error={state.errors?.driver?.[0]} />

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
