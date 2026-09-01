"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { parseAddMaterialSizeForm } from "./parse";

export interface AddSizeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// FR-5: Sizes are added via their own endpoint (POST
// /materials/:materialId/sizes), never as part of the Material PATCH —
// there is no update/delete path for a Size (AC #2), so this action's
// only job is "append," never "edit."
export async function addMaterialSizeAction(
  materialId: string,
  _prevState: AddSizeFormState,
  formData: FormData,
): Promise<AddSizeFormState> {
  const parsed = parseAddMaterialSizeForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/materials/${materialId}/sizes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Size already exists for this Material." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong adding the Size. Please try again." };
  }

  revalidatePath(`/materials/${materialId}/edit`);
  return {};
}
