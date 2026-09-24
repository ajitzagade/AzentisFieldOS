"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateSiteContractForm } from "./parse";
import type { SiteContractFormState } from "../site-contract-form";
import type { QuickCreateFormState } from "@azentisfieldos/ui";

type SubmitSiteContractResult =
  // Returns the raw Response on success rather than pre-parsing the body —
  // createSiteContractAction never needs it (redirects using formData's own
  // siteId), and its existing test mocks don't implement `.json()` since
  // that call was never made on the success path before this was
  // refactored to share logic with createSiteContractQuickAction below.
  | { ok: true; res: Response }
  | { ok: false; errors?: Record<string, string[]>; formError?: string };

// The shared parse+POST+error-mapping path — both createSiteContractAction
// (full-page /sites/[id]/contracts/new, redirects) and
// createSiteContractQuickAction (inline "+ Create Site Contract" quick-create
// modal on a DSR Subcontractor row, returns inline) call this so there is
// exactly one write path to POST /site-contracts, including the
// OWNER_ADMIN-only 403 branch. Mirrors submitSubcontractor's shape.
async function submitSiteContract(formData: FormData): Promise<SubmitSiteContractResult> {
  const parsed = parseCreateSiteContractForm(formData);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/site-contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { ok: false, formError: "Something went wrong creating the Site Contract. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { ok: false, errors: body.error.details.fieldErrors };
    }
    // The Subcontractor/Site existence check throws a plain
    // BadRequestException(message) — Nest wraps that as top-level
    // `{ message }`, not `{ error: { message } }`.
    return { ok: false, formError: body?.error?.message ?? body?.message ?? "This Site or Subcontractor no longer exists." };
  }

  if (res.status === 403) {
    return { ok: false, formError: "Only an Owner/Admin can engage a Subcontractor." };
  }

  if (!res.ok) {
    return { ok: false, formError: "Something went wrong creating the Site Contract. Please try again." };
  }

  return { ok: true, res };
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3). Client- and
// server-side validation both import the same createSiteContractSchema
// instance (AD-7).
export async function createSiteContractAction(
  _prevState: SiteContractFormState,
  formData: FormData,
): Promise<SiteContractFormState> {
  const result = await submitSiteContract(formData);
  if (!result.ok) return { errors: result.errors, formError: result.formError };

  const siteId = String(formData.get("siteId"));
  redirect(`/sites/${siteId}?flash=${encodeURIComponent("Site Contract added")}`);
}

// User-requested (2026-09-24): the inline "+ Create Site Contract" quick-
// create on a DSR Subcontractor row — same rich field set as the full form
// (Work Category, Rate Type, Start/End Date, Status), not the earlier
// silent bare-DRAFT auto-sync alone. Never navigates away, so it can't
// confirm success via the ?flash= pattern (that only exists because a
// redirect unmounts the form) — resolves { success: true, id, name }
// instead, matching createSubcontractorQuickAction. `name` is synthesized
// client-side by the caller (the Subcontractor's name is already known from
// the row that triggered this — POST /site-contracts's own response has no
// subcontractor relation to read it back from).
export async function createSiteContractQuickAction(
  _prevState: QuickCreateFormState,
  formData: FormData,
): Promise<QuickCreateFormState> {
  const result = await submitSiteContract(formData);
  if (!result.ok) return { errors: result.errors, formError: result.formError };

  const created = (await result.res.json()) as { id: string; workCategory: string | null; status: string };

  // Read on both the Site-initiated and Subcontractor-initiated full-form
  // routes, plus the DSR forms' own per-Site fetch — cheap enough to always
  // revalidate rather than track which caller needs which path.
  revalidatePath("/sites/[id]", "page");
  revalidatePath("/subcontractors/[id]", "page");

  return {
    success: true,
    id: created.id,
    name: `${created.workCategory ?? "General"} (${created.status === "DRAFT" ? "Draft" : created.status})`,
  };
}
