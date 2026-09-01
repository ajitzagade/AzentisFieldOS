"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateVendorForm } from "./parse";

export interface UpdateVendorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only) / AD-7 (shared schema) pattern as Story 2.1's
// updateSiteAction. `id` is bound at the call site since a Server Action
// passed to useActionState only receives (prevState, formData).
export async function updateVendorAction(
  id: string,
  _prevState: UpdateVendorFormState,
  formData: FormData,
): Promise<UpdateVendorFormState> {
  const parsed = parseUpdateVendorForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/vendors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 404) {
    return { formError: "This Vendor no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Vendor. Please try again." };
  }

  redirect(`/vendors?flash=${encodeURIComponent("Vendor updated")}`);
}
