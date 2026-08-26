"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  Card,
  CheckCircleIcon,
  LayersIcon,
  MapPinIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  UserIcon,
} from "@azentisfieldos/ui";
import { createExpenseAction, type CreateExpenseFormState } from "./actions";

interface SiteOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export interface ExpenseFormInitialValues {
  siteId?: string;
  categoryId?: string;
  description?: string;
  paymentMethod?: string;
  personOrVendor?: string;
  incurredAt?: string;
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

const initialState: CreateExpenseFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type ExpenseFormProps = {
  sites: SiteOption[];
  categories: CategoryOption[];
} & (
  | { mode: "new"; correctsId?: undefined; initial?: ExpenseFormInitialValues }
  | { mode: "correct"; correctsId: string; initial: ExpenseFormInitialValues }
);

// FR-41: record a Site Expense (date, Site, category, amount, description,
// payment method, person/vendor). Reuses Epic 5's delta-correction pattern
// (Story 5.1 Dev Notes): in correct mode the Amount field is a signed delta
// on top of the current total, not a restated total, and Site/Category lock
// because ExpensesService.create validates a correction stays tied to the
// same Site/Category as the Expense it corrects. The "optional document"
// (FR-41) is deferred — no shared file-upload primitive exists in
// packages/ui yet (see Story 11.1 Completion Notes).
export function ExpenseForm({ mode, correctsId, sites, categories, initial }: ExpenseFormProps) {
  const [state, formAction] = useActionState(createExpenseAction, initialState);

  return (
    <form action={formAction} noValidate>
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Expense is never edited or deleted (AD-9). Enter the
            amount to add or remove as a signed adjustment (e.g. -500), not the corrected total.
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
          label="Category"
          name="categoryId"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          defaultValue={initial?.categoryId ?? ""}
          hint={mode === "correct" ? undefined : "e.g. Fuel for diesel/petrol, Site Expenses for miscellaneous"}
          options={[
            { value: "", label: "Select a Category" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          error={state.errors?.categoryId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="categoryId" value={initial?.categoryId} /> : null}
      </Card>

      <Card className="mb-4">
        <TextField
          label={mode === "correct" ? "Amount adjustment" : "Amount"}
          name="amount"
          type="number"
          step="any"
          required
          hint={mode === "correct" ? "Signed delta applied on top of the current total — e.g. -500." : undefined}
          icon={<span className="text-body-sm font-semibold">₹</span>}
          error={state.errors?.amount?.[0]}
        />
        <TextField
          label="Date"
          name="incurredAt"
          type="date"
          required
          defaultValue={initial?.incurredAt ?? todayDate()}
          error={state.errors?.incurredAt?.[0]}
        />
        <TextField
          label="Description"
          name="description"
          hint="Optional"
          placeholder="e.g. Diesel for site generator"
          defaultValue={initial?.description}
          error={state.errors?.description?.[0]}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          placeholder="e.g. Cash, UPI"
          defaultValue={initial?.paymentMethod}
          error={state.errors?.paymentMethod?.[0]}
        />
        <TextField
          label="Person / Vendor"
          name="personOrVendor"
          hint="Optional"
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.personOrVendor}
          error={state.errors?.personOrVendor?.[0]}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Expense"} correcting={mode === "correct"} />
    </form>
  );
}
