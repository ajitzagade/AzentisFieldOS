"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { BoxIcon, Button, Card, ComboboxField, FilterIcon, LayersIcon, PlusIcon, TextField } from "@azentisfieldos/ui";
import { createMaterialAction, type CreateMaterialFormState } from "./actions";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Create Material
    </Button>
  );
}

const initialState: CreateMaterialFormState = {};

export function NewMaterialForm({ categories, units }: { categories: Option[]; units: Option[] }) {
  const [state, formAction] = useActionState(createMaterialAction, initialState);
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");

  // AC (Task 4): a Material can't be created without an existing Category
  // and Unit to attach it to — guide the admin to create one first instead
  // of rendering an empty, unusable <select>.
  if (categories.length === 0 || units.length === 0) {
    return (
      <Card>
        <p className="mb-3 text-body-sm text-ink-500">
          {categories.length === 0 ? (
            <>
              No Categories yet —{" "}
              <Link href="/materials/categories" className="font-semibold text-accent-teal-700 underline">
                create one first
              </Link>
              .
            </>
          ) : (
            <>
              No Units yet —{" "}
              <Link href="/materials/units" className="font-semibold text-accent-teal-700 underline">
                create one first
              </Link>
              .
            </>
          )}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. OPC 53 Cement"
          error={state.errors?.name?.[0]}
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
          error={state.errors?.categoryId?.[0]}
        />
        <input type="hidden" name="categoryId" value={categoryId} />
        <ComboboxField
          label="Unit"
          required
          icon={<BoxIcon className="size-4" />}
          hint="How this Material is counted — bags, tons, cubic metres..."
          options={units.map((u) => ({ value: u.id, label: u.name }))}
          value={unitId || null}
          onValueChange={(value) => setUnitId(value ?? "")}
          placeholder="Type a Unit…"
          emptyMessage="No matching Unit"
          error={state.errors?.unitId?.[0]}
        />
        <input type="hidden" name="unitId" value={unitId} />

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
