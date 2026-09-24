"use client";

import { useState } from "react";
import { cn, PlusIcon, QuickCreateModal, SelectField, TextField, TextareaField, type QuickCreateResult } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { createSiteContractQuickAction } from "./new/actions";
import { parseCreateSiteContractForm } from "./new/parse";

export interface SiteContractQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  subcontractorId: string;
  /** Fires once the Site Contract is created — the caller selects it into
   * the triggering row's siteContractId. */
  onSuccess: (contract: QuickCreateResult) => void;
}

function todayDate() {
  // Local date, not UTC — toISOString() would show yesterday for IST users
  // near midnight UTC.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const RATE_TYPE_OPTIONS = [
  { value: "", label: "Select a rate type" },
  { value: "FIXED_COST", label: "Fixed Cost" },
  { value: "PER_TRIP", label: "Per Trip" },
  { value: "PER_PIPE", label: "Per Pipe" },
  { value: "PER_UNIT", label: "Per Unit" },
  { value: "CUSTOM", label: "Custom" },
];

// User-requested (2026-09-24): the inline "+ Create Site Contract" quick-
// create on a DSR Subcontractor row — mirrors site-contract-form.tsx's full
// field set (Work Category, Description, Rate Type + conditional Rate/
// Fixed Amount/Unit Label, Start/End Date, Status), not a silent bare-DRAFT
// auto-sync. Site and Subcontractor are FIXED here (hidden inputs) — both
// are already known from the DSR row that triggered this, unlike the full
// form's pickable versions. Same OWNER_ADMIN-only 403 as the full form,
// surfaced as `formError` exactly the way SubcontractorQuickCreateModal
// does.
export function SiteContractQuickCreateModal({
  open,
  onOpenChange,
  siteId,
  subcontractorId,
  onSuccess,
}: SiteContractQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern),
  // same as SubcontractorQuickCreateModal.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const [rateType, setRateType] = useState("");
  const validation = useClientValidation(parseCreateSiteContractForm);

  const isFixedCost = rateType === "FIXED_COST";
  const isPerUnitRate = rateType === "PER_TRIP" || rateType === "PER_PIPE" || rateType === "PER_UNIT" || rateType === "CUSTOM";
  const needsUnitLabel = rateType === "PER_UNIT" || rateType === "CUSTOM";

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Create Site Contract"
      description="Creates the same Site Contract record as the full form — Draft is fine if terms aren't final yet."
      action={createSiteContractQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Save Site Contract"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="subcontractorId" value={subcontractorId} />

          <TextField
            label="Work category"
            name="workCategory"
            maxLength={200}
            placeholder="e.g. Storm-water pipe laying"
            error={errorFor("workCategory")}
          />

          <TextareaField
            label="Description"
            name="description"
            hint="Optional — scope details, drawing reference, etc."
            error={errorFor("description")}
          />

          <SelectField
            label="Rate type"
            name="rateType"
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
            options={RATE_TYPE_OPTIONS}
            error={errorFor("rateType")}
          />

          {/* Every rate-type-specific field stays mounted (never
              conditionally removed) so a value typed under one rate type
              survives toggling to another and back — only visibility +
              FormData participation (via `disabled`, which browsers
              exclude from submission) track the current selection. */}
          <div className={cn(!isFixedCost && "hidden")}>
            <TextField
              label="Total contract amount (₹)"
              name="fixedAmount"
              type="number"
              step="any"
              min={0}
              inputMode="decimal"
              disabled={!isFixedCost}
              error={errorFor("fixedAmount")}
            />
          </div>
          <div className={cn(!needsUnitLabel && "hidden")}>
            <TextField
              label="Unit label"
              name="rateUnitLabel"
              maxLength={100}
              placeholder="e.g. bag, sq ft, truck-day"
              disabled={!needsUnitLabel}
              error={errorFor("rateUnitLabel")}
            />
          </div>
          <div className={cn(!isPerUnitRate && "hidden")}>
            <TextField
              label={`Rate per ${rateType === "PER_TRIP" ? "trip" : rateType === "PER_PIPE" ? "pipe" : "unit"} (₹)`}
              name="rate"
              type="number"
              step="any"
              min={0}
              inputMode="decimal"
              disabled={!isPerUnitRate}
              error={errorFor("rate")}
            />
          </div>
          <div className={cn(!isPerUnitRate && "hidden")}>
            <TextField
              label="Estimated quantity"
              name="estimatedQuantity"
              type="number"
              step="any"
              min={0}
              hint="Optional"
              disabled={!isPerUnitRate}
              error={errorFor("estimatedQuantity")}
            />
          </div>

          <TextField label="Start date" name="startDate" type="date" defaultValue={todayDate()} error={errorFor("startDate")} />
          <TextField label="End date" name="endDate" type="date" hint="Optional" error={errorFor("endDate")} />

          <SelectField
            label="Status"
            name="status"
            defaultValue="DRAFT"
            hint="Draft may be saved with terms still incomplete. Switching to Active requires work category, rate type, the rate/amount, and a start date to all be filled in."
            options={[
              { value: "DRAFT", label: "Draft — terms not final yet" },
              { value: "ACTIVE", label: "Active — engagement is live and billable" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
            error={errorFor("status")}
          />
        </>
      )}
    </QuickCreateModal>
  );
}
