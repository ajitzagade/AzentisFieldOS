"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { createUnitSchema, updateUnitSchema } from "@azentisfieldos/shared";

// FR-49: the admin list plus every Unit picker (quick-add on /materials, the
// new-Material form, and the edit form) — a disabled Unit must stop
// appearing wherever a Material is created/edited.
function revalidateUnitPaths() {
  revalidatePath("/materials/units");
  revalidatePath("/materials/new");
  revalidatePath("/materials");
}

export interface CreateUnitFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createUnitAction(
  _prevState: CreateUnitFormState,
  formData: FormData,
): Promise<CreateUnitFormState> {
  const parsed = createUnitSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/units`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Unit. Please try again." };
  }

  revalidateUnitPaths();
  return {};
}

// FR-49: rename via the shared updateUnitSchema (AD-7).
export interface RenameUnitFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameUnitAction(
  id: string,
  _prevState: RenameUnitFormState,
  formData: FormData,
): Promise<RenameUnitFormState> {
  const parsed = updateUnitSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/units/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.error?.message ?? "A Unit with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Unit. Please try again." };
  }

  revalidateUnitPaths();
  return { ok: true };
}

export interface ToggleUnitFormState {
  formError?: string;
}

export async function toggleUnitAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleUnitFormState> {
  const res = await authedFetch(`/units/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Unit. Please try again."
        : "Could not disable this Unit. Please try again.",
    };
  }

  revalidateUnitPaths();
  return {};
}
