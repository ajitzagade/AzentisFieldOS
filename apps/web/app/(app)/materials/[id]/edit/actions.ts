"use server";

import { redirect } from "next/navigation";
import { updateMaterialSchema } from "@azentisfieldos/shared";

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
  // this same form — there is no independent Custom Field endpoint.
  const rawCustomFields = formData.get("customFields");
  let customFields: unknown;
  if (typeof rawCustomFields === "string" && rawCustomFields.length > 0) {
    try {
      customFields = JSON.parse(rawCustomFields);
    } catch {
      return { formError: "Something went wrong reading the Custom Fields. Please try again." };
    }
  }

  // Empty means "clear the threshold" (null), not "field omitted" — unlike
  // the other optional() fields above, lowStockThreshold is nullable(), so
  // an explicit null is meaningful input, not something to coerce away.
  const rawLowStockThreshold = formData.get("lowStockThreshold");
  const lowStockThreshold =
    typeof rawLowStockThreshold === "string" && rawLowStockThreshold.length > 0 ? Number(rawLowStockThreshold) : null;

  const parsed = updateMaterialSchema.safeParse({
    // FormData.get() returns null (not undefined) for an absent field —
    // z.uuid().optional() / z.string().min(1).optional() accept undefined
    // but reject null, so this must be coerced explicitly (same pattern
    // sites/new/actions.ts already uses for contractReference).
    name: formData.get("name") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    unitId: formData.get("unitId") || undefined,
    isActive: formData.get("isActive") === "true",
    customFields,
    lowStockThreshold,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/materials/${id}`, {
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

  redirect("/materials");
}
