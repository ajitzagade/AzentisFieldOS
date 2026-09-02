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
  HashIcon,
  LayersIcon,
  MapPinIcon,
  PencilIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TruckIcon,
  UserIcon,
} from "@azentisfieldos/ui";
import { stockStatus, useStock, withStockMeta } from "../../../../lib/use-site-stock";
import { useClientValidation } from "../../../../lib/use-client-validation";
import { requireOriginal } from "../../../../lib/require-original";
import { SiteField } from "../../_components/site-field";
import { createMovementAction, type CreateMovementFormState } from "./actions";
import { parseMovementForm } from "./parse";

interface MaterialSizeOption {
  id: string;
  label: string;
  description?: string;
}

interface SiteOption {
  id: string;
  name: string;
}

export interface MovementFormInitialValues {
  materialSizeId?: string;
  sourceSiteId?: string;
  destinationSiteId?: string;
  /** The original Movement's sent quantity — required by correct mode so
   * the user can type the corrected value instead of computing a delta. */
  sentQuantity?: number;
  vehicleDetails?: string;
  personResponsible?: string;
  notes?: string;
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

const initialState: CreateMovementFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function MovementForm({
  mode,
  kind = "GODOWN_TO_SITE",
  correctsId,
  materialSizes,
  sites,
  initial,
  teamNames = [],
}: {
  mode: "new" | "correct";
  /** Story 5.4: SITE_TO_SITE reuses this same form/schema/service with a
   * Source Site picker instead of an implicit Godown source — not a
   * duplicated field list (AD-7). */
  kind?: "GODOWN_TO_SITE" | "SITE_TO_SITE";
  correctsId?: string;
  materialSizes: MaterialSizeOption[];
  sites: SiteOption[];
  initial?: MovementFormInitialValues;
  /** Team Member names for the Person Responsible datalist — suggestions
   * only; any free-typed name is accepted and stored as plain text. */
  teamNames?: string[];
}) {
  const [state, formAction] = useActionState(createMovementAction, initialState);
  // Client-side pre-submit validation runs the exact same parse as the
  // Server Action (AD-7) — inline errors without a server round-trip.
  const validation = useClientValidation(parseMovementForm);
  const fieldError = (name: string) => validation.errors[name]?.[0] ?? state.errors?.[name]?.[0];
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();

  // A Movement drains its source, so availability is read from wherever the
  // stock leaves: the Godown for GODOWN_TO_SITE, the chosen Source Site for
  // SITE_TO_SITE (FR-14). Shown inside the picker options while searching,
  // as a hint once chosen, and as an overdraw warning once a quantity is
  // typed. Corrections submit signed deltas, so no overdraw comparison there.
  const [materialSizeId, setMaterialSizeId] = useState(initial?.materialSizeId ?? "");
  const [sourceSiteId, setSourceSiteId] = useState(initial?.sourceSiteId ?? "");
  const [sentQuantity, setSentQuantity] = useState("");
  const sourceLocation = kind === "GODOWN_TO_SITE" ? "the Godown" : "the source Site";
  const sourceStock = useStock(
    kind === "GODOWN_TO_SITE" ? { kind: "godown" } : sourceSiteId ? { kind: "site", siteId: sourceSiteId } : null,
  );
  const sourceKnown = kind === "GODOWN_TO_SITE" || Boolean(sourceSiteId);
  const materialOptions = useMemo(() => {
    const base = materialSizes.map((m) => ({ value: m.id, label: m.label, description: m.description }));
    return sourceKnown ? withStockMeta(base, sourceStock) : base;
  }, [materialSizes, sourceKnown, sourceStock]);
  const stock = sourceKnown
    ? stockStatus({
        stock: sourceStock,
        materialSizeId: materialSizeId || null,
        quantity: mode === "new" ? sentQuantity : undefined,
        location: sourceLocation,
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
      <input type="hidden" name="kind" value={kind} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked entry — the original Movement is never edited or deleted (AD-9).
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={fieldError("reason")} />
        </Card>
      ) : null}

      <Card className="mb-4">
        {kind === "SITE_TO_SITE" ? (
          mode === "correct" ? (
            <>
              <SelectField
                label="Source Site"
                name="sourceSiteId"
                required
                icon={<MapPinIcon className="size-4" />}
                disabled
                value={sourceSiteId}
                onChange={(e) => setSourceSiteId(e.target.value)}
                options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
                error={fieldError("sourceSiteId")}
              />
              <input type="hidden" name="sourceSiteId" value={initial?.sourceSiteId} />
            </>
          ) : (
            // The source is where stock leaves — deliberately NOT the
            // device-remembered Site (that convenience is for destinations),
            // so a stale remembered value can never silently drain the
            // wrong Site.
            <SiteField
              sites={sites}
              name="sourceSiteId"
              label="Source Site"
              remember={false}
              required
              initialSiteId={initial?.sourceSiteId}
              onSiteChange={setSourceSiteId}
              error={fieldError("sourceSiteId")}
            />
          )
        ) : null}

        <ComboboxField
          label="Material / Size"
          required
          icon={<LayersIcon className="size-4" />}
          disabled={mode === "correct"}
          options={materialOptions}
          value={materialSizeId || null}
          onValueChange={(value) => setMaterialSizeId(value ?? "")}
          placeholder="Type a Material name…"
          hint={
            stock?.text ??
            (kind === "SITE_TO_SITE" && !sourceSiteId ? "Pick a Source Site to see its available stock" : undefined)
          }
          hintTone={stock?.tone}
          emptyMessage="No matching Material"
          error={fieldError("materialSizeId")}
        />
        <input type="hidden" name="materialSizeId" value={materialSizeId} />

        {mode === "correct" ? (
          <>
            <SelectField
              label="Destination Site"
              name="destinationSiteId"
              required
              icon={<MapPinIcon className="size-4" />}
              disabled
              defaultValue={initial?.destinationSiteId ?? ""}
              options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
              error={fieldError("destinationSiteId")}
            />
            <input type="hidden" name="destinationSiteId" value={initial?.destinationSiteId} />
          </>
        ) : (
          <SiteField
            sites={sites}
            name="destinationSiteId"
            label="Destination Site"
            required
            initialSiteId={initial?.destinationSiteId}
            error={fieldError("destinationSiteId")}
          />
        )}
      </Card>

      <Card className="mb-4">
        {mode === "correct" ? (
          // The user types the value that is actually right; the signed
          // delta the ledger needs is derived and submitted for them.
          <CorrectedValueField
            label={`Corrected sent quantity${unitSuffix}`}
            name="sentQuantity"
            originalValue={requireOriginal(initial?.sentQuantity, "sent quantity")}
            unit={selectedUnit}
            required
            error={fieldError("sentQuantity")}
          />
        ) : (
          <TextField
            label={`Sent Quantity${unitSuffix}`}
            name="sentQuantity"
            type="number"
            step="any"
            inputMode="decimal"
            required
            icon={<HashIcon className="size-4" />}
            onChange={(e) => setSentQuantity(e.target.value)}
            hint={stock?.insufficient ? `This quantity exceeds the stock available at ${sourceLocation}` : undefined}
            hintTone={stock?.insufficient ? "danger" : "default"}
            error={fieldError("sentQuantity")}
          />
        )}
        <TextField
          label="Movement Date"
          name="movedAt"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.movedAt ?? todayDate()}
          error={fieldError("movedAt")}
        />
      </Card>

      <Card className="mb-4">
        <TextField
          label="Vehicle Details"
          name="vehicleDetails"
          hint="Optional"
          icon={<TruckIcon className="size-4" />}
          placeholder="e.g. MH12AB1234"
          defaultValue={initial?.vehicleDetails}
          error={fieldError("vehicleDetails")}
        />
        {/* Native datalist: suggests Team Member names while still accepting
            any free-typed name — the typed text is stored as-is, never added
            to the Team roster. */}
        <TextField
          label="Person Responsible"
          name="personResponsible"
          hint="Optional — pick a team member or type any name"
          icon={<UserIcon className="size-4" />}
          defaultValue={initial?.personResponsible}
          list="movement-person-names"
          error={fieldError("personResponsible")}
        />
        <datalist id="movement-person-names">
          {teamNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <TextField label="Notes" name="notes" hint="Optional" icon={<PencilIcon className="size-4" />} defaultValue={initial?.notes} error={fieldError("notes")} />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton
        label={mode === "correct" ? "Submit Correction" : kind === "SITE_TO_SITE" ? "Record Transfer" : "Record Movement"}
        correcting={mode === "correct"}
      />

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
        <ConfirmDialogRow label="Sent quantity change" value={formValue(confirmation.values, "sentQuantity")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

    </form>
  );
}
