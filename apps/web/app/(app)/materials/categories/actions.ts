"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { createMaterialCategorySchema, updateMaterialCategorySchema } from "@azentisfieldos/shared";

// The admin list plus every Category picker (the new-Material form and the
// materials catalog) — mirrors units/actions.ts's revalidateUnitPaths(), the
// established pattern for this kind of master-data list. A created/renamed/
// disabled Category must stop being stale wherever a Material is created.
// Centralized so the three actions below can't drift out of sync again (the
// pre-fix bug: create() revalidated only /materials/categories).
function revalidateCategoryPaths() {
  revalidatePath("/materials/categories");
  revalidatePath("/materials/new");
  revalidatePath("/materials");
}

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

  revalidateCategoryPaths();
  return {};
}

// FR-49: rename via the shared updateMaterialCategorySchema (AD-7).
export interface RenameMaterialCategoryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameMaterialCategoryAction(
  id: string,
  _prevState: RenameMaterialCategoryFormState,
  formData: FormData,
): Promise<RenameMaterialCategoryFormState> {
  const parsed = updateMaterialCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/material-categories/${id}`, {
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
    return { formError: body?.error?.message ?? "A Category with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Category. Please try again." };
  }

  revalidateCategoryPaths();
  return { ok: true };
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

  revalidateCategoryPaths();
  return {};
}
