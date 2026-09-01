"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { updateMachineryTypeSchema } from "@azentisfieldos/shared";
import { parseCreateMachineryTypeForm } from "./parse";

// Story 14.3: the admin list plus the Register Machine entry-form picker (AC #1).
function revalidateMachineryTypePaths() {
  revalidatePath("/machinery-vehicles/machinery-types");
  revalidatePath("/machinery-vehicles/machinery/new");
}

export interface CreateMachineryTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createMachineryTypeAction(
  _prevState: CreateMachineryTypeFormState,
  formData: FormData,
): Promise<CreateMachineryTypeFormState> {
  const parsed = parseCreateMachineryTypeForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/machinery-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "A Machinery Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Machinery Type. Please try again." };
  }

  revalidateMachineryTypePaths();
  return {};
}

// Story 14.3 (FR-49): rename via the shared updateMachineryTypeSchema (AD-7).
export interface RenameMachineryTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameMachineryTypeAction(
  id: string,
  _prevState: RenameMachineryTypeFormState,
  formData: FormData,
): Promise<RenameMachineryTypeFormState> {
  const parsed = updateMachineryTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/machinery-types/${id}`, {
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
    return { formError: body?.error?.message ?? "A Machinery Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Machinery Type. Please try again." };
  }

  revalidateMachineryTypePaths();
  return { ok: true };
}

export interface ToggleMachineryTypeFormState {
  formError?: string;
}

export async function toggleMachineryTypeAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleMachineryTypeFormState> {
  const res = await authedFetch(`/machinery-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Machinery Type. Please try again."
        : "Could not disable this Machinery Type. Please try again.",
    };
  }

  revalidateMachineryTypePaths();
  return {};
}
