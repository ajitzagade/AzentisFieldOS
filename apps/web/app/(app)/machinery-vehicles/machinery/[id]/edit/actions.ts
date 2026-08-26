"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { updateMachinerySchema } from "@azentisfieldos/shared";

export interface UpdateMachineryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// `id` is bound at the call site since a Server Action passed to
// useActionState only receives (prevState, formData) — same pattern as
// team/[id]/edit/actions.ts's updateTeamMemberAction.
export async function updateMachineryAction(
  id: string,
  _prevState: UpdateMachineryFormState,
  formData: FormData,
): Promise<UpdateMachineryFormState> {
  const parsed = updateMachinerySchema.safeParse({
    name: formData.get("name") || undefined,
    typeId: formData.get("typeId") || undefined,
    assetNumber: formData.get("assetNumber") || undefined,
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked Model/Ownership/Operator must reach the API
    // as an explicit `null` so it's actually cleared, not silently dropped
    // by JSON.stringify omitting an `undefined` key.
    model: formData.get("model") || null,
    ownership: formData.get("ownership") || null,
    operator: formData.get("operator") || null,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/machinery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong updating the Machine. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This Machine references a Machinery Type that does not exist." };
  }

  if (res.status === 404) {
    return { formError: "This Machine no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Machine. Please try again." };
  }

  redirect("/machinery-vehicles");
}
