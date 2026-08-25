"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, CheckCircleIcon, LayersIcon, MapPinIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { createExpenseAction, type CreateExpenseFormState } from "./actions";

interface SiteOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Record Expense
    </Button>
  );
}

const initialState: CreateExpenseFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ sites, categories }: { sites: SiteOption[]; categories: CategoryOption[] }) {
  const [state, formAction] = useActionState(createExpenseAction, initialState);

  return (
    <Card>
      <form action={formAction} noValidate>
        <SelectField
          label="Site"
          name="siteId"
          required
          icon={<MapPinIcon className="size-4" />}
          defaultValue=""
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          error={state.errors?.siteId?.[0]}
        />
        <SelectField
          label="Category"
          name="categoryId"
          required
          icon={<LayersIcon className="size-4" />}
          defaultValue=""
          hint="e.g. Fuel & Transport for diesel/petrol, Labour Welfare for crew meals"
          options={[{ value: "", label: "Select a Category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          error={state.errors?.categoryId?.[0]}
        />
        <TextField
          label="Amount"
          name="amount"
          type="number"
          step="any"
          min={0}
          required
          icon={<span className="text-body-sm font-semibold">₹</span>}
          error={state.errors?.amount?.[0]}
        />
        <TextField
          label="Date"
          name="incurredAt"
          type="date"
          required
          defaultValue={todayDate()}
          error={state.errors?.incurredAt?.[0]}
        />
        <TextField
          label="Description"
          name="description"
          hint="Optional"
          placeholder="e.g. Diesel for site generator"
          error={state.errors?.description?.[0]}
        />
        <TextField
          label="Paid to"
          name="personOrVendor"
          hint="Optional"
          icon={<UserIcon className="size-4" />}
          error={state.errors?.personOrVendor?.[0]}
        />
        <TextField
          label="Payment Method"
          name="paymentMethod"
          hint="Optional"
          placeholder="e.g. Cash, UPI"
          error={state.errors?.paymentMethod?.[0]}
        />

        {state.formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </Card>
  );
}
