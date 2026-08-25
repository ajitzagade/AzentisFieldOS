"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, MailIcon, MapPinIcon, PhoneIcon, PlusIcon, TextField, UserIcon } from "@azentisfieldos/ui";
import { MaterialsSuppliedField } from "../materials-supplied-field";
import { createVendorAction, type CreateVendorFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Create Vendor
    </Button>
  );
}

const initialState: CreateVendorFormState = {};

export default function NewVendorPage() {
  const [state, formAction] = useActionState(createVendorAction, initialState);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Add Vendor</h1>
      <Card>
        <form action={formAction} noValidate>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<BuildingIcon className="size-4" />}
            placeholder="e.g. BuildMart Suppliers"
            error={state.errors?.name?.[0]}
          />
          <TextField
            label="Contact person"
            name="contactPerson"
            hint="Optional"
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            error={state.errors?.contactPerson?.[0]}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            hint="Optional"
            maxLength={50}
            icon={<PhoneIcon className="size-4" />}
            placeholder="e.g. 98200 11223"
            error={state.errors?.phone?.[0]}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            hint="Optional"
            maxLength={200}
            icon={<MailIcon className="size-4" />}
            placeholder="name@company.com"
            error={state.errors?.email?.[0]}
          />
          <TextField
            label="Address"
            name="address"
            hint="Optional"
            maxLength={500}
            icon={<MapPinIcon className="size-4" />}
            error={state.errors?.address?.[0]}
          />
          <MaterialsSuppliedField name="materialsSupplied" error={state.errors?.materialsSupplied?.[0]} />

          {state.formError ? (
            <p role="alert" className="mb-4 text-caption text-danger-700">
              {state.formError}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      </Card>
    </div>
  );
}
