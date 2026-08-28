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
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { stockStatus, useSiteStock, withStockMeta } from "../../../../lib/use-site-stock";
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

  // Selection is tracked (the controls stay uncontrolled for FormData)
  // so current Site Stock can be shown for the chosen Material (FR-14)
  // and the correction dialog can play the entry back by name.
  const [selectedSiteId, setSelectedSiteId] = useState(initial?.siteId ?? "");
  const [selectedMaterialSizeId, setSelectedMaterialSizeId] = useState(initial?.materialSizeId ?? "");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const siteStock = useSiteStock(selectedSiteId || null);

  // Availability is shown inside the picker options while searching and as
  // a hint once chosen; typing a quantity beyond the balance flips the hint
  // to a warning before submit (FR-14). Corrections are signed deltas, so
  // the overdraw comparison only applies to new entries.
  const materialOptions = useMemo(() => {
    const base = materialSizes.map((m) => ({ value: m.id, label: m.label }));
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
  const materialLabel = materialSizes.find((m) => m.id === selectedMaterialSizeId)?.label ?? "—";

  return (
    <form action={formAction} onSubmit={mode === "correct" ? confirmation.guard() : undefined} noValidate>
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
          <TextField
            label="Reason for this correction"
            name="reason"
            required
            icon={<PencilIcon className="size-4" />}
            onChange={(e) => setReason(e.target.value)}
            error={state.errors?.reason?.[0]}
          />
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
          onChange={(e) => setSelectedSiteId(e.target.value)}
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
          error={state.errors?.siteId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="siteId" value={initial?.siteId} /> : null}

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
          error={state.errors?.materialSizeId?.[0]}
        />
        <input type="hidden" name="materialSizeId" value={selectedMaterialSizeId} />
      </Card>

      <Card className="mb-4">
        <TextField
          label={mode === "correct" ? "Quantity adjustment" : "Quantity"}
          name="quantity"
          type="number"
          step="any"
          required
          icon={<HashIcon className="size-4" />}
          onChange={(e) => setQuantity(e.target.value)}
          hint={
            mode === "correct"
              ? "Signed delta applied on top of the current balance — e.g. -4."
              : stock?.insufficient
                ? "This quantity exceeds the available Site Stock"
                : undefined
          }
          hintTone={mode === "new" && stock?.insufficient ? "danger" : "default"}
          error={state.errors?.quantity?.[0]}
        />
        <TextField
          label="Consumption Date"
          name="consumedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
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
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={state.errors?.notes?.[0]} />
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
        <ConfirmDialogRow label="Quantity adjustment" value={quantity || "—"} />
        <ConfirmDialogRow label="Reason" value={reason || "—"} />
      </ConfirmDialog>
    </form>
  );
}
