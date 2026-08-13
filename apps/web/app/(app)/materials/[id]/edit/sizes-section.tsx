"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, PlusIcon, TextField } from "@azentisfieldos/ui";
import { addMaterialSizeAction, type AddSizeFormState } from "./add-size-action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" isLoading={pending}>
      <PlusIcon className="size-4" />
      Add Size
    </Button>
  );
}

const initialState: AddSizeFormState = {};

// FR-5, AC #2: Sizes are additive-only — existing chips render read-only,
// with no edit/remove affordance. A separate <form> from the main Material
// edit form above (HTML doesn't allow nested forms, and Sizes are a
// separate endpoint/lifecycle from the Material PATCH).
export function SizesSection({ materialId, sizes }: { materialId: string; sizes: { id: string; label: string }[] }) {
  const [state, formAction] = useActionState(addMaterialSizeAction.bind(null, materialId), initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors && !state.formError) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card className="mt-4">
      <h2 className="mb-3 text-card-title text-ink-900">Sizes / Specifications</h2>
      {sizes.length === 0 ? (
        <p className="mb-3 text-body-sm text-ink-500">No Sizes yet.</p>
      ) : (
        <div className="mb-4 flex flex-wrap gap-1">
          {sizes.map((size) => (
            <span key={size.id} className="rounded-full bg-surface-3 px-2 py-0.5 text-caption font-semibold text-ink-700">
              {size.label}
            </span>
          ))}
        </div>
      )}

      <form ref={formRef} action={formAction} noValidate className="flex items-end gap-2">
        <div className="flex-1">
          <TextField label="New Size / Specification" name="label" required maxLength={50} error={state.errors?.label?.[0]} />
        </div>
        <SubmitButton />
      </form>
      {state.formError ? (
        <p role="alert" className="mt-2 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </Card>
  );
}
