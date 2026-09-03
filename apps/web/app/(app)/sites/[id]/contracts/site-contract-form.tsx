"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, ComboboxField, MapPinIcon, PlusIcon, SelectField, TextField, TextareaField, UserIcon, cn } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { SubcontractorQuickCreateModal } from "@/app/(app)/subcontractors/_components/subcontractor-quick-create-modal";
import { parseCreateSiteContractForm } from "./new/parse";
import { parseUpdateSiteContractForm } from "./[contractId]/edit/parse";

export interface SubcontractorOption {
  id: string;
  name: string;
}

export interface SiteOption {
  id: string;
  name: string;
}

export interface SiteContractFormValues {
  id: string;
  subcontractorId: string;
  workCategory: string | null;
  description: string | null;
  rateType: "FIXED_COST" | "PER_TRIP" | "PER_PIPE" | "PER_UNIT" | "CUSTOM" | null;
  rateUnitLabel: string | null;
  rate: string | null;
  fixedAmount: string | null;
  estimatedQuantity: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
}

export interface SiteContractFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

interface SiteContractFormProps {
  mode: "new" | "edit";
  /** Fixed Site (site-initiated flow: `/sites/[id]/contracts/...`). Unset for the Subcontractor-initiated flow, where `sites` drives a pickable combobox instead. */
  siteId?: string;
  /** Pickable Subcontractor options (site-initiated flow). */
  subcontractors?: SubcontractorOption[];
  /** Fixed Subcontractor (subcontractor-initiated flow: `/subcontractors/[id]/contracts/new`) — rendered disabled, same visual pattern as the `mode==="edit"` fixed-Subcontractor branch. */
  subcontractorId?: string;
  /** Pickable Site options (subcontractor-initiated flow). */
  sites?: SiteOption[];
  initial?: SiteContractFormValues;
  action: (prevState: SiteContractFormState, formData: FormData) => Promise<SiteContractFormState>;
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

function SubmitButton({ mode }: { mode: "new" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {mode === "new" ? <PlusIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {mode === "new" ? "Save Site Contract" : "Save Changes"}
    </Button>
  );
}

const emptyState: SiteContractFormState = {};

export function SiteContractForm({
  mode,
  siteId: fixedSiteId,
  subcontractors: initialSubcontractors,
  subcontractorId: fixedSubcontractorId,
  sites = [],
  initial,
  action,
}: SiteContractFormProps) {
  const [state, formAction] = useActionState(action, emptyState);
  // `parse` can't travel as a prop from the Server Component page — it's a
  // plain function, and Next.js forbids passing non-"use server" functions
  // across the server/client boundary (this form imports both variants
  // directly instead, matching every other dual-mode form in the app, e.g.
  // payment-form.tsx).
  const validation = useClientValidation(mode === "edit" ? parseUpdateSiteContractForm : parseCreateSiteContractForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const [rateType, setRateType] = useState(initial?.rateType ?? "");
  const [subcontractors, setSubcontractors] = useState(initialSubcontractors ?? []);
  const [subcontractorId, setSubcontractorId] = useState(fixedSubcontractorId ?? initial?.subcontractorId ?? "");
  const [subcontractorQuickCreateOpen, setSubcontractorQuickCreateOpen] = useState(false);
  const [siteId, setSiteId] = useState(fixedSiteId ?? "");

  // Subcontractor is fixed/non-reassignable either when editing an existing
  // contract (its engaged Subcontractor never changes) or when this form was
  // reached from the Subcontractor's own detail page (caller fixes
  // `subcontractorId`) — same disabled-combobox-plus-hidden-input pattern
  // either way.
  const subcontractorFixed = mode === "edit" || fixedSubcontractorId !== undefined;
  // Site is fixed for today's site-initiated flow (`siteId` prop passed);
  // unfixed only for the Subcontractor-initiated orientation, where the
  // Subcontractor is fixed instead and the Site is picked via `sites`.
  const siteFixed = fixedSiteId !== undefined;

  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <Card>
      <form ref={formRef} action={formAction} onSubmit={validation.guard()} noValidate>
        {siteFixed ? (
          <input type="hidden" name="siteId" value={fixedSiteId} />
        ) : (
          <>
            <ComboboxField
              label="Site"
              icon={<MapPinIcon className="size-4" />}
              required
              options={sites.map((s) => ({ value: s.id, label: s.name }))}
              value={siteId || null}
              onValueChange={(value) => setSiteId(value ?? "")}
              placeholder="Type a Site name…"
              emptyMessage="No matching Site"
              error={errorFor("siteId")}
            />
            <input type="hidden" name="siteId" value={siteId} />
          </>
        )}

        <ComboboxField
          label="Subcontractor"
          icon={<UserIcon className="size-4" />}
          required={mode === "new" && !subcontractorFixed}
          disabled={subcontractorFixed}
          hint={
            mode === "edit"
              ? "The engaged Subcontractor can't be changed after the contract is created."
              : subcontractorFixed
                ? "Fixed — you're adding a Site Contract for this Subcontractor."
                : undefined
          }
          options={subcontractors.map((s) => ({ value: s.id, label: s.name }))}
          value={subcontractorId || null}
          onValueChange={(value) => setSubcontractorId(value ?? "")}
          placeholder="Type a Subcontractor name…"
          emptyMessage="No matching Subcontractor"
          error={errorFor("subcontractorId")}
          onCreateNew={subcontractorFixed ? undefined : () => setSubcontractorQuickCreateOpen(true)}
          createNewLabel="+ Add Subcontractor"
        />
        <input type="hidden" name="subcontractorId" value={subcontractorId} />

        <TextField
          label="Work category"
          name="workCategory"
          maxLength={200}
          placeholder="e.g. Storm-water pipe laying"
          defaultValue={initial?.workCategory ?? ""}
          error={errorFor("workCategory")}
        />

        <TextareaField
          label="Description"
          name="description"
          hint="Optional — scope details, drawing reference, etc."
          defaultValue={initial?.description ?? ""}
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

        {(() => {
          const isFixedCost = rateType === "FIXED_COST";
          const isPerUnitRate = rateType === "PER_TRIP" || rateType === "PER_PIPE" || rateType === "PER_UNIT" || rateType === "CUSTOM";
          const needsUnitLabel = rateType === "PER_UNIT" || rateType === "CUSTOM";
          // Every rate-type-specific field stays mounted (never conditionally
          // removed) so a value typed under one rate type survives toggling
          // to another and back — only visibility + FormData participation
          // (via `disabled`, which browsers exclude from submission) track
          // the current selection.
          return (
            <>
              <div className={cn(!isFixedCost && "hidden")}>
                <TextField
                  label="Total contract amount (₹)"
                  name="fixedAmount"
                  type="number"
                  step="any"
                  min={0}
                  inputMode="decimal"
                  disabled={!isFixedCost}
                  defaultValue={initial?.fixedAmount ?? ""}
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
                  defaultValue={initial?.rateUnitLabel ?? ""}
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
                  defaultValue={initial?.rate ?? ""}
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
                  defaultValue={initial?.estimatedQuantity ?? ""}
                  error={errorFor("estimatedQuantity")}
                />
              </div>
            </>
          );
        })()}

        <TextField
          label="Start date"
          name="startDate"
          type="date"
          defaultValue={initial?.startDate ?? (mode === "new" ? todayDate() : "")}
          error={errorFor("startDate")}
        />
        <TextField
          label="End date"
          name="endDate"
          type="date"
          hint="Optional"
          defaultValue={initial?.endDate ?? ""}
          error={errorFor("endDate")}
        />

        <SelectField
          label="Status"
          name="status"
          defaultValue={initial?.status ?? "DRAFT"}
          hint="Draft may be saved with terms still incomplete. Switching to Active requires work category, rate type, the rate/amount, and a start date to all be filled in."
          options={[
            { value: "DRAFT", label: "Draft — terms not final yet" },
            { value: "ACTIVE", label: "Active — engagement is live and billable" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          error={errorFor("status")}
        />

        {state.formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton mode={mode} />
      </form>

      <SubcontractorQuickCreateModal
        open={subcontractorQuickCreateOpen}
        onOpenChange={setSubcontractorQuickCreateOpen}
        onSuccess={(subcontractor) => {
          setSubcontractors((prev) => [subcontractor, ...prev]);
          setSubcontractorId(subcontractor.id);
          setSubcontractorQuickCreateOpen(false);
        }}
      />
    </Card>
  );
}
