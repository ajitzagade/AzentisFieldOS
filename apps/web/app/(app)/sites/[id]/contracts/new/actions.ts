"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateSiteContractForm } from "./parse";
import type { SiteContractFormState } from "../site-contract-form";

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3). Client- and
// server-side validation both import the same createSiteContractSchema
// instance (AD-7).
export async function createSiteContractAction(
  _prevState: SiteContractFormState,
  formData: FormData,
): Promise<SiteContractFormState> {
  const parsed = parseCreateSiteContractForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const siteId = String(formData.get("siteId"));

  const res = await authedFetch(`/site-contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 403) {
    return { formError: "Only an Owner/Admin can engage a Subcontractor." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Site Contract. Please try again." };
  }

  redirect(`/sites/${siteId}?flash=${encodeURIComponent("Site Contract added")}`);
}
