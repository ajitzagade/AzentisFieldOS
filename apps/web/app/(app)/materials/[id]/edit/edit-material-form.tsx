"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Badge, BoxIcon, Button, Card, CheckCircleIcon, ComboboxField, FilterIcon, HashIcon, LayersIcon, PencilIcon, PlusIcon, SelectField, TextField } from "@azentisfieldos/ui";
import type { CustomFieldDefinition, CustomFieldType } from "@azentisfieldos/shared";
import { updateMaterialAction, type UpdateMaterialFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseUpdateMaterialForm } from "./parse";
import type { MaterialDetail } from "./page";

interface Option {
  id: string;
  name: string;
}

const CUSTOM_FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <CheckCircleIcon className="size-4" />
      Save Changes
    </Button>
  );
}

const initialState: UpdateMaterialFormState = {};

// Material is master data, not transaction history — a normal in-place
// Edit form (never CorrectAction), per DESIGN.md/EXPERIENCE.md's
// Edit-vs-Correct distinction.
export function EditMaterialForm({
  material,
  categories,
  units,
}: {
  material: MaterialDetail;
  categories: Option[];
  units: Option[];
}) {
  const [state, formAction] = useActionState(updateMaterialAction.bind(null, material.id), initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseUpdateMaterialForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];
  const [isActive, setIsActive] = useState(material.isActive);
  const [categoryId, setCategoryId] = useState(material.category.id);
  const [unitId, setUnitId] = useState(material.unit.id);

  // FR-7: Custom Fields are edited via this same Material PATCH, not a
  // separate endpoint (unlike Sizes) — staged locally and submitted as one
  // JSON-encoded hidden field alongside the rest of the form.
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(material.customFields);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("TEXT");

  function addCustomField() {
    if (!newLabel.trim()) return;
    setCustomFields((fields) => [...fields, { label: newLabel.trim(), type: newType }]);
    setNewLabel("");
    setNewType("TEXT");
  }

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          defaultValue={material.name}
          error={errorFor("name")}
        />
        <ComboboxField
          label="Category"
          required
          icon={<FilterIcon className="size-4" />}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId || null}
          onValueChange={(value) => setCategoryId(value ?? "")}
          placeholder="Type a Category…"
          emptyMessage="No matching Category"
          error={errorFor("categoryId")}
        />
        <input type="hidden" name="categoryId" value={categoryId} />
        <ComboboxField
          label="Unit"
          required
          icon={<BoxIcon className="size-4" />}
          options={units.map((u) => ({ value: u.id, label: u.name }))}
          value={unitId || null}
          onValueChange={(value) => setUnitId(value ?? "")}
          placeholder="Type a Unit…"
          emptyMessage="No matching Unit"
          error={errorFor("unitId")}
        />
        <input type="hidden" name="unitId" value={unitId} />
        <TextField
          label="Low-stock threshold"
          name="lowStockThreshold"
          type="number"
          step="any"
          min={0}
          icon={<HashIcon className="size-4" />}
          hint="Optional — flags this Material on the Inventory page once its Godown stock (summed across all Sizes) falls below this. Leave blank to never flag it."
          defaultValue={material.lowStockThreshold ?? undefined}
          error={errorFor("lowStockThreshold")}
        />

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 accent-accent-teal-700"
          />
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
          <label htmlFor="isActive" className="text-body-sm text-ink-900">
            Active — visible in Material pickers for new entries
          </label>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 text-card-title text-ink-900">Custom Fields</h2>
          {customFields.length === 0 ? (
            <p className="mb-3 text-body-sm text-ink-500">No Custom Fields yet.</p>
          ) : (
            <ul className="mb-3 flex flex-col gap-2">
              {customFields.map((field, index) => (
                <li key={index} className="flex items-center gap-2 text-body-sm text-ink-900">
                  {field.label}
                  <Badge variant="neutral">{field.type}</Badge>
                </li>
              ))}
            </ul>
          )}
          <input type="hidden" name="customFields" value={JSON.stringify(customFields)} />
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <TextField
                label="New field label"
                hint="e.g. Brand, Warranty Expiry"
                icon={<PencilIcon className="size-4" />}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <SelectField
              label="Type"
              icon={<FilterIcon className="size-4" />}
              value={newType}
              onChange={(e) => setNewType(e.target.value as CustomFieldType)}
              options={CUSTOM_FIELD_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Button type="button" variant="secondary" onClick={addCustomField} className="mt-6">
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
          {state.errors?.customFields?.[0] ? (
            <p role="alert" className="mt-1 text-caption text-danger-700">
              {state.errors.customFields[0]}
            </p>
          ) : null}
        </div>

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
