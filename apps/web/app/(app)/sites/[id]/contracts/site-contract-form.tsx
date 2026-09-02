"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, PlusIcon, SelectField, TextField, TextareaField } from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";

export interface SubcontractorOption {
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
  siteId: string;
  subcontractors: SubcontractorOption[];
  initial?: SiteContractFormValues;
  action: (prevState: SiteContractFormState, formData: FormData) => Promise<SiteContractFormState>;
  parse: (formData: FormData) => { success: boolean; error?: { flatten(): { fieldErrors: Record<string, string[]> } } };
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
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

export function SiteContractForm({ mode, siteId, subcontractors, initial, action, parse }: SiteContractFormProps) {
  const [state, formAction] = useActionState(action, emptyState);
  const validation = useClientValidation(parse);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const [rateType, setRateType] = useState(initial?.rateType ?? "");

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <input type="hidden" name="siteId" value={siteId} />

        <SelectField
          label="Subcontractor"
          name="subcontractorId"
          required
          defaultValue={initial?.subcontractorId ?? ""}
          options={[
            { value: "", label: "Select a Subcontractor" },
            ...subcontractors.map((s) => ({ value: s.id, label: s.name })),
          ]}
          error={errorFor("subcontractorId")}
        />

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

        {rateType === "FIXED_COST" ? (
          <TextField
            label="Total contract amount (₹)"
            name="fixedAmount"
            type="number"
            step="any"
            min={0}
            inputMode="decimal"
            defaultValue={initial?.fixedAmount ?? ""}
            error={errorFor("fixedAmount")}
          />
        ) : null}

        {rateType === "PER_TRIP" || rateType === "PER_PIPE" || rateType === "PER_UNIT" || rateType === "CUSTOM" ? (
          <>
            {rateType === "PER_UNIT" || rateType === "CUSTOM" ? (
              <TextField
                label="Unit label"
                name="rateUnitLabel"
                maxLength={100}
                placeholder="e.g. bag, sq ft, truck-day"
                defaultValue={initial?.rateUnitLabel ?? ""}
                error={errorFor("rateUnitLabel")}
              />
            ) : null}
            <TextField
              label={`Rate per ${rateType === "PER_TRIP" ? "trip" : rateType === "PER_PIPE" ? "pipe" : "unit"} (₹)`}
              name="rate"
              type="number"
              step="any"
              min={0}
              inputMode="decimal"
              defaultValue={initial?.rate ?? ""}
              error={errorFor("rate")}
            />
            <TextField
              label="Estimated quantity"
              name="estimatedQuantity"
              type="number"
              step="any"
              min={0}
              hint="Optional"
              defaultValue={initial?.estimatedQuantity ?? ""}
              error={errorFor("estimatedQuantity")}
            />
          </>
        ) : null}

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
    </Card>
  );
}
