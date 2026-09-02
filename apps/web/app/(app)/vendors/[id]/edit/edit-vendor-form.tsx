"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, CheckCircleIcon, MailIcon, MapPinIcon, PhoneIcon, TagsField, TextField, UserIcon } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { updateVendorAction, type UpdateVendorFormState } from "./actions";
import { parseUpdateVendorForm } from "./parse";
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
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateVendorForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          defaultValue={vendor.name}
          error={errorFor("name")}
        />
        <TextField
          label="Contact person"
          name="contactPerson"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          defaultValue={vendor.contactPerson ?? ""}
          error={errorFor("contactPerson")}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          hint="Optional"
          maxLength={50}
          icon={<PhoneIcon className="size-4" />}
          defaultValue={vendor.phone ?? ""}
          error={errorFor("phone")}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          hint="Optional"
          maxLength={200}
          icon={<MailIcon className="size-4" />}
          defaultValue={vendor.email ?? ""}
          error={errorFor("email")}
        />
        <TextField
          label="Address"
          name="address"
          hint="Optional"
          maxLength={500}
          icon={<MapPinIcon className="size-4" />}
          defaultValue={vendor.address ?? ""}
          error={errorFor("address")}
        />
        <TagsField
          label="Materials / services supplied"
          name="materialsSupplied"
          defaultValue={vendor.materialsSupplied}
          error={errorFor("materialsSupplied")}
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
