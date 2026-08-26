"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { createMaterialCategorySchema } from "@azentisfieldos/shared";

export interface CreateMaterialCategoryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createMaterialCategoryAction(
  _prevState: CreateMaterialCategoryFormState,
  formData: FormData,
): Promise<CreateMaterialCategoryFormState> {
  const parsed = createMaterialCategorySchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/material-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Category. Please try again." };
  }

  revalidatePath("/materials/categories");
  return {};
}

export interface ToggleMaterialCategoryFormState {
  formError?: string;
}

// Bound per-row (id, nextIsActive) — a plain in-place PATCH, not a
// CorrectAction; Category is master data (DESIGN.md's Edit-vs-Correct
// distinction). Driven by useActionState (toggle-active-button.tsx) so a
// failed PATCH surfaces an inline error instead of silently no-opping.
// Deliberately doesn't declare the (prevState, formData) parameters
// useActionState calls it with — this toggle has no form fields to read
// and no need for the previous state, and a function with fewer declared
// parameters is structurally assignable wherever useActionState's action
// type is expected.
export async function toggleMaterialCategoryAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleMaterialCategoryFormState> {
  const res = await authedFetch(`/material-categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Category. Please try again."
        : "Could not disable this Category. Please try again.",
    };
  }

  revalidatePath("/materials/categories");
  revalidatePath("/materials/new");
  revalidatePath("/materials");
  return {};
}
