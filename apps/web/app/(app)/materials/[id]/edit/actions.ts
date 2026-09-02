"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateMaterialForm } from "./parse";

export interface UpdateMaterialFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3/AD-7 pattern as sites/[id]/edit/actions.ts. `id` is bound at
// the call site since a Server Action passed to useActionState only
// receives (prevState, formData).
export async function updateMaterialAction(
  id: string,
  _prevState: UpdateMaterialFormState,
  formData: FormData,
): Promise<UpdateMaterialFormState> {
  // FR-7: Custom Fields are staged client-side (edit-material-form.tsx)
  // and submitted as one JSON-encoded hidden field alongside the rest of
  // this same form — there is no independent Custom Field endpoint. The
  // shared parse (also run client-side pre-submit) owns decoding and
  // validating that JSON, so both run sites surface the same field error.
  const parsed = parseUpdateMaterialForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/materials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Material references a Category or Unit that does not exist." };
  }

  if (res.status === 404) {
    return { formError: "This Material no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Material. Please try again." };
  }

  redirect(`/materials?flash=${encodeURIComponent("Material updated")}`);
}
