"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ConfirmDialog,
  ConfirmDialogRow,
  formValue,
  useSubmitConfirmation,
  Button,
  BuildingIcon,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  HashIcon,
  AmountField,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TextareaField,
  TruckIcon,
} from "@azentisfieldos/ui";
import { createWasteDisposalAction, type CreateWasteDisposalFormState } from "./actions";

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

// One combobox over both own registers — "machinery:<id>" / "vehicle:<id>"
// values, same convention as the DSR's equipment picker.
export interface EquipmentOption {
  value: string;
  label: string;
  description?: string;
}

export interface WasteDisposalFormInitialValues {
  siteId?: string;
  wasteType?: string;
  quantityDetails?: string;
  ownership?: "OWN" | "HIRED";
  vendorId?: string;
  machineryId?: string;
  vehicleId?: string;
  vehicleDetails?: string;
  ratePerTrip?: string;
  disposalLocation?: string;
  notes?: string;
  disposedAt?: string;
}

function SubmitButton({ label, correcting }: { label: string; correcting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {correcting ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {label}
    </Button>
  );
}

const initialState: CreateWasteDisposalFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function WasteDisposalForm({
  mode,
  correctsId,
  sites,
  vendors,
  equipment,
  initial,
}: {
  mode: "new" | "correct";
  correctsId?: string;
  sites: SiteOption[];
  vendors: VendorOption[];
  equipment: EquipmentOption[];
  initial?: WasteDisposalFormInitialValues;
}) {
  const [state, formAction] = useActionState(createWasteDisposalAction, initialState);
  // Money movement (FR-54) — held for re-verification before it goes to
  // the ledger, same rule as the Purchase/Movement forms.
  const confirmation = useSubmitConfirmation();

  const [ownership, setOwnership] = useState<"OWN" | "HIRED">(initial?.ownership ?? "HIRED");
  const [vendorId, setVendorId] = useState(initial?.vendorId ?? "");
  const [equipmentValue, setEquipmentValue] = useState(
    initial?.machineryId
      ? `machinery:${initial.machineryId}`
      : initial?.vehicleId
        ? `vehicle:${initial.vehicleId}`
        : "",
  );
  const [tripCount, setTripCount] = useState("");
  const [ratePerTrip, setRatePerTrip] = useState(initial?.ratePerTrip ?? "");
  const [otherCharges, setOtherCharges] = useState("");

  const machineryId = equipmentValue.startsWith("machinery:") ? equipmentValue.slice(10) : "";
  const vehicleId = equipmentValue.startsWith("vehicle:") ? equipmentValue.slice(8) : "";

  // The multiplication the user should never do by hand: shown live, and
  // computed authoritatively again on the server.
  const trips = Number(tripCount);
  const rate = Number(ratePerTrip);
  const other = Number(otherCharges || 0);
  const computedTotal =
    Number.isFinite(trips) && Number.isFinite(rate) && Number.isFinite(other) && tripCount !== ""
      ? trips * rate + other
      : null;

  const correcting = mode === "correct";

  return (
    <form action={formAction} onSubmit={correcting ? confirmation.guard() : undefined} noValidate>
      {correcting ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original is never edited or deleted (AD-9). Enter
            trips and other charges as signed adjustments (e.g. -2 trips), not corrected totals.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField
            label="Reason for this correction"
            name="reason"
            required
            icon={<PencilIcon className="size-4" />}
            error={state.errors?.reason?.[0]}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Site"
          name="siteId"
          required
          icon={<MapPinIcon className="size-4" />}
          disabled={correcting}
          defaultValue={initial?.siteId ?? ""}
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          error={state.errors?.siteId?.[0]}
        />
        {correcting ? <input type="hidden" name="siteId" value={initial?.siteId} /> : null}

        <TextField
          label="Waste / material type"
          name="wasteType"
          required
          disabled={correcting}
          placeholder="e.g. Debris, Excavated earth / murum"
          defaultValue={initial?.wasteType}
          error={state.errors?.wasteType?.[0]}
        />
        {correcting ? <input type="hidden" name="wasteType" value={initial?.wasteType} /> : null}

        <TextField
          label="Quantity"
          name="quantityDetails"
          hint="Optional — informational only, e.g. approx 40 MT"
          disabled={correcting}
          defaultValue={initial?.quantityDetails}
          error={state.errors?.quantityDetails?.[0]}
        />

        <TextField
          label="Date"
          name="disposedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.disposedAt ?? todayDate()}
          error={state.errors?.disposedAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <SelectField
          label="Own / Hired"
          name="ownership"
          required
          icon={<TruckIcon className="size-4" />}
          disabled={correcting}
          value={ownership}
          onChange={(e) => {
            const next = e.target.value === "OWN" ? "OWN" : "HIRED";
            setOwnership(next);
            if (next === "OWN") setVendorId("");
          }}
          options={[
            { value: "HIRED", label: "Hired (third party)" },
            { value: "OWN", label: "Own vehicle / machine" },
          ]}
          error={state.errors?.ownership?.[0]}
        />
        {correcting ? <input type="hidden" name="ownership" value={initial?.ownership} /> : null}

        {ownership === "HIRED" ? (
          <>
            <ComboboxField
              label="Party / Vendor"
              required
              icon={<BuildingIcon className="size-4" />}
              disabled={correcting}
              options={vendors.map((v) => ({ value: v.id, label: v.name }))}
              value={vendorId || null}
              onValueChange={(value) => setVendorId(value ?? "")}
              placeholder="Type a Vendor name…"
              emptyMessage="No matching Vendor — add them under Vendors first"
              error={state.errors?.vendorId?.[0]}
            />
            <input type="hidden" name="vendorId" value={correcting ? (initial?.vendorId ?? "") : vendorId} />
          </>
        ) : null}

        <ComboboxField
          label="Own machinery / vehicle"
          icon={<TruckIcon className="size-4" />}
          disabled={correcting}
          options={equipment}
          value={equipmentValue || null}
          onValueChange={(value) => setEquipmentValue(value ?? "")}
          placeholder="Type a machine name or vehicle number…"
          hint={ownership === "HIRED" ? "Optional — only if one of your own assets did the trips" : "Optional"}
          emptyMessage="No matching Machinery or Vehicle in the registers"
          error={state.errors?.machineryId?.[0] ?? state.errors?.vehicleId?.[0]}
        />
        <input type="hidden" name="machineryId" value={correcting ? (initial?.machineryId ?? "") : machineryId} />
        <input type="hidden" name="vehicleId" value={correcting ? (initial?.vehicleId ?? "") : vehicleId} />

        <TextField
          label="Vehicle details"
          name="vehicleDetails"
          hint="Optional — e.g. hired dumper MH15CD5678"
          disabled={correcting}
          defaultValue={initial?.vehicleDetails}
          error={state.errors?.vehicleDetails?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label={correcting ? "Trips adjustment" : "Number of trips"}
          name="tripCount"
          type="number"
          step="1"
          required
          icon={<HashIcon className="size-4" />}
          value={tripCount}
          onChange={(e) => setTripCount(e.target.value)}
          hint={correcting ? "Signed delta applied on top of the original — e.g. -2." : undefined}
          error={state.errors?.tripCount?.[0]}
        />
        <AmountField
          label="Rate per trip"
          name="ratePerTrip"
          required
          disabled={correcting}
          value={ratePerTrip}
          onChange={(e) => setRatePerTrip(e.target.value)}
          error={state.errors?.ratePerTrip?.[0]}
        />
        {correcting ? <input type="hidden" name="ratePerTrip" value={initial?.ratePerTrip} /> : null}
        <AmountField
          label={correcting ? "Other charges adjustment" : "Other charges"}
          name="otherCharges"
          hint={
            correcting
              ? "Signed delta — e.g. -300. Leave blank for no change."
              : "Optional — loading / JCB / toll etc."
          }
          value={otherCharges}
          onChange={(e) => setOtherCharges(e.target.value)}
          error={state.errors?.otherCharges?.[0]}
        />
        <p className="text-body-sm text-ink-700">
          {correcting ? "Total adjustment" : "Total amount"}:{" "}
          <span className="font-semibold text-gold-700 tabular-nums">
            {computedTotal === null ? "—" : `₹${computedTotal.toLocaleString("en-IN")}`}
          </span>{" "}
          <span className="text-caption text-ink-500">(trips × rate + other charges, computed automatically)</span>
        </p>
      </Card>

      <Card className="mb-4">
        {!correcting && ownership === "HIRED" ? (
          <SelectField
            label="Payment status"
            name="paymentStatus"
            required
            defaultValue="UNPAID"
            options={[
              { value: "UNPAID", label: "Unpaid" },
              { value: "PARTIAL", label: "Partial" },
              { value: "PAID", label: "Paid" },
            ]}
            error={state.errors?.paymentStatus?.[0]}
          />
        ) : null}
        <TextField
          label="Dumping / disposal location"
          name="disposalLocation"
          hint="Optional"
          icon={<MapPinIcon className="size-4" />}
          disabled={correcting}
          defaultValue={initial?.disposalLocation}
          error={state.errors?.disposalLocation?.[0]}
        />
        <TextareaField
          label="Notes"
          name="notes"
          rows={2}
          hint="Optional"
          disabled={correcting}
          defaultValue={initial?.notes}
          error={state.errors?.notes?.[0]}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={correcting ? "Submit Correction" : "Record Disposal"} correcting={correcting} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Submit this correction?"
        description="A correction is a new, permanent ledger entry — please re-verify the details."
        confirmLabel="Submit Correction"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Trips adjustment" value={formValue(confirmation.values, "tripCount")} />
        <ConfirmDialogRow label="Other charges adjustment" value={formValue(confirmation.values, "otherCharges")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
