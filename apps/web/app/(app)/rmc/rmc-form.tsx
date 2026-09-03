"use client";

import { useActionState, useRef, useState } from "react";
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
  DropletIcon,
  HashIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
} from "@azentisfieldos/ui";
import { useClientValidation } from "../../../lib/use-client-validation";
import { requireOriginal } from "../../../lib/require-original";
import { usePreventFormResetOnError } from "../../../lib/use-prevent-form-reset-on-error";
import { ChallanPhotoField } from "../_components/challan-photo-field";
import { SiteField } from "../_components/site-field";
import { VendorQuickCreateModal } from "../vendors/_components/vendor-quick-create-modal";
import { createRmcEntryAction, type CreateRmcEntryFormState } from "./actions";
import { parseRmcEntryForm } from "./parse";

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
  /** Originals required by correct mode so the user can type corrected
   * values instead of computing signed deltas. */
  quantityM3?: string;
  ratePerM3?: string;
  totalAmount?: string;
  invoiceOrChallanNo?: string;
  challanPhotoUrl?: string;
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
  /** Grade names from the "RMC" Material Category (lib/rmc-grades) — when
   * empty the Grade field stays free text. */
  gradeOptions?: string[];
} & (
  | { mode: "new"; correctsId?: undefined; initial?: RmcFormInitialValues }
  | { mode: "correct"; correctsId: string; initial: RmcFormInitialValues }
);

// AC #1: RMC deliveries are recorded as their own entity — this form posts
// to POST /rmc-entries, never touching a Purchase/Movement path. Reuses
// Epic 5's Purchase delta-correction pattern (Story 5.1 Dev Notes): a
// correction submits a signed delta on top of the current total (derived
// from the corrected value the user types), and Site/Vendor/Grade lock in
// correct mode because RmcService.create validates a correction stays tied
// to the same delivery context.
export function RmcForm({ mode, correctsId, sites, vendors: initialVendors, gradeOptions = [], initial }: RmcFormProps) {
  const [state, formAction] = useActionState(createRmcEntryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));
  // Client-side pre-submit validation runs the exact same parse as the
  // Server Action (AD-7) — inline errors without a server round-trip.
  const validation = useClientValidation(parseRmcEntryForm);
  const fieldError = (name: string) => validation.errors[name]?.[0] ?? state.errors?.[name]?.[0];
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  const [vendors, setVendors] = useState(initialVendors);
  const [vendorId, setVendorId] = useState(initial?.vendorId ?? "");
  const [grade, setGrade] = useState(initial?.grade ?? "");
  const [vendorQuickCreateOpen, setVendorQuickCreateOpen] = useState(false);

  // New-entry auto-total: Total Amount = quantity × rate whenever either
  // changes — the multiplication the user should never do by hand. Typing
  // directly into Total overrides the computed value (odd invoices exist),
  // and the override holds until the next quantity/rate change recomputes
  // over it. Total stays a real submitted field either way — the server
  // contract is unchanged.
  const [quantityM3, setQuantityM3] = useState("");
  const [ratePerM3, setRatePerM3] = useState(initial?.ratePerM3 ?? "");
  const [totalAmount, setTotalAmount] = useState(initial?.totalAmount ?? "");

  function recomputeTotal(nextQuantity: string, nextRate: string) {
    const quantity = Number(nextQuantity);
    const rate = Number(nextRate);
    if (nextQuantity.trim() !== "" && nextRate.trim() !== "" && Number.isFinite(quantity) && Number.isFinite(rate)) {
      setTotalAmount((quantity * rate).toFixed(2));
    } else {
      // Blanked input: clear the total too — a stale figure silently
      // contradicting quantity × rate must never ride into the submit.
      setTotalAmount("");
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={mode === "correct" ? validation.guard(confirmation.guard()) : validation.guard()}
      noValidate
    >
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original RMC delivery is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={fieldError("reason")} />
        </Card>
      ) : null}

      <Card className="mb-4">
        {mode === "correct" ? (
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

        <ComboboxField
          label="Vendor"
          required
          icon={<BuildingIcon className="size-4" />}
          disabled={mode === "correct"}
          options={vendors.map((v) => ({ value: v.id, label: v.name }))}
          value={vendorId || null}
          onValueChange={(value) => setVendorId(value ?? "")}
          placeholder="Type a Vendor name…"
          emptyMessage="No matching Vendor"
          error={fieldError("vendorId")}
          onCreateNew={mode === "correct" ? undefined : () => setVendorQuickCreateOpen(true)}
          createNewLabel="+ Add Vendor"
        />
        <input type="hidden" name="vendorId" value={vendorId} />

        {mode === "new" && gradeOptions.length > 0 ? (
          <>
            <ComboboxField
              label="Grade"
              required
              icon={<DropletIcon className="size-4" />}
              options={gradeOptions.map((g) => ({ value: g, label: g }))}
              value={grade || null}
              onValueChange={(value) => setGrade(value ?? "")}
              placeholder="Type a grade — e.g. M25"
              emptyMessage="No matching grade — add it under Materials → RMC"
              error={fieldError("grade")}
            />
            <input type="hidden" name="grade" value={grade} />
          </>
        ) : (
          <>
            <TextField
              label="Grade"
              name="grade"
              required
              placeholder="e.g. M25"
              icon={<DropletIcon className="size-4" />}
              disabled={mode === "correct"}
              defaultValue={initial?.grade}
              error={fieldError("grade")}
            />
            {mode === "correct" ? <input type="hidden" name="grade" value={initial?.grade} /> : null}
          </>
        )}
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          // The user types the values that are actually right; the signed
          // deltas the ledger needs are derived and submitted for them.
          <CorrectedValueField
            label="Corrected quantity (m³)"
            name="quantityM3"
            originalValue={requireOriginal(initial?.quantityM3, "quantity")}
            unit="m³"
            required
            error={fieldError("quantityM3")}
          />
        ) : (
          <TextField
            label="Quantity (m³)"
            name="quantityM3"
            type="number"
            step="any"
            inputMode="decimal"
            required
            icon={<HashIcon className="size-4" />}
            value={quantityM3}
            onChange={(e) => {
              setQuantityM3(e.target.value);
              recomputeTotal(e.target.value, ratePerM3);
            }}
            error={fieldError("quantityM3")}
          />
        )}
        <AmountField
          label="Rate / m³"
          name="ratePerM3"
          required
          value={ratePerM3}
          onChange={(e) => {
            setRatePerM3(e.target.value);
            if (mode === "new") recomputeTotal(quantityM3, e.target.value);
          }}
          error={fieldError("ratePerM3")}
        />
        {mode === "correct" ? (
          <CorrectedValueField
            label="Corrected total amount"
            name="totalAmount"
            originalValue={requireOriginal(initial?.totalAmount, "total amount")}
            unit="₹"
            required
            error={fieldError("totalAmount")}
          />
        ) : (
          <AmountField
            label="Total Amount"
            name="totalAmount"
            required
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            hint="Auto-calculated as quantity × rate — you can type over it"
            error={fieldError("totalAmount")}
          />
        )}
        <TextField
          label="Delivery Date"
          name="deliveredAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.deliveredAt ?? todayDate()}
          error={fieldError("deliveredAt")}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Invoice / Challan No."
          name="invoiceOrChallanNo"
          hint="Optional"
          icon={<HashIcon className="size-4" />}
          defaultValue={initial?.invoiceOrChallanNo}
          error={fieldError("invoiceOrChallanNo")}
        />
        <ChallanPhotoField initialUrl={initial?.challanPhotoUrl} error={fieldError("challanPhotoUrl")} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record RMC Delivery"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={"Submit this correction?"}
        description={"A correction is a new, permanent ledger entry — please re-verify the details."}
        confirmLabel={"Submit Correction"}
        onConfirm={confirmation.confirm}
      >
        {/* The replay shows what the submission actually carries: the signed
            deltas derived from the corrected values. */}
        <ConfirmDialogRow label="Quantity change (m³)" value={formValue(confirmation.values, "quantityM3")} />
        <ConfirmDialogRow label="Total amount change" value={formValue(confirmation.values, "totalAmount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

      <VendorQuickCreateModal
        open={vendorQuickCreateOpen}
        onOpenChange={setVendorQuickCreateOpen}
        onSuccess={(vendor) => {
          setVendors((prev) => [vendor, ...prev]);
          setVendorId(vendor.id);
          setVendorQuickCreateOpen(false);
        }}
      />
    </form>
  );
}
