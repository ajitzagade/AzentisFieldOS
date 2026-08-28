"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { updateTeamMemberSchema } from "@azentisfieldos/shared";

export interface UpdateTeamMemberFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// `id` is bound at the call site since a Server Action passed to
// useActionState only receives (prevState, formData) — same pattern as
// materials/[id]/edit/actions.ts's updateMaterialAction.
export async function updateTeamMemberAction(
  id: string,
  _prevState: UpdateTeamMemberFormState,
  formData: FormData,
): Promise<UpdateTeamMemberFormState> {
  const parsed = updateTeamMemberSchema.safeParse({
    name: formData.get("name") || undefined,
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked Designation/Contact must reach the API as
    // an explicit `null` so it's actually cleared, not silently dropped
    // by JSON.stringify omitting an `undefined` key.
    designation: formData.get("designation") || null,
    contact: formData.get("contact") || null,
    employmentTypeId: formData.get("employmentTypeId") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/team-members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong updating the Team Member. Please try again." };
  }

  if (res.status === 400) {
    // Nest's default body for a plain `BadRequestException('<string>')`
    // (translateWriteError's FK-violation message) is
    // `{ statusCode, message, error: 'Bad Request' }` — `error` is a
    // string, not an object — so the real message lives at `body.message`.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This Team Member references an Employment Type that does not exist." };
  }

  if (res.status === 404) {
    return { formError: "This Team Member no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Team Member. Please try again." };
  }

  redirect(`/team?flash=${encodeURIComponent("Team Member updated")}`);
}
