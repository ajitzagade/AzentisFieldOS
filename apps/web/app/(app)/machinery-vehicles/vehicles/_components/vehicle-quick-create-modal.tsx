"use client";

import { useState } from "react";
import {
  FilterIcon,
  HashIcon,
  PlusIcon,
  QuickCreateModal,
  SelectField,
  TextField,
  UserIcon,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { createVehicleQuickAction } from "../new/actions";
import { parseCreateVehicleForm } from "../new/parse";

export interface VehicleQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vehicle Type options — the modal has no reference data of its own, so
   * the caller (already loading the picker's own reference data) supplies
   * this the same way it already supplies Vendor/Material/etc. options. */
  vehicleTypeOptions: { id: string; name: string }[];
  /** Fires once the Vehicle is created — the caller prepends { id, name }
   * (name = the vehicle's registration number) into its picker's local
   * options and selects it (mirrors VendorQuickCreateModal). */
  onSuccess: (vehicle: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the inline
// "+ Add Vehicle" affordance for every Vehicle picker in the app. Same
// record, same POST /vehicles as the full /machinery-vehicles/vehicles/new
// form; only Number + Type are required, Ownership/Driver are optional —
// matching that form's own field set exactly (no DetailsDisclosure needed,
// there are only two optional fields here).
export function VehicleQuickCreateModal({
  open,
  onOpenChange,
  vehicleTypeOptions,
  onSuccess,
}: VehicleQuickCreateModalProps) {
  // Same remount-key trick as VendorQuickCreateModal — Base UI's Dialog
  // keeps this subtree mounted while closing, so useActionState's internal
  // state would otherwise outlive a close/reopen cycle.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const validation = useClientValidation(parseCreateVehicleForm);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Vehicle"
      description="Creates the same Vehicle record as the full form — available in every Vehicle picker immediately."
      action={createVehicleQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Vehicle"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) =>
        vehicleTypeOptions.length === 0 ? (
          <p className="mb-4 text-body-sm text-ink-500">
            No Vehicle Types configured yet — add one under Machinery/Vehicles → Vehicle Types before registering a
            Vehicle.
          </p>
        ) : (
          <>
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
                ...vehicleTypeOptions.map((t) => ({ value: t.id, label: t.name })),
              ]}
              error={errorFor("typeId")}
            />
            <TextField
              label="Ownership"
              name="ownership"
              hint="Optional"
              maxLength={200}
              placeholder="e.g. Owned, Rented"
              error={errorFor("ownership")}
            />
            <TextField
              label="Driver"
              name="driver"
              hint="Optional"
              maxLength={200}
              icon={<UserIcon className="size-4" />}
              error={errorFor("driver")}
            />
          </>
        )
      }
    </QuickCreateModal>
  );
}
