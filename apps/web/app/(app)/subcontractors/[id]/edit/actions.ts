"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateSubcontractorForm } from "./parse";

export interface UpdateSubcontractorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only) / AD-7 (shared schema) pattern as
// updateVendorAction. `id` is bound at the call site since a Server Action
// passed to useActionState only receives (prevState, formData).
export async function updateSubcontractorAction(
  id: string,
  _prevState: UpdateSubcontractorFormState,
  formData: FormData,
): Promise<UpdateSubcontractorFormState> {
  const parsed = parseUpdateSubcontractorForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/subcontractors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong updating the Subcontractor. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } } }
      | undefined;
    return { errors: body?.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 403) {
    return { formError: "Only an Owner/Admin can edit a Subcontractor." };
  }

  if (res.status === 404) {
    return { formError: "This Subcontractor no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Subcontractor. Please try again." };
  }

  redirect(`/subcontractors?flash=${encodeURIComponent("Subcontractor updated")}`);
}
