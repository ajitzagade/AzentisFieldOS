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
  CorrectedValueField,
  DetailsDisclosure,
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
import { useClientValidation } from "../../../../lib/use-client-validation";
import { SiteField } from "../../_components/site-field";
import { ChallanPhotoField } from "../../_components/challan-photo-field";
import { createPurchaseAction, type CreatePurchaseFormState } from "./actions";
import { parsePurchaseForm } from "./parse";

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
  /** Team Member names for the Receiver datalist — suggestions only; any
   * free-typed name is accepted and stored as plain text. */
  teamNames?: string[];
  /** Story 5.3: the vendor-to-site entry point pre-sets destination to
   * SITE and skips the toggle entirely — a UX convenience, not a
   * different data path (Purchase.destination = SITE either way). */
  fixedDestination?: "SITE";
  /** D7: false for a Site Supervisor — the pricing card (Rate / Total /
   * Payment Status) is not rendered at all and the entry is recorded as
   * "Pricing pending" for the Owner to complete later. Defaults true. */
  showPricing?: boolean;
} & (
  | { mode: "new"; correctsId?: undefined; initial?: PurchaseFormInitialValues; original?: undefined }
  | {
      mode: "correct";
      correctsId: string;
      initial: PurchaseFormInitialValues;
      /** The ledger row being corrected — drives the corrected-value entry
       * (D4) and whether pricing fields exist to correct at all (D7). */
      original: { quantity: number; priced: boolean };
    }
);

export function PurchaseForm({
  mode,
  correctsId,
  materialSizes,
  sites,
  vendors,
  initial,
  fixedDestination,
  teamNames = [],
  showPricing = true,
  original,
}: PurchaseFormProps) {
  const [state, formAction] = useActionState(createPurchaseAction, initialState);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  // Same shared validator as the Server Action (AD-7) — inline errors
  // pre-submit; server-only failures still arrive via `state.errors`.
  const validation = useClientValidation(parsePurchaseForm);
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
  // Restate the picked Material's unit on the quantity label so "50" is
  // never ambiguous (the unit rides along as the option's description).
  const selectedUnit = materialSizes.find((m) => m.id === materialSizeId)?.description;
  const unitSuffix = selectedUnit ? ` (${selectedUnit})` : "";

  // D5: Total auto-computes from quantity × rate; the user may still type
  // over it (a delivery bill can carry rounding or extra charges), and a
  // later quantity/rate change recomputes — dropping the manual override so
  // the visible figures never silently disagree.
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState(initial?.rate ?? "");
  const [manualTotal, setManualTotal] = useState<string | null>(initial?.totalAmount ?? null);
  const computedTotal =
    quantity.trim() !== "" && rate.trim() !== "" && Number.isFinite(Number(quantity)) && Number.isFinite(Number(rate))
      ? String(Math.round(Number(quantity) * Number(rate) * 100) / 100)
      : "";
  const totalValue = manualTotal ?? computedTotal;

  const fieldError = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  // Pricing fields are rendered for the Owner's new entry and for a
  // correction of a priced Purchase; a Supervisor's new entry and a
  // correction of a still-unpriced one carry no money fields at all (D7).
  const pricingRendered = mode === "correct" ? original.priced : showPricing;

  const hasOptionalInitial = Boolean(
    initial?.invoiceOrChallanNo ??
      initial?.challanPhotoUrl ??
      initial?.deliveryLocation ??
      initial?.vehicleDetails ??
      initial?.receiverName ??
      initial?.notes,
  );

  return (
    <form
      action={formAction}
      onSubmit={validation.guard(mode === "correct" ? confirmation.guard() : undefined)}
      noValidate
    >
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Purchase is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={fieldError("reason")} />
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
          error={fieldError("vendorId")}
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
          error={fieldError("materialSizeId")}
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
            error={fieldError("destination")}
          />
        )}
        {mode === "correct" && !fixedDestination ? <input type="hidden" name="destination" value={destination} /> : null}

        {destination === "SITE" ? (
          mode === "correct" ? (
            <>
              <SelectField
                label="Site"
                name="siteId"
                required
                icon={<MapPinIcon className="size-4" />}
                disabled
                value={siteId}
                onChange={() => {}}
                options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
                error={fieldError("siteId")}
              />
              <input type="hidden" name="siteId" value={initial?.siteId} />
            </>
          ) : (
            // Searchable + device-remembered Site picker (D5) — submits the
            // hidden `siteId` itself and keeps the stock hint in sync.
            <SiteField
              sites={sites}
              required
              initialSiteId={initial?.siteId}
              onSiteChange={setSiteId}
              error={fieldError("siteId")}
            />
          )
        ) : null}
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          // D4: the user types the corrected quantity — the signed delta the
          // ledger needs is derived and submitted underneath.
          <CorrectedValueField
            label={`Corrected quantity${unitSuffix}`}
            name="quantity"
            originalValue={original.quantity}
            unit={selectedUnit}
            required
            error={fieldError("quantity")}
          />
        ) : (
          <TextField
            label={`Quantity${unitSuffix}`}
            name="quantity"
            type="number"
            step="any"
            inputMode="decimal"
            required
            icon={<HashIcon className="size-4" />}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setManualTotal(null);
            }}
            error={fieldError("quantity")}
          />
        )}

        {pricingRendered ? (
          <>
            {/* Tells the shared parser that pricing is visible here and
                therefore required — a Supervisor's form omits all of this. */}
            <input type="hidden" name="pricingShown" value="1" />
            <AmountField
              label="Rate"
              name="rate"
              required
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                if (mode === "new") setManualTotal(null);
              }}
              error={fieldError("rate")}
            />
            <AmountField
              label="Total Amount"
              name="totalAmount"
              required
              value={totalValue}
              onChange={(e) => setManualTotal(e.target.value)}
              error={fieldError("totalAmount")}
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
              error={fieldError("paymentStatus")}
            />
          </>
        ) : mode === "new" ? (
          // D7: the Supervisor records the physical facts only.
          <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-caption text-ink-700">
            Rates &amp; amounts are entered by the office — you don&apos;t need the bill.
          </p>
        ) : (
          // Correcting a still-unpriced entry: only the quantity can be wrong
          // here; pricing arrives later through the Owner's pricing queue.
          <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-caption text-ink-700">
            This entry has no pricing yet — it stays &quot;Pricing pending&quot; until the office adds it.
          </p>
        )}

        <TextField
          label="Purchase Date"
          name="purchasedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.purchasedAt ?? todayDate()}
          error={fieldError("purchasedAt")}
        />
      </Card>

      {/* D5: optional paperwork folds behind one toggle so the required path
          reads short on a phone; collapsed fields still submit. */}
      <DetailsDisclosure
        summary="More details — challan no., photo, vehicle, receiver, notes"
        defaultOpen={hasOptionalInitial}
      >
        <TextField
          label="Invoice / Challan No."
          name="invoiceOrChallanNo"
          hint="Optional"
          icon={<HashIcon className="size-4" />}
          defaultValue={initial?.invoiceOrChallanNo}
          error={fieldError("invoiceOrChallanNo")}
        />
        <ChallanPhotoField initialUrl={initial?.challanPhotoUrl} error={fieldError("challanPhotoUrl")} />
        <TextField
          label="Delivery Location"
          name="deliveryLocation"
          hint="Optional"
          icon={<MapPinIcon className="size-4" />}
          defaultValue={initial?.deliveryLocation}
          error={fieldError("deliveryLocation")}
        />
        <TextField
          label="Vehicle Details"
          name="vehicleDetails"
          hint="Optional"
          icon={<TruckIcon className="size-4" />}
          placeholder="e.g. MH12AB1234"
          defaultValue={initial?.vehicleDetails}
          error={fieldError("vehicleDetails")}
        />
        {/* Native datalist: suggests Team Member names while still accepting
            any free-typed name (a receiver need not be on the team — the
            typed text is stored as-is, never added to the Team roster). */}
        <TextField
          label="Receiver Name"
          name="receiverName"
          hint="Optional — pick a team member or type any name"
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.receiverName}
          list="purchase-receiver-names"
          error={fieldError("receiverName")}
        />
        <datalist id="purchase-receiver-names">
          {teamNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={fieldError("notes")} />
      </DetailsDisclosure>

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
        <ConfirmDialogRow label="Quantity change" value={formValue(confirmation.values, "quantity")} />
        {pricingRendered ? (
          <ConfirmDialogRow label="Total amount" value={formValue(confirmation.values, "totalAmount")} />
        ) : null}
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
