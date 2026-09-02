"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ConfirmDialog,
  ConfirmDialogRow,
  formValue,
  useSubmitConfirmation,
  Button,
  CalendarIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  CorrectedValueField,
  FilterIcon,
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
} from "@azentisfieldos/ui";
import { stockStatus, useSiteStock, withStockMeta } from "../../../../lib/use-site-stock";
import { useClientValidation } from "../../../../lib/use-client-validation";
import { requireOriginal } from "../../../../lib/require-original";
import { SiteField } from "../../_components/site-field";
import { createReturnWastageAction, type CreateReturnWastageFormState } from "./actions";
import { parseReturnWastageForm } from "./parse";

interface MaterialSizeOption {
  id: string;
  label: string;
  description?: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface ReturnWastageFormInitialValues {
  siteId?: string;
  materialSizeId?: string;
  kind?: "RETURN" | "WASTAGE";
  /** The original entry's quantity — required by correct mode so the user
   * can type the corrected value instead of computing a signed delta. */
  quantity?: number;
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
  // Client-side pre-submit validation runs the exact same parse as the
  // Server Action (AD-7) — inline errors without a server round-trip.
  const validation = useClientValidation(parseReturnWastageForm);
  const fieldError = (name: string) => validation.errors[name]?.[0] ?? state.errors?.[name]?.[0];
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  const [kind, setKind] = useState<"RETURN" | "WASTAGE">(initial?.kind ?? "WASTAGE");

  // Both a Return and a Wastage remove stock from the Site, so the Site's
  // current balance is shown inside the Material picker options, as a hint
  // once chosen, and as an overdraw warning once a quantity is typed
  // (FR-14). Corrections submit signed deltas, so no overdraw comparison there.
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  const [materialSizeId, setMaterialSizeId] = useState(initial?.materialSizeId ?? "");
  const [quantity, setQuantity] = useState("");
  const siteStock = useSiteStock(siteId || null);
  const materialOptions = useMemo(() => {
    const base = materialSizes.map((m) => ({ value: m.id, label: m.label, description: m.description }));
    return siteId ? withStockMeta(base, siteStock) : base;
  }, [materialSizes, siteId, siteStock]);
  const stock = siteId
    ? stockStatus({
        stock: siteStock,
        materialSizeId: materialSizeId || null,
        quantity: mode === "new" ? quantity : undefined,
        location: "this Site",
      })
    : undefined;
  // Restate the picked Material's unit on the quantity label so "50" is
  // never ambiguous (the unit rides along as the option's description).
  const selectedUnit = materialSizes.find((m) => m.id === materialSizeId)?.description;
  const unitSuffix = selectedUnit ? ` (${selectedUnit})` : "";

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
            This creates a new, linked entry — the original entry is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={fieldError("reason")} />
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
          error={fieldError("kind")}
        />
        {mode === "correct" ? <input type="hidden" name="kind" value={kind} /> : null}

        {mode === "correct" ? (
          <>
            <SelectField
              label="Site"
              name="siteId"
              required
              icon={<MapPinIcon className="size-4" />}
              disabled
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
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
            onSiteChange={setSiteId}
            error={fieldError("siteId")}
          />
        )}

        <ComboboxField
          label="Material / Size"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          options={materialOptions}
          value={materialSizeId || null}
          onValueChange={(value) => setMaterialSizeId(value ?? "")}
          placeholder="Type a Material name…"
          hint={stock?.text ?? (materialSizeId ? undefined : "Pick a Site to see its available stock")}
          hintTone={stock?.tone}
          emptyMessage="No matching Material"
          error={fieldError("materialSizeId")}
        />
        <input type="hidden" name="materialSizeId" value={materialSizeId} />
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          // The user types the value that is actually right; the signed
          // delta the ledger needs is derived and submitted for them.
          <CorrectedValueField
            label={`Corrected quantity${unitSuffix}`}
            name="quantity"
            originalValue={requireOriginal(initial?.quantity, "quantity")}
            unit={selectedUnit}
            required
            error={fieldError("quantity")}
          />
        ) : (
          <TextField
            label="Quantity"
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
          label="Date"
          name="recordedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.recordedAt ?? todayDate()}
          error={fieldError("recordedAt")}
        />
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={fieldError("notes")} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Entry"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={"Submit this correction?"}
        description={"A correction is a new, permanent ledger entry — please re-verify the details."}
        confirmLabel={"Submit Correction"}
        onConfirm={confirmation.confirm}
      >
        {/* The replay shows what the submission actually carries: the signed
            quantity delta derived from the corrected value. */}
        <ConfirmDialogRow label="Quantity change" value={formValue(confirmation.values, "quantity")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
