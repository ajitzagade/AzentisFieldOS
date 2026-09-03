"use client";

import { useState } from "react";
import {
  BuildingIcon,
  DetailsDisclosure,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  QuickCreateModal,
  TextField,
  UserIcon,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { createVendorQuickAction } from "../new/actions";
import { parseCreateVendorForm } from "../new/parse";

export interface VendorQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Vendor is created — the caller prepends { id, name } into
   * its picker's local options and selects it (Design Notes example). */
  onSuccess: (vendor: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the
// inline "+ Add Vendor" affordance every Vendor picker in the app gets.
// Only Name is required by default; contactPerson/phone/email/address fold
// behind DetailsDisclosure (D5). materialsSupplied (a tag array) is
// deliberately omitted here — it defaults to [] server-side, same as an
// omitted FormData field — the full /vendors/new form remains the place to
// set it.
export function VendorQuickCreateModal({ open, onOpenChange, onSuccess }: VendorQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern) like
  // the DSR form's photoResetKey — no ref (refs can't be read/written during
  // render) and no extra visible render from an effect.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const validation = useClientValidation(parseCreateVendorForm);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Vendor"
      description="Creates the same Vendor record as the full form — available in every Vendor picker immediately."
      action={createVendorQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Vendor"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<BuildingIcon className="size-4" />}
            placeholder="e.g. BuildMart Suppliers"
            error={errorFor("name")}
          />
          <DetailsDisclosure summary="More details — contact, phone, email, address">
            <TextField
              label="Contact person"
              name="contactPerson"
              hint="Optional"
              maxLength={200}
              icon={<UserIcon className="size-4" />}
              error={errorFor("contactPerson")}
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              hint="Optional"
              maxLength={50}
              icon={<PhoneIcon className="size-4" />}
              placeholder="e.g. 98200 11223"
              error={errorFor("phone")}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              hint="Optional"
              maxLength={200}
              icon={<MailIcon className="size-4" />}
              placeholder="name@company.com"
              error={errorFor("email")}
            />
            <TextField
              label="Address"
              name="address"
              hint="Optional"
              maxLength={500}
              icon={<MapPinIcon className="size-4" />}
              error={errorFor("address")}
            />
          </DetailsDisclosure>
        </>
      )}
    </QuickCreateModal>
  );
}
