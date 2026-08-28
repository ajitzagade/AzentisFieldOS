"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { createVehicleTypeAction, type CreateVehicleTypeFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Vehicle Type
    </Button>
  );
}

const initialState: CreateVehicleTypeFormState = {};

export function AddVehicleTypeForm() {
  const [state, formAction] = useActionState(createVehicleTypeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex items-start gap-2">
      <div className="flex-1">
        <TextField
          label="Vehicle Type name"
          name="name"
          required
          maxLength={100}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Truck, Dumper, Tempo"
          error={state.errors?.name?.[0]}
        />
      </div>
      <div className="mt-6">
        <SubmitButton />
      </div>
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
