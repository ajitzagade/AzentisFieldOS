"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ConfirmDialog,
  ConfirmDialogRow,
  formValue,
  useSubmitConfirmation,
  AmountField,
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  CorrectedValueField,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  UserIcon,
  WalletIcon,
} from "@azentisfieldos/ui";
import { useClientValidation } from "@/lib/use-client-validation";
import { SiteField } from "../_components/site-field";
import { createExpenseAction, type CreateExpenseFormState } from "./actions";
import { parseCreateExpenseForm } from "./parse";

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
  | { mode: "new"; correctsId?: undefined; originalAmount?: undefined; initial?: ExpenseFormInitialValues }
  // originalAmount is the value currently on the ledger — CorrectedValueField
  // reads it so the user types the corrected amount, never a delta they
  // computed in their head (simplicity review 2026-09-01, decision D4).
  | { mode: "correct"; correctsId: string; originalAmount: number; initial: ExpenseFormInitialValues }
);

// FR-41: record a Site Expense (date, Site, category, amount, description,
// payment method, person/vendor). Reuses Epic 5's delta-correction pattern
// (Story 5.1 Dev Notes): in correct mode the submitted amount is still a
// signed delta on top of the current total (server contract unchanged), but
// the user types the corrected amount and CorrectedValueField derives the
// delta. Site/Category lock in correct mode because ExpensesService.create
// validates a correction stays tied to the same Site/Category as the Expense
// it corrects. The "optional document" (FR-41) is deferred — no shared
// file-upload primitive exists in packages/ui yet (see Story 11.1 Completion
// Notes).
export function ExpenseForm({ mode, correctsId, originalAmount, sites, categories, initial }: ExpenseFormProps) {
  const [state, formAction] = useActionState(createExpenseAction, initialState);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateExpenseForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");

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
            This creates a new, linked entry — the original Expense is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={errorFor("reason")} />
        </Card>
      ) : null}

      <Card className="mb-4">
        {mode === "correct" ? (
          <>
            <SelectField
              label="Site"
              required
              icon={<MapPinIcon className="size-4" />}
              disabled
              defaultValue={initial?.siteId ?? ""}
              options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
              error={errorFor("siteId")}
            />
            <input type="hidden" name="siteId" value={initial?.siteId} />
          </>
        ) : (
          <SiteField sites={sites} required initialSiteId={initial?.siteId} error={errorFor("siteId")} />
        )}

        <ComboboxField
          label="Category"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId || null}
          onValueChange={(value) => setCategoryId(value ?? "")}
          placeholder="Type a Category…"
          hint={mode === "correct" ? undefined : "e.g. Fuel for diesel/petrol, Site Expenses for miscellaneous"}
          emptyMessage="No matching Category"
          error={errorFor("categoryId")}
        />
        <input type="hidden" name="categoryId" value={categoryId} />
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          <CorrectedValueField
            label="Correct amount"
            name="amount"
            originalValue={originalAmount}
            unit="₹"
            required
            error={errorFor("amount")}
          />
        ) : (
          <AmountField label="Amount" name="amount" required error={errorFor("amount")} />
        )}
        <TextField
          label="Date"
          name="incurredAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.incurredAt ?? todayDate()}
          error={errorFor("incurredAt")}
        />
        <TextField
          label="Description"
          name="description"
          hint="Optional"
          icon={<PencilIcon className="size-4" />}
          placeholder="e.g. Diesel for site generator"
          defaultValue={initial?.description}
          error={errorFor("description")}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          icon={<WalletIcon className="size-4" />}
          placeholder="e.g. Cash, UPI"
          defaultValue={initial?.paymentMethod}
          error={errorFor("paymentMethod")}
        />
        <TextField
          label="Person / Vendor"
          name="personOrVendor"
          hint="Optional"
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.personOrVendor}
          error={errorFor("personOrVendor")}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Expense"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={"Submit this correction?"}
        description={"A correction is a new, permanent ledger entry — please re-verify the details."}
        confirmLabel={"Submit Correction"}
        onConfirm={confirmation.confirm}
      >
        {/* The submitted "amount" field carries the signed delta derived from
            the typed corrected value — label it as the change so the replay
            stays truthful. */}
        <ConfirmDialogRow label="Amount change" value={formValue(confirmation.values, "amount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
