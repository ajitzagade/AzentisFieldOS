"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, ArrowsIcon, Button, CalendarIcon, Card, CheckCircleIcon, PencilIcon, RotateCcwIcon, SelectField, TextField } from "@azentisfieldos/ui";
import { createAssetMovementAction, type CreateAssetMovementFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { SiteField } from "../_components/site-field";
import { parseCreateAssetMovementForm } from "./parse";

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
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateAssetMovementForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  const [toStatus, setToStatus] = useState<AssetLocationStatus>(initial?.toStatus ?? "AT_SITE");
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  return (
    <form ref={formRef} action={formAction} onSubmit={validation.guard(mode === "correct" ? confirmation.guard() : undefined)} noValidate>
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
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={errorFor("reason")} />
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
          error={errorFor("toStatus")}
        />

        {toStatus === "AT_SITE" ? (
          // The shared searchable Site picker (D5) — remembered-default only
          // for a fresh movement; a correction restates the original's Site.
          <SiteField
            sites={sites}
            required
            remember={mode === "new"}
            initialSiteId={initial?.siteId}
            error={errorFor("siteId")}
          />
        ) : null}

        <TextField
          label="Movement Date"
          name="movedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.movedAt ?? todayDate()}
          error={errorFor("movedAt")}
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
