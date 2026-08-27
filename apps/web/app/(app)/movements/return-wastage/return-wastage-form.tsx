"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  FilterIcon,
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
} from "@azentisfieldos/ui";
import { createReturnWastageAction, type CreateReturnWastageFormState } from "./actions";

interface MaterialSizeOption {
  id: string;
  label: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface ReturnWastageFormInitialValues {
  siteId?: string;
  materialSizeId?: string;
  kind?: "RETURN" | "WASTAGE";
  notes?: string;
  recordedAt?: string;
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

const initialState: CreateReturnWastageFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ReturnWastageForm({
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
  initial?: ReturnWastageFormInitialValues;
}) {
  const [state, formAction] = useActionState(createReturnWastageAction, initialState);
  const [kind, setKind] = useState<"RETURN" | "WASTAGE">(initial?.kind ?? "WASTAGE");

  return (
    <form action={formAction} noValidate>
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original entry is never edited or deleted (AD-9). Enter the
            quantity to add or remove as a signed adjustment (e.g. -2), not the corrected total.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Type"
          name="kind"
          required
          icon={<FilterIcon className="size-4" />}
          disabled={mode === "correct"}
          value={kind}
          onChange={(e) => setKind(e.target.value as "RETURN" | "WASTAGE")}
          options={[
            { value: "WASTAGE", label: "Wastage" },
            { value: "RETURN", label: "Return" },
          ]}
          error={state.errors?.kind?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="kind" value={kind} /> : null}

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
          icon={<HashIcon className="size-4" />}
          hint={mode === "correct" ? "Signed delta applied on top of the current balance — e.g. -2." : undefined}
          error={state.errors?.quantity?.[0]}
        />
        <TextField
          label="Date"
          name="recordedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.recordedAt ?? todayDate()}
          error={state.errors?.recordedAt?.[0]}
        />
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={state.errors?.notes?.[0]} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Entry"} correcting={mode === "correct"} />
    </form>
  );
}
