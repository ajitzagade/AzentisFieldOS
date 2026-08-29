"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ConfirmDialog,
  ConfirmDialogRow,
  formValue,
  useSubmitConfirmation,
  AmountField,
  BuildingIcon,
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  FilterIcon,
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from "@azentisfieldos/ui";
import { stockStatus, useStock, withStockMeta } from "../../../../lib/use-site-stock";
import { ChallanPhotoField } from "../../_components/challan-photo-field";
import { createPurchaseAction, type CreatePurchaseFormState } from "./actions";

interface MaterialSizeOption {
  id: string;
  label: string;
  description?: string;
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
  challanPhotoUrl?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  deliveryLocation?: string;
  vehicleDetails?: string;
  receiverName?: string;
  notes?: string;
  purchasedAt?: string;
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
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  const [destination, setDestination] = useState<"GODOWN" | "SITE">(fixedDestination ?? initial?.destination ?? "GODOWN");

  // A Purchase adds stock, so no overdraw warning applies — but the current
  // balance at the destination is still shown inside the picker options and
  // under the chosen Material, purely for context (FR-14).
  const [materialSizeId, setMaterialSizeId] = useState(initial?.materialSizeId ?? "");
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  const destinationLocation = destination === "GODOWN" ? "the Godown" : "this Site";
  const destinationStock = useStock(
    destination === "GODOWN" ? { kind: "godown" } : siteId ? { kind: "site", siteId } : null,
  );
  const destinationKnown = destination === "GODOWN" || Boolean(siteId);
  const materialOptions = useMemo(() => {
    const base = materialSizes.map((m) => ({ value: m.id, label: m.label, description: m.description }));
    return destinationKnown ? withStockMeta(base, destinationStock) : base;
  }, [materialSizes, destinationKnown, destinationStock]);
  const stock = destinationKnown
    ? stockStatus({ stock: destinationStock, materialSizeId: materialSizeId || null, location: destinationLocation })
    : undefined;

  return (
    <form action={formAction} onSubmit={mode === "correct" ? confirmation.guard() : undefined} noValidate>
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
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
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

        <ComboboxField
          label="Material / Size"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          options={materialOptions}
          value={materialSizeId || null}
          onValueChange={(value) => setMaterialSizeId(value ?? "")}
          placeholder="Type a Material name…"
          hint={stock?.text}
          hintTone={stock?.tone}
          emptyMessage="No matching Material"
          error={state.errors?.materialSizeId?.[0]}
        />
        <input type="hidden" name="materialSizeId" value={materialSizeId} />

        {fixedDestination ? (
          <input type="hidden" name="destination" value={fixedDestination} />
        ) : (
          <SelectField
            label="Destination"
            name="destination"
            required
            icon={<FilterIcon className="size-4" />}
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
              icon={<MapPinIcon className="size-4" />}
              disabled={mode === "correct"}
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
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
          icon={<HashIcon className="size-4" />}
          hint={mode === "correct" ? "Signed delta applied on top of the current balance — e.g. -20." : undefined}
          error={state.errors?.quantity?.[0]}
        />
        <AmountField
          label="Rate"
          name="rate"
          required
          defaultValue={initial?.rate}
          error={state.errors?.rate?.[0]}
        />
        <AmountField
          label="Total Amount"
          name="totalAmount"
          required
          defaultValue={initial?.totalAmount}
          error={state.errors?.totalAmount?.[0]}
        />
        <SelectField
          label="Payment Status"
          name="paymentStatus"
          required
          icon={<WalletIcon className="size-4" />}
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
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.purchasedAt ?? todayDate()}
          error={state.errors?.purchasedAt?.[0]}
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
        <ChallanPhotoField initialUrl={initial?.challanPhotoUrl} error={state.errors?.challanPhotoUrl?.[0]} />
        <TextField
          label="Delivery Location"
          name="deliveryLocation"
          hint="Optional"
          icon={<MapPinIcon className="size-4" />}
          defaultValue={initial?.deliveryLocation}
          error={state.errors?.deliveryLocation?.[0]}
        />
        <TextField
          label="Vehicle Details"
          name="vehicleDetails"
          hint="Optional"
          icon={<TruckIcon className="size-4" />}
          placeholder="e.g. MH12AB1234"
          defaultValue={initial?.vehicleDetails}
          error={state.errors?.vehicleDetails?.[0]}
        />
        <TextField
          label="Receiver Name"
          name="receiverName"
          hint="Optional"
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.receiverName}
          error={state.errors?.receiverName?.[0]}
        />
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={state.errors?.notes?.[0]} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Purchase"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={"Submit this correction?"}
        description={"A correction is a new, permanent ledger entry — please re-verify the details."}
        confirmLabel={"Submit Correction"}
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Quantity adjustment" value={formValue(confirmation.values, "quantity")} />
        <ConfirmDialogRow label="Total amount" value={formValue(confirmation.values, "totalAmount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
