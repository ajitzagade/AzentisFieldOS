"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateSiteContractForm } from "./parse";
import type { SiteContractFormState } from "../../site-contract-form";

// Same AD-3 (HTTP-only) / AD-7 (shared schema) pattern as
// updateVendorAction. `siteId`/`contractId` are bound at the call site
// since a Server Action passed to useActionState only receives
// (prevState, formData).
export async function updateSiteContractAction(
  siteId: string,
  contractId: string,
  _prevState: SiteContractFormState,
  formData: FormData,
): Promise<SiteContractFormState> {
  const parsed = parseUpdateSiteContractForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/site-contracts/${contractId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  // The merged ACTIVE-requires-terms check (SiteContractsService.update)
  // returns the same { error: { details: { fieldErrors } } } shape as a
  // Zod validation failure, so this branch handles both uniformly.
  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 403) {
    return { formError: "Only an Owner/Admin can edit a Site Contract." };
  }

  if (res.status === 404) {
    return { formError: "This Site Contract no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Site Contract. Please try again." };
  }

  redirect(`/sites/${siteId}/contracts/${contractId}?flash=${encodeURIComponent("Site Contract updated")}`);
}
