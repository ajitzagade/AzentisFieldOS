"use server";

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
    designation: formData.get("designation") || undefined,
    contact: formData.get("contact") || undefined,
    employmentTypeId: formData.get("employmentTypeId") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/team-members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Team Member references an Employment Type that does not exist." };
  }

  if (res.status === 404) {
    return { formError: "This Team Member no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Team Member. Please try again." };
  }

  redirect("/team");
}
