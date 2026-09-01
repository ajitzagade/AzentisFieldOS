"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AmountField, Button, CalendarIcon, Card, CheckCircleIcon, FilterIcon, PencilIcon, PlusIcon, SelectField, TextField } from "@azentisfieldos/ui";
import { createServiceLogAction, updateServiceLogAction, type ServiceLogFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseCreateServiceLogForm, parseUpdateServiceLogForm } from "./parse";
import type { ServiceLogKind } from "./service-history";

export interface ServiceLogFormInitialValues {
  kind?: ServiceLogKind;
  notes?: string;
  cost?: string;
  serviceDate?: string;
}

function SubmitButton({ label, editing }: { label: string; editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {editing ? <CheckCircleIcon className="size-4" /> : <PlusIcon className="size-4" />}
      {label}
    </Button>
  );
}

const initialState: ServiceLogFormState = {};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

type ServiceLogFormProps = {
  assetType: "MACHINERY" | "VEHICLE";
  assetId: string;
  initial?: ServiceLogFormInitialValues;
} & ({ mode: "new" } | { mode: "edit"; logId: string });

// FR-18: one form, shared by Machinery and Vehicle (AD-5, AD-7) — logs a
// fuel/maintenance/repair entry with a kind, a service date, and optional
// notes/cost. AC #2: the same form backs both "new" (POST) and "edit"
// (PATCH) — a normal Edit affordance, never a CorrectAction, so unlike
// AssetMovementForm there is no correction-mode banner here.
export function ServiceLogForm(props: ServiceLogFormProps) {
  const { assetType, assetId, initial } = props;
  const boundAction =
    props.mode === "new" ? createServiceLogAction : updateServiceLogAction.bind(null, props.logId, assetType);
  const [state, formAction] = useActionState(boundAction, initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(props.mode === "new" ? parseCreateServiceLogForm : parseUpdateServiceLogForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  return (
    <form action={formAction} onSubmit={validation.guard()} noValidate>
      <input type="hidden" name="assetType" value={assetType} />
      <input type="hidden" name="assetId" value={assetId} />

      <Card className="mb-4">
        <SelectField
          label="Kind"
          name="kind"
          required
          icon={<FilterIcon className="size-4" />}
          defaultValue={initial?.kind ?? "FUEL"}
          options={[
            { value: "FUEL", label: "Fuel" },
            { value: "MAINTENANCE", label: "Maintenance" },
            { value: "REPAIR", label: "Repair" },
          ]}
          error={errorFor("kind")}
        />
        <TextField
          label="Service Date"
          name="serviceDate"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          defaultValue={initial?.serviceDate ?? todayDate()}
          error={errorFor("serviceDate")}
        />
        <AmountField
          label="Cost"
          name="cost"
          min={0}
          hint="Optional"
          defaultValue={initial?.cost}
          error={errorFor("cost")}
        />
        <TextField
          label="Notes"
          name="notes"
          hint="Optional"
          maxLength={1000}
          icon={<PencilIcon className="size-4" />}
          defaultValue={initial?.notes}
          error={errorFor("notes")}
        />
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={props.mode === "edit" ? "Save Changes" : "Log Entry"} editing={props.mode === "edit"} />
    </form>
  );
}
