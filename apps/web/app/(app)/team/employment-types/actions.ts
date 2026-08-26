"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import {
  createEmploymentTypeSchema,
  updateEmploymentTypeSchema,
} from "@azentisfieldos/shared";

export interface CreateEmploymentTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Story 14.3: the paths a disabled/renamed Employment Type must be reflected on
// immediately — the admin list, plus the Team Member entry form's picker (AC #1).
function revalidateEmploymentTypePaths() {
  revalidatePath("/team/employment-types");
  revalidatePath("/team/new");
}

export async function createEmploymentTypeAction(
  _prevState: CreateEmploymentTypeFormState,
  formData: FormData,
): Promise<CreateEmploymentTypeFormState> {
  const parsed = createEmploymentTypeSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/employment-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "An Employment Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Employment Type. Please try again." };
  }

  revalidateEmploymentTypePaths();
  return {};
}

// Story 14.3 (FR-49): rename via the shared updateEmploymentTypeSchema (AD-7).
export interface RenameEmploymentTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameEmploymentTypeAction(
  id: string,
  _prevState: RenameEmploymentTypeFormState,
  formData: FormData,
): Promise<RenameEmploymentTypeFormState> {
  const parsed = updateEmploymentTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/employment-types/${id}`, {
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
    return { formError: body?.error?.message ?? "An Employment Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Employment Type. Please try again." };
  }

  revalidateEmploymentTypePaths();
  return { ok: true };
}

// Bound per-row (id, nextIsActive) — a plain in-place PATCH, master data (not an
// AD-9 correction). Driven by useActionState so a failed PATCH surfaces an
// inline error instead of silently no-opping.
export interface ToggleEmploymentTypeFormState {
  formError?: string;
}

export async function toggleEmploymentTypeAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleEmploymentTypeFormState> {
  const res = await authedFetch(`/employment-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Employment Type. Please try again."
        : "Could not disable this Employment Type. Please try again.",
    };
  }

  revalidateEmploymentTypePaths();
  return {};
}
