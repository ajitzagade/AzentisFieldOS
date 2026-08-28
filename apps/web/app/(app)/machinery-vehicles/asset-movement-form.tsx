"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, ArrowsIcon, Button, CalendarIcon, Card, CheckCircleIcon, MapPinIcon, PencilIcon, RotateCcwIcon, SelectField, TextField } from "@azentisfieldos/ui";
import { createAssetMovementAction, type CreateAssetMovementFormState } from "./actions";

interface SiteOption {
  id: string;
  name: string;
}

export type AssetLocationStatus = "AVAILABLE" | "AT_SITE" | "MAINTENANCE";

export interface AssetMovementFormInitialValues {
  toStatus?: AssetLocationStatus;
  siteId?: string;
  movedAt?: string;
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

const initialState: CreateAssetMovementFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type AssetMovementFormProps = {
  assetType: "MACHINERY" | "VEHICLE";
  assetId: string;
  sites: SiteOption[];
} & (
  | { mode: "new"; correctsId?: undefined; initial?: AssetMovementFormInitialValues }
  | { mode: "correct"; correctsId: string; initial: AssetMovementFormInitialValues }
);

// FR-17, FR-38: one form, shared by Machinery and Vehicle (AD-5, AD-7) —
// destination toggle (Site / Maintenance / Available), a Site picker shown
// only for the Site option, and a date. "Current Site" is always described
// as manually recorded here — no GPS/live-tracking language anywhere in
// this form's copy (AC #3).
export function AssetMovementForm({ mode, assetType, assetId, correctsId, sites, initial }: AssetMovementFormProps) {
  const [state, formAction] = useActionState(createAssetMovementAction, initialState);
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  const [toStatus, setToStatus] = useState<AssetLocationStatus>(initial?.toStatus ?? "AT_SITE");

  return (
    <form action={formAction} onSubmit={mode === "correct" ? confirmation.guard() : undefined} noValidate>
      <input type="hidden" name="assetType" value={assetType} />
      <input type="hidden" name="assetId" value={assetId} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked Movement entry — the original is never edited or deleted (AD-9). Re-enter the
            actual, correct destination below — this is a manually recorded fact, not a delta.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Move To"
          name="toStatus"
          required
          icon={<ArrowsIcon className="size-4" />}
          value={toStatus}
          onChange={(e) => setToStatus(e.target.value as AssetLocationStatus)}
          options={[
            { value: "AT_SITE", label: "Site" },
            { value: "MAINTENANCE", label: "Maintenance" },
            { value: "AVAILABLE", label: "Available" },
          ]}
          error={state.errors?.toStatus?.[0]}
        />

        {toStatus === "AT_SITE" ? (
          <SelectField
            label="Site"
            name="siteId"
            required
            icon={<MapPinIcon className="size-4" />}
            defaultValue={initial?.siteId ?? ""}
            options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
            error={state.errors?.siteId?.[0]}
          />
        ) : null}

        <TextField
          label="Movement Date"
          name="movedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.movedAt ?? todayDate()}
          error={state.errors?.movedAt?.[0]}
        />
        <p className="text-eyebrow text-ink-500">Manually recorded — not live GPS tracking.</p>
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Movement"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={"Submit this correction?"}
        description={"A correction is a new, permanent ledger entry — please re-verify the details."}
        confirmLabel={"Submit Correction"}
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Restated status" value={formValue(confirmation.values, "toStatus")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
