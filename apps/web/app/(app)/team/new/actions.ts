"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateTeamMemberForm } from "./parse";

export interface CreateTeamMemberFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createTeamMemberAction(
  _prevState: CreateTeamMemberFormState,
  formData: FormData,
): Promise<CreateTeamMemberFormState> {
  const parsed = parseCreateTeamMemberForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/team-members`, {
    method: "POST",
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

  if (!res.ok) {
    return { formError: "Something went wrong creating the Team Member. Please try again." };
  }

  redirect(`/team?flash=${encodeURIComponent("Team Member added")}`);
}
