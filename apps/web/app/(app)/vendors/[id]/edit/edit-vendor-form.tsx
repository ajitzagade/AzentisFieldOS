"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, CheckCircleIcon, MailIcon, MapPinIcon, PhoneIcon, TextField, UserIcon } from "@azentisfieldos/ui";
import { MaterialsSuppliedField } from "../../materials-supplied-field";
import { updateVendorAction, type UpdateVendorFormState } from "./actions";
import type { Vendor } from "../../page";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateVendorFormState = {};

export function EditVendorForm({ vendor }: { vendor: Vendor }) {
  const [state, formAction] = useActionState(updateVendorAction.bind(null, vendor.id), initialState);

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          defaultValue={vendor.name}
          error={state.errors?.name?.[0]}
        />
        <TextField
          label="Contact person"
          name="contactPerson"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={vendor.contactPerson ?? ""}
          error={state.errors?.contactPerson?.[0]}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          hint="Optional"
          maxLength={50}
          icon={<PhoneIcon className="size-4" />}
          defaultValue={vendor.phone ?? ""}
          error={state.errors?.phone?.[0]}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          hint="Optional"
          maxLength={200}
          icon={<MailIcon className="size-4" />}
          defaultValue={vendor.email ?? ""}
          error={state.errors?.email?.[0]}
        />
        <TextField
          label="Address"
          name="address"
          hint="Optional"
          maxLength={500}
          icon={<MapPinIcon className="size-4" />}
          defaultValue={vendor.address ?? ""}
          error={state.errors?.address?.[0]}
        />
        <MaterialsSuppliedField
          name="materialsSupplied"
          defaultValue={vendor.materialsSupplied}
          error={state.errors?.materialsSupplied?.[0]}
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
