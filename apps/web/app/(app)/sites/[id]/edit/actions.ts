"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateSiteForm } from "./parse";

export interface UpdateSiteFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only, no Prisma import) / AD-7 (shared schema) pattern
// as story 2.1's createSiteAction. `id` is bound at the call site since a
// Server Action passed to useActionState only receives (prevState,
// formData) — see edit-site-form.tsx's `updateSiteAction.bind(null, id)`.
export async function updateSiteAction(
  id: string,
  _prevState: UpdateSiteFormState,
  formData: FormData,
): Promise<UpdateSiteFormState> {
  const parsed = parseUpdateSiteForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/sites/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 404) {
    return { formError: "This Site no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Site. Please try again." };
  }

  redirect(`/sites?flash=${encodeURIComponent("Site updated")}`);
}
