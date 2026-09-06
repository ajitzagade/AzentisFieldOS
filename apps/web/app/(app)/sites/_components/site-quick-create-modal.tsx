"use client";

import { useState } from "react";
import {
  DetailsDisclosure,
  HashIcon,
  MapPinIcon,
  PlusIcon,
  QuickCreateModal,
  TextField,
  TextareaField,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { createSiteQuickAction } from "../new/actions";
import { parseCreateSiteForm } from "../new/parse";

export interface SiteQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Site is created — the caller prepends { id, name } into
   * its picker's local options and selects it (VendorQuickCreateModal's
   * same pattern). */
  onSuccess: (site: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the inline
// "+ Add Site" affordance every SiteField picker in the app gets
// (2026-09-06 fix: Site was the one master-data entity the original
// inline-quick-create pass left out). Only Name and Location are required
// by default, matching the full /sites/new form; Contract reference/
// Description fold behind DetailsDisclosure (D5). Status is deliberately
// not exposed here — it always defaults to Active for a brand-new Site,
// same as the full form's own default, and a quick-created Site is by
// definition one the user needs available right now.
export function SiteQuickCreateModal({ open, onOpenChange, onSuccess }: SiteQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern),
  // same as VendorQuickCreateModal.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const validation = useClientValidation(parseCreateSiteForm);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Site"
      description="Creates the same Site record as the full form — available in every Site picker immediately."
      action={createSiteQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Site"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<MapPinIcon className="size-4" />}
            placeholder="e.g. Riverside Tower"
            error={errorFor("name")}
          />
          <TextField
            label="Location"
            name="location"
            required
            maxLength={500}
            icon={<MapPinIcon className="size-4" />}
            placeholder="e.g. 12 MG Road, Pune"
            error={errorFor("location")}
          />
          <DetailsDisclosure summary="More details — contract reference, description">
            <TextField
              label="Contract reference"
              name="contractReference"
              hint="Optional"
              maxLength={200}
              icon={<HashIcon className="size-4" />}
              error={errorFor("contractReference")}
            />
            <TextareaField
              label="Description"
              name="description"
              hint="Optional"
              rows={3}
              maxLength={2000}
              error={errorFor("description")}
            />
          </DetailsDisclosure>
        </>
      )}
    </QuickCreateModal>
  );
}
