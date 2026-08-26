"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  BuildingIcon,
  Button,
  Card,
  CheckCircleIcon,
  DropletIcon,
  HashIcon,
  MapPinIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
} from "@azentisfieldos/ui";
import { createRmcEntryAction, type CreateRmcEntryFormState } from "./actions";

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

export interface RmcFormInitialValues {
  siteId?: string;
  vendorId?: string;
  grade?: string;
  ratePerM3?: string;
  totalAmount?: string;
  invoiceOrChallanNo?: string;
  deliveredAt?: string;
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

const initialState: CreateRmcEntryFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type RmcFormProps = {
  sites: SiteOption[];
  vendors: VendorOption[];
} & (
  | { mode: "new"; correctsId?: undefined; initial?: RmcFormInitialValues }
  | { mode: "correct"; correctsId: string; initial: RmcFormInitialValues }
);

// AC #1: RMC deliveries are recorded as their own entity — this form posts
// to POST /rmc-entries, never touching a Purchase/Movement path. Reuses
// Epic 5's Purchase delta-correction pattern (Story 5.1 Dev Notes): the
// Quantity field is a signed delta on top of the current total when
// correcting, not a restated total, and Site/Vendor/Grade lock in correct
// mode because RmcService.create validates a correction stays tied to the
// same delivery context.
export function RmcForm({ mode, correctsId, sites, vendors, initial }: RmcFormProps) {
  const [state, formAction] = useActionState(createRmcEntryAction, initialState);

  return (
    <form action={formAction} noValidate>
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original RMC delivery is never edited or deleted (AD-9). Enter
            the quantity to add or remove as a signed adjustment (e.g. -6), not the corrected total.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Site"
          name="siteId"
          required
          icon={<MapPinIcon className="size-4" />}
          disabled={mode === "correct"}
          defaultValue={initial?.siteId ?? ""}
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          error={state.errors?.siteId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="siteId" value={initial?.siteId} /> : null}

        <SelectField
          label="Vendor"
          name="vendorId"
          required
          icon={<BuildingIcon className="size-4" />}
          disabled={mode === "correct"}
          defaultValue={initial?.vendorId ?? ""}
          options={[{ value: "", label: "Select a Vendor" }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]}
          error={state.errors?.vendorId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="vendorId" value={initial?.vendorId} /> : null}

        <TextField
          label="Grade"
          name="grade"
          required
          placeholder="e.g. M25"
          icon={<DropletIcon className="size-4" />}
          disabled={mode === "correct"}
          defaultValue={initial?.grade}
          error={state.errors?.grade?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="grade" value={initial?.grade} /> : null}
      </Card>

      <Card className="mb-4">
        <TextField
          label={mode === "correct" ? "Quantity adjustment (m³)" : "Quantity (m³)"}
          name="quantityM3"
          type="number"
          step="any"
          required
          hint={mode === "correct" ? "Signed delta applied on top of the current total — e.g. -6." : undefined}
          error={state.errors?.quantityM3?.[0]}
        />
        <TextField
          label="Rate / m³"
          name="ratePerM3"
          type="number"
          step="any"
          required
          icon={<span className="text-body-sm font-semibold">₹</span>}
          defaultValue={initial?.ratePerM3}
          error={state.errors?.ratePerM3?.[0]}
        />
        <TextField
          label="Total Amount"
          name="totalAmount"
          type="number"
          step="any"
          required
          icon={<span className="text-body-sm font-semibold">₹</span>}
          defaultValue={initial?.totalAmount}
          error={state.errors?.totalAmount?.[0]}
        />
        <TextField
          label="Delivery Date"
          name="deliveredAt"
          type="date"
          required
          defaultValue={initial?.deliveredAt ?? todayDate()}
          error={state.errors?.deliveredAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Invoice / Challan No."
          name="invoiceOrChallanNo"
          hint="Optional"
          icon={<HashIcon className="size-4" />}
          defaultValue={initial?.invoiceOrChallanNo}
          error={state.errors?.invoiceOrChallanNo?.[0]}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record RMC Delivery"} correcting={mode === "correct"} />
    </form>
  );
}
