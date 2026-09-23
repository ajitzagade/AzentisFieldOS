"use client";

import { useState } from "react";
import {
  AmountField,
  DetailsDisclosure,
  LayersIcon,
  PlusIcon,
  QuickCreateModal,
  SelectField,
  TextField,
  UserIcon,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { DAILY_LABOURER_CATEGORIES } from "@azentisfieldos/shared";
import { useClientValidation } from "@/lib/use-client-validation";
import { createDailyLabourerQuickAction } from "../new/actions";
import { parseCreateDailyLabourerForm } from "../new/parse";

export interface DailyLabourerQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Labourer is created — the caller prepends
   * { id, name } into its picker's local options and selects it. */
  onSuccess: (labourer: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — mirrors
// SubcontractorQuickCreateModal almost verbatim (spec-dsr-labour-dropdown):
// the inline "+ Add Labour" affordance the DSR Labour picker gets. Name and
// Category are required (createDailyLabourerSchema); defaultPerDayAmount
// folds behind DetailsDisclosure (D5) — a Labourer picked from a DSR's
// Labour row doesn't need a rate set immediately, the Labour Payment
// module's own attendance entry can supply/override one later.
export function DailyLabourerQuickCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: DailyLabourerQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern), same
  // as SubcontractorQuickCreateModal.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const validation = useClientValidation(parseCreateDailyLabourerForm);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Labour"
      description="Creates the same Labourer record as the full form — available in every Labour picker immediately."
      action={createDailyLabourerQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Labourer"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Labour Name"
            name="name"
            required
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            error={errorFor("name")}
          />
          <SelectField
            label="Labour Category"
            name="category"
            required
            icon={<LayersIcon className="size-4" />}
            defaultValue=""
            options={[
              { value: "", label: "Select a Category" },
              ...DAILY_LABOURER_CATEGORIES.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            error={errorFor("category")}
          />
          <DetailsDisclosure summary="More details — default per-day amount">
            <AmountField
              label="Default Per-Day Amount"
              name="defaultPerDayAmount"
              hint="Optional — prefills the quick-amount buttons on this Labourer's attendance entries"
              error={errorFor("defaultPerDayAmount")}
            />
          </DetailsDisclosure>
        </>
      )}
    </QuickCreateModal>
  );
}
