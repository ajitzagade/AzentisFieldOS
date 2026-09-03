"use client";

import { useState } from "react";
import {
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
import { createSubcontractorQuickAction } from "../new/actions";
import { parseCreateSubcontractorForm } from "../new/parse";

export interface SubcontractorQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Subcontractor is created — the caller prepends
   * { id, name } into its picker's local options and selects it. */
  onSuccess: (subcontractor: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the inline
// "+ Add Subcontractor" affordance every Subcontractor picker gets. Only
// Name is required by default; contactPerson/phone/email/address fold
// behind DetailsDisclosure (D5). workCategories (a tag array) is
// deliberately omitted — defaults to [] server-side. The server-side
// OWNER_ADMIN-only 403 is unchanged — createSubcontractorQuickAction
// surfaces it as the same `formError` the full form shows.
export function SubcontractorQuickCreateModal({ open, onOpenChange, onSuccess }: SubcontractorQuickCreateModalProps) {
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

  const validation = useClientValidation(parseCreateSubcontractorForm);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Subcontractor"
      description="Creates the same Subcontractor record as the full form — available in every Subcontractor picker immediately."
      action={createSubcontractorQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Subcontractor"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            placeholder="e.g. Ganesh Pipeline Works"
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
              placeholder="e.g. 98220 55671"
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
