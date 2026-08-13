"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, SelectField, TextField } from "@azentisfieldos/ui";
import { createMaterialAction, type CreateMaterialFormState } from "./actions";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Create Material
    </Button>
  );
}

const initialState: CreateMaterialFormState = {};

export function NewMaterialForm({ categories, units }: { categories: Option[]; units: Option[] }) {
  const [state, formAction] = useActionState(createMaterialAction, initialState);

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
        <TextField label="Name" name="name" required maxLength={200} error={state.errors?.name?.[0]} />
        <SelectField
          label="Category"
          name="categoryId"
          required
          defaultValue=""
          options={[{ value: "", label: "Select a Category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          error={state.errors?.categoryId?.[0]}
        />
        <SelectField
          label="Unit"
          name="unitId"
          required
          defaultValue=""
          options={[{ value: "", label: "Select a Unit" }, ...units.map((u) => ({ value: u.id, label: u.name }))]}
          error={state.errors?.unitId?.[0]}
        />

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
