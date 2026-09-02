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
  CorrectedValueField,
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
import { useClientValidation } from "../../../lib/use-client-validation";
import { requireOriginal } from "../../../lib/require-original";
import { SiteField } from "../_components/site-field";
import { createWasteDisposalAction, type CreateWasteDisposalFormState } from "./actions";
import { parseWasteDisposalForm } from "./parse";

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
  /** Originals required by correct mode so the user can type corrected
   * values instead of computing signed deltas. */
  tripCount?: number;
  otherCharges?: string;
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
  // Client-side pre-submit validation runs the exact same parse as the
  // Server Action (AD-7) — inline errors without a server round-trip.
  const validation = useClientValidation(parseWasteDisposalForm);
  const fieldError = (name: string) => validation.errors[name]?.[0] ?? state.errors?.[name]?.[0];
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
  // computed authoritatively again on the server. (New entries only — in
  // correct mode the corrected-value fields speak their own change lines.)
  const trips = Number(tripCount);
  const rate = Number(ratePerTrip);
  const other = Number(otherCharges || 0);
  const computedTotal =
    Number.isFinite(trips) && Number.isFinite(rate) && Number.isFinite(other) && tripCount !== ""
      ? trips * rate + other
      : null;

  const correcting = mode === "correct";

  return (
    <form
      action={formAction}
      onSubmit={correcting ? validation.guard(confirmation.guard()) : validation.guard()}
      noValidate
    >
      {correcting ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField
            label="Reason for this correction"
            name="reason"
            required
            icon={<PencilIcon className="size-4" />}
            error={fieldError("reason")}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        {correcting ? (
          <>
            <SelectField
              label="Site"
              name="siteId"
              required
              icon={<MapPinIcon className="size-4" />}
              disabled
              defaultValue={initial?.siteId ?? ""}
              options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
              error={fieldError("siteId")}
            />
            <input type="hidden" name="siteId" value={initial?.siteId} />
          </>
        ) : (
          <SiteField sites={sites} required initialSiteId={initial?.siteId} error={fieldError("siteId")} />
        )}

        <TextField
          label="Waste / material type"
          name="wasteType"
          required
          disabled={correcting}
          placeholder="e.g. Debris, Excavated earth / murum"
          defaultValue={initial?.wasteType}
          error={fieldError("wasteType")}
        />
        {correcting ? <input type="hidden" name="wasteType" value={initial?.wasteType} /> : null}

        <TextField
          label="Quantity"
          name="quantityDetails"
          hint="Optional — informational only, e.g. approx 40 MT"
          disabled={correcting}
          defaultValue={initial?.quantityDetails}
          error={fieldError("quantityDetails")}
        />

        <TextField
          label="Date"
          name="disposedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.disposedAt ?? todayDate()}
          error={fieldError("disposedAt")}
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
          error={fieldError("ownership")}
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
              error={fieldError("vendorId")}
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
          error={fieldError("machineryId") ?? fieldError("vehicleId")}
        />
        <input type="hidden" name="machineryId" value={correcting ? (initial?.machineryId ?? "") : machineryId} />
        <input type="hidden" name="vehicleId" value={correcting ? (initial?.vehicleId ?? "") : vehicleId} />

        <TextField
          label="Vehicle details"
          name="vehicleDetails"
          hint="Optional — e.g. hired dumper MH15CD5678"
          disabled={correcting}
          defaultValue={initial?.vehicleDetails}
          error={fieldError("vehicleDetails")}
        />
      </Card>

      <Card className="mb-4">
        {correcting ? (
          // The user types the values that are actually right; the signed
          // deltas the ledger needs are derived and submitted for them.
          <CorrectedValueField
            label="Corrected number of trips"
            name="tripCount"
            originalValue={requireOriginal(initial?.tripCount, "trip count")}
            unit="trips"
            required
            error={fieldError("tripCount")}
          />
        ) : (
          <TextField
            label="Number of trips"
            name="tripCount"
            type="number"
            step="1"
            inputMode="numeric"
            required
            icon={<HashIcon className="size-4" />}
            value={tripCount}
            onChange={(e) => setTripCount(e.target.value)}
            error={fieldError("tripCount")}
          />
        )}
        <AmountField
          label="Rate per trip"
          name="ratePerTrip"
          required
          disabled={correcting}
          value={ratePerTrip}
          onChange={(e) => setRatePerTrip(e.target.value)}
          error={fieldError("ratePerTrip")}
        />
        {correcting ? <input type="hidden" name="ratePerTrip" value={initial?.ratePerTrip} /> : null}
        {correcting ? (
          <CorrectedValueField
            label="Corrected other charges"
            name="otherCharges"
            originalValue={initial?.otherCharges == null ? 0 : requireOriginal(initial.otherCharges, "other charges")}
            unit="₹"
            error={fieldError("otherCharges")}
          />
        ) : (
          <AmountField
            label="Other charges"
            name="otherCharges"
            hint="Optional — loading / JCB / toll etc."
            value={otherCharges}
            onChange={(e) => setOtherCharges(e.target.value)}
            error={fieldError("otherCharges")}
          />
        )}
        {!correcting ? (
          <p className="text-body-sm text-ink-700">
            Total amount:{" "}
            <span className="font-semibold text-gold-700 tabular-nums">
              {computedTotal === null ? "—" : `₹${computedTotal.toLocaleString("en-IN")}`}
            </span>{" "}
            <span className="text-caption text-ink-500">(trips × rate + other charges, computed automatically)</span>
          </p>
        ) : null}
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
            error={fieldError("paymentStatus")}
          />
        ) : null}
        <TextField
          label="Dumping / disposal location"
          name="disposalLocation"
          hint="Optional"
          icon={<MapPinIcon className="size-4" />}
          disabled={correcting}
          defaultValue={initial?.disposalLocation}
          error={fieldError("disposalLocation")}
        />
        <TextareaField
          label="Notes"
          name="notes"
          rows={2}
          hint="Optional"
          disabled={correcting}
          defaultValue={initial?.notes}
          error={fieldError("notes")}
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
        {/* The replay shows what the submission actually carries: the signed
            deltas derived from the corrected values. */}
        <ConfirmDialogRow label="Trips change" value={formValue(confirmation.values, "tripCount")} />
        <ConfirmDialogRow label="Other charges change" value={formValue(confirmation.values, "otherCharges")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
