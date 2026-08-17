"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, RotateCcwIcon, SelectField, TextField } from "@azentisfieldos/ui";
import { createPurchaseAction, type CreatePurchaseFormState } from "./actions";

interface MaterialSizeOption {
  id: string;
  label: string;
}

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

export interface PurchaseFormInitialValues {
  vendorId?: string;
  materialSizeId?: string;
  destination?: "GODOWN" | "SITE";
  siteId?: string;
  rate?: string;
  totalAmount?: string;
  invoiceOrChallanNo?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  deliveryLocation?: string;
  vehicleDetails?: string;
  receiverName?: string;
  notes?: string;
  purchasedAt?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {label}
    </Button>
  );
}

const initialState: CreatePurchaseFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type PurchaseFormProps = {
  materialSizes: MaterialSizeOption[];
  sites: SiteOption[];
  vendors: VendorOption[];
  /** Story 5.3: the vendor-to-site entry point pre-sets destination to
   * SITE and skips the toggle entirely — a UX convenience, not a
   * different data path (Purchase.destination = SITE either way). */
  fixedDestination?: "SITE";
} & (
  | { mode: "new"; correctsId?: undefined; initial?: PurchaseFormInitialValues }
  | { mode: "correct"; correctsId: string; initial: PurchaseFormInitialValues }
);

export function PurchaseForm({ mode, correctsId, materialSizes, sites, vendors, initial, fixedDestination }: PurchaseFormProps) {
  const [state, formAction] = useActionState(createPurchaseAction, initialState);
  const [destination, setDestination] = useState<"GODOWN" | "SITE">(fixedDestination ?? initial?.destination ?? "GODOWN");

  return (
    <form action={formAction} noValidate>
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Purchase is never edited or deleted (AD-9). Enter the
            quantity to add or remove as a signed adjustment (e.g. -20), not the corrected total.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Vendor"
          name="vendorId"
          required
          disabled={mode === "correct"}
          defaultValue={initial?.vendorId ?? ""}
          options={[{ value: "", label: "Select a Vendor" }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]}
          error={state.errors?.vendorId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="vendorId" value={initial?.vendorId} /> : null}

        <SelectField
          label="Material / Size"
          name="materialSizeId"
          required
          disabled={mode === "correct"}
          defaultValue={initial?.materialSizeId ?? ""}
          options={[{ value: "", label: "Select a Material" }, ...materialSizes.map((m) => ({ value: m.id, label: m.label }))]}
          error={state.errors?.materialSizeId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="materialSizeId" value={initial?.materialSizeId} /> : null}

        {fixedDestination ? (
          <input type="hidden" name="destination" value={fixedDestination} />
        ) : (
          <SelectField
            label="Destination"
            name="destination"
            required
            disabled={mode === "correct"}
            value={destination}
            onChange={(e) => setDestination(e.target.value as "GODOWN" | "SITE")}
            options={[
              { value: "GODOWN", label: "Godown" },
              { value: "SITE", label: "Site" },
            ]}
            error={state.errors?.destination?.[0]}
          />
        )}
        {mode === "correct" && !fixedDestination ? <input type="hidden" name="destination" value={destination} /> : null}

        {destination === "SITE" ? (
          <>
            <SelectField
              label="Site"
              name="siteId"
              required
              disabled={mode === "correct"}
              defaultValue={initial?.siteId ?? ""}
              options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
              error={state.errors?.siteId?.[0]}
            />
            {mode === "correct" ? <input type="hidden" name="siteId" value={initial?.siteId} /> : null}
          </>
        ) : null}
      </Card>

      <Card className="mb-4">
        <TextField
          label={mode === "correct" ? "Quantity adjustment" : "Quantity"}
          name="quantity"
          type="number"
          step="any"
          required
          hint={mode === "correct" ? "Signed delta applied on top of the current balance — e.g. -20." : undefined}
          error={state.errors?.quantity?.[0]}
        />
        <TextField label="Rate" name="rate" type="number" step="any" required defaultValue={initial?.rate} error={state.errors?.rate?.[0]} />
        <TextField
          label="Total Amount"
          name="totalAmount"
          type="number"
          step="any"
          required
          defaultValue={initial?.totalAmount}
          error={state.errors?.totalAmount?.[0]}
        />
        <SelectField
          label="Payment Status"
          name="paymentStatus"
          required
          defaultValue={initial?.paymentStatus ?? "PAID"}
          options={[
            { value: "PAID", label: "Paid" },
            { value: "PARTIAL", label: "Partial" },
            { value: "UNPAID", label: "Unpaid" },
          ]}
          error={state.errors?.paymentStatus?.[0]}
        />
        <TextField
          label="Purchase Date"
          name="purchasedAt"
          type="date"
          required
          defaultValue={initial?.purchasedAt ?? todayDate()}
          error={state.errors?.purchasedAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Invoice / Challan No."
          name="invoiceOrChallanNo"
          hint="Optional"
          defaultValue={initial?.invoiceOrChallanNo}
          error={state.errors?.invoiceOrChallanNo?.[0]}
        />
        <TextField
          label="Delivery Location"
          name="deliveryLocation"
          hint="Optional"
          defaultValue={initial?.deliveryLocation}
          error={state.errors?.deliveryLocation?.[0]}
        />
        <TextField
          label="Vehicle Details"
          name="vehicleDetails"
          hint="Optional"
          defaultValue={initial?.vehicleDetails}
          error={state.errors?.vehicleDetails?.[0]}
        />
        <TextField
          label="Receiver Name"
          name="receiverName"
          hint="Optional"
          defaultValue={initial?.receiverName}
          error={state.errors?.receiverName?.[0]}
        />
        <TextField label="Notes" name="notes" hint="Optional" defaultValue={initial?.notes} error={state.errors?.notes?.[0]} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Purchase"} />
    </form>
  );
}
