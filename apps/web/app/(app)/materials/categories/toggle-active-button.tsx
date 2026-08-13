"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toggleMaterialCategoryAction, type ToggleMaterialCategoryFormState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-caption text-accent-teal-700 underline disabled:opacity-50">
      {label}
    </button>
  );
}

const initialState: ToggleMaterialCategoryFormState = {};

// A failed toggle must surface an error, not silently no-op — the plain
// <form action={serverAction}> pattern used elsewhere on this page (the
// add-Category form) can't show feedback for a per-row action without
// useActionState, which is why this is its own client component.
export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [state, formAction] = useActionState(toggleMaterialCategoryAction.bind(null, id, !isActive), initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <SubmitButton label={isActive ? "Disable" : "Enable"} />
      </form>
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </div>
  );
}
