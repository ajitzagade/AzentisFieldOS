"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, TextField } from "@azentisfieldos/ui";

// Story 14.3 (FR-49): the shared rename + disable/enable row controls for every
// admin-configurable category family (Employment / Machinery / Vehicle Types,
// Expense Categories). One implementation (AD-5), driven by the per-family
// server actions passed in as props (already bound to that row's id), so a
// failed PATCH surfaces an inline error instead of silently no-opping.

export interface RenameCategoryState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export interface ToggleCategoryState {
  formError?: string;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" isLoading={pending}>
      Save
    </Button>
  );
}

function ToggleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-caption text-accent-teal-700 underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export function CategoryRowActions({
  name,
  isActive,
  renameAction,
  toggleAction,
}: {
  name: string;
  isActive: boolean;
  // Bound to this row's id in the parent (server) component.
  renameAction: (
    prev: RenameCategoryState,
    formData: FormData,
  ) => Promise<RenameCategoryState>;
  toggleAction: (
    prev: ToggleCategoryState,
    formData: FormData,
  ) => Promise<ToggleCategoryState>;
}) {
  // A successful rename revalidates the list and changes this row's `name`,
  // which the parent uses as part of the React key — so the component remounts
  // fresh (editor closed) without a setState-in-effect. A failed rename keeps
  // the same name (no remount), so the inline error stays visible.
  const [editing, setEditing] = useState(false);
  const [renameState, renameFormAction] = useActionState<RenameCategoryState, FormData>(
    renameAction,
    {},
  );
  const [toggleState, toggleFormAction] = useActionState<ToggleCategoryState, FormData>(
    toggleAction,
    {},
  );

  if (editing && !renameState.ok) {
    return (
      <div className="flex flex-col items-end gap-1">
        <form action={renameFormAction} noValidate className="flex items-end gap-2">
          <TextField
            label={`Rename ${name}`}
            name="name"
            defaultValue={name}
            required
            maxLength={100}
            className="mb-0"
            error={renameState.errors?.name?.[0]}
          />
          <SaveButton />
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
        {renameState.formError ? (
          <p role="alert" className="text-caption text-danger-700">
            {renameState.formError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-caption text-accent-teal-700 underline"
        >
          Rename
        </button>
        <form action={toggleFormAction}>
          <ToggleButton label={isActive ? "Disable" : "Enable"} />
        </form>
      </div>
      {toggleState.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {toggleState.formError}
        </p>
      ) : null}
    </div>
  );
}
