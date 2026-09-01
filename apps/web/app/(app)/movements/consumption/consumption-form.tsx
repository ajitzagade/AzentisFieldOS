"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ClipboardIcon,
  ComboboxField,
  ConfirmDialog,
  ConfirmDialogRow,
  CorrectedValueField,
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  formValue,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { stockStatus, useSiteStock, withStockMeta } from "../../../../lib/use-site-stock";
import { useClientValidation } from "../../../../lib/use-client-validation";
import { SiteField } from "../../_components/site-field";
import { createConsumptionAction, type CreateConsumptionFormState } from "./actions";
import { parseConsumptionForm } from "./parse";

interface MaterialSizeOption {
  id: string;
  label: string;
  description?: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface ConsumptionFormInitialValues {
  siteId?: string;
  materialSizeId?: string;
  /** The original entry's quantity — required by correct mode so the user
   * can type the corrected value instead of computing a signed delta. */
  quantity?: number;
  activityReference?: string;
  notes?: string;
  consumedAt?: string;
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
  // Client-side pre-submit validation runs the exact same parse as the
  // Server Action (AD-7) — inline errors without a server round-trip.
  const validation = useClientValidation(parseConsumptionForm);
  const fieldError = (name: string) => validation.errors[name]?.[0] ?? state.errors?.[name]?.[0];

  // Selection is tracked (the controls stay uncontrolled for FormData)
  // so current Site Stock can be shown for the chosen Material (FR-14)
  // and the correction dialog can play the entry back by name.
  const [selectedSiteId, setSelectedSiteId] = useState(initial?.siteId ?? "");
  const [selectedMaterialSizeId, setSelectedMaterialSizeId] = useState(initial?.materialSizeId ?? "");
  const [quantity, setQuantity] = useState("");
  const siteStock = useSiteStock(selectedSiteId || null);

  // Availability is shown inside the picker options while searching and as
  // a hint once chosen; typing a quantity beyond the balance flips the hint
  // to a warning before submit (FR-14). Corrections submit signed deltas,
  // so the overdraw comparison only applies to new entries.
  const materialOptions = useMemo(() => {
    const base = materialSizes.map((m) => ({ value: m.id, label: m.label, description: m.description }));
    return selectedSiteId ? withStockMeta(base, siteStock) : base;
  }, [materialSizes, selectedSiteId, siteStock]);
  const stock = selectedSiteId
    ? stockStatus({
        stock: siteStock,
        materialSizeId: selectedMaterialSizeId || null,
        quantity: mode === "new" ? quantity : undefined,
        location: "this Site",
      })
    : undefined;

  // A correction is append-only and cannot be deleted (FR-54) — hold the
  // submission and have the user re-verify the entered details first.
  const confirmation = useSubmitConfirmation();

  const siteName = sites.find((s) => s.id === selectedSiteId)?.name ?? "—";
  const selectedMaterial = materialSizes.find((m) => m.id === selectedMaterialSizeId);
  const materialLabel = selectedMaterial?.label ?? "—";
  // Restate the picked Material's unit on the quantity label so "50" is
  // never ambiguous (the unit rides along as the option's description).
  const unitSuffix = selectedMaterial?.description ? ` (${selectedMaterial.description})` : "";

  return (
    <form
      action={formAction}
      onSubmit={mode === "correct" ? validation.guard(confirmation.guard()) : validation.guard()}
      noValidate
    >
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Consumption is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField
            label="Reason for this correction"
            name="reason"
            required
            icon={<PencilIcon className="size-4" />}
            error={fieldError("reason")}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        {mode === "correct" ? (
          <>
            <SelectField
              label="Site"
              name="siteId"
              required
              icon={<MapPinIcon className="size-4" />}
              disabled
              defaultValue={initial?.siteId ?? ""}
              options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
              error={fieldError("siteId")}
            />
            <input type="hidden" name="siteId" value={initial?.siteId} />
          </>
        ) : (
          <SiteField
            sites={sites}
            required
            initialSiteId={initial?.siteId}
            onSiteChange={setSelectedSiteId}
            error={fieldError("siteId")}
          />
        )}

        <ComboboxField
          label="Material / Size"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          options={materialOptions}
          value={selectedMaterialSizeId || null}
          onValueChange={(value) => setSelectedMaterialSizeId(value ?? "")}
          placeholder="Type a Material name…"
          hint={stock?.text ?? (selectedMaterialSizeId ? undefined : "Pick a Site to see its available stock")}
          hintTone={stock?.tone}
          emptyMessage="No matching Material"
          error={fieldError("materialSizeId")}
        />
        <input type="hidden" name="materialSizeId" value={selectedMaterialSizeId} />
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          // The user types the value that is actually right; the signed
          // delta the ledger needs is derived and submitted for them.
          <CorrectedValueField
            label={`Corrected quantity${unitSuffix}`}
            name="quantity"
            originalValue={initial?.quantity ?? 0}
            unit={selectedMaterial?.description}
            required
            error={fieldError("quantity")}
          />
        ) : (
          <TextField
            label={`Quantity${unitSuffix}`}
            name="quantity"
            type="number"
            step="any"
            inputMode="decimal"
            required
            icon={<HashIcon className="size-4" />}
            onChange={(e) => setQuantity(e.target.value)}
            hint={stock?.insufficient ? "This quantity exceeds the available Site Stock" : undefined}
            hintTone={stock?.insufficient ? "danger" : "default"}
            error={fieldError("quantity")}
          />
        )}
        <TextField
          label="Consumption Date"
          name="consumedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.consumedAt ?? todayDate()}
          error={fieldError("consumedAt")}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Activity Reference"
          name="activityReference"
          hint="Optional — e.g. the work item this Material was used for"
          icon={<ClipboardIcon className="size-4" />}
          defaultValue={initial?.activityReference}
          error={fieldError("activityReference")}
        />
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={fieldError("notes")} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Consumption"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Submit this correction?"
        description="A correction is a new, permanent ledger entry — please re-verify the details."
        confirmLabel="Submit Correction"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Site" value={siteName} />
        <ConfirmDialogRow label="Material" value={materialLabel} />
        {/* The replay shows what the submission actually carries: the signed
            quantity delta derived from the corrected value. */}
        <ConfirmDialogRow label="Quantity change" value={formValue(confirmation.values, "quantity")} />
        <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} />
      </ConfirmDialog>
    </form>
  );
}
