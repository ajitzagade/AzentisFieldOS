"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  Card,
  CheckCircleIcon,
  ClipboardIcon,
  LayersIcon,
  MapPinIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  UserIcon,
} from "@azentisfieldos/ui";
import { createConsumptionAction, type CreateConsumptionFormState } from "./actions";

interface MaterialSizeOption {
  id: string;
  label: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface ConsumptionFormInitialValues {
  siteId?: string;
  materialSizeId?: string;
  activityReference?: string;
  notes?: string;
  consumedAt?: string;
  recordedByUserId?: string;
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

const initialState: CreateConsumptionFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ConsumptionForm({
  mode,
  correctsId,
  materialSizes,
  sites,
  initial,
}: {
  mode: "new" | "correct";
  correctsId?: string;
  materialSizes: MaterialSizeOption[];
  sites: SiteOption[];
  initial?: ConsumptionFormInitialValues;
}) {
  const [state, formAction] = useActionState(createConsumptionAction, initialState);

  return (
    <form action={formAction} noValidate>
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Consumption is never edited or deleted (AD-9). Enter the
            quantity to add or remove as a signed adjustment (e.g. -4), not the corrected total.
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
          label="Material / Size"
          name="materialSizeId"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          defaultValue={initial?.materialSizeId ?? ""}
          options={[{ value: "", label: "Select a Material" }, ...materialSizes.map((m) => ({ value: m.id, label: m.label }))]}
          error={state.errors?.materialSizeId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="materialSizeId" value={initial?.materialSizeId} /> : null}
      </Card>

      <Card className="mb-4">
        <TextField
          label={mode === "correct" ? "Quantity adjustment" : "Quantity"}
          name="quantity"
          type="number"
          step="any"
          required
          hint={mode === "correct" ? "Signed delta applied on top of the current balance — e.g. -4." : undefined}
          error={state.errors?.quantity?.[0]}
        />
        <TextField
          label="Consumption Date"
          name="consumedAt"
          type="date"
          required
          defaultValue={initial?.consumedAt ?? todayDate()}
          error={state.errors?.consumedAt?.[0]}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Activity Reference"
          name="activityReference"
          hint="Optional — e.g. the work item this Material was used for"
          icon={<ClipboardIcon className="size-4" />}
          defaultValue={initial?.activityReference}
          error={state.errors?.activityReference?.[0]}
        />
        <TextField label="Notes" name="notes" hint="Optional" defaultValue={initial?.notes} error={state.errors?.notes?.[0]} />
        <TextField
          label="Recorded By User ID"
          name="recordedByUserId"
          required
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.recordedByUserId}
          disabled={mode === "correct"}
          hint="Signed-in user lookup has not shipped yet — enter the recording User's id directly."
          error={state.errors?.recordedByUserId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="recordedByUserId" value={initial?.recordedByUserId} /> : null}
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Consumption"} correcting={mode === "correct"} />
    </form>
  );
}
