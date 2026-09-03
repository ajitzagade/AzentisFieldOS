"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateSubcontractorForm } from "./parse";

export interface CreateSubcontractorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createSubcontractorQuickAction's non-redirecting success
   * path — createSubcontractorAction never sets this since it redirects on
   * success instead (mirrors createAdvanceAction/createAdvanceQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitSubcontractorResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateSubcontractorFormState };

// The shared parse+POST+error-mapping path — both createSubcontractorAction
// (full-page /subcontractors/new, redirects) and
// createSubcontractorQuickAction (inline "+ Add Subcontractor" quick-create
// modal, returns success inline) call this so there is exactly one write
// path to POST /subcontractors, including the OWNER_ADMIN-only 403 branch.
// Client- and server-side validation both import the same
// createSubcontractorSchema instance (AD-7).
async function submitSubcontractor(formData: FormData): Promise<SubmitSubcontractorResult> {
  const parsed = parseCreateSubcontractorForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  let res: Response;
  try {
    res = await authedFetch(`/subcontractors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { ok: false, state: { formError: "Something went wrong creating the Subcontractor. Please try again." } };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } } }
      | undefined;
    return { ok: false, state: { errors: body?.error?.details?.fieldErrors ?? {} } };
  }

  if (res.status === 403) {
    return { ok: false, state: { formError: "Only an Owner/Admin can add a Subcontractor." } };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating the Subcontractor. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3).
export async function createSubcontractorAction(
  _prevState: CreateSubcontractorFormState,
  formData: FormData,
): Promise<CreateSubcontractorFormState> {
  const result = await submitSubcontractor(formData);
  if (!result.ok) return result.state;

  redirect(`/subcontractors?flash=${encodeURIComponent("Subcontractor added")}`);
}

// Every entry-form route with a Subcontractor picker (inline quick-create
// spec) — the admin list plus the Site Contract form.
function revalidateSubcontractorPaths() {
  revalidatePath("/subcontractors");
  revalidatePath("/sites/[id]/contracts", "page");
}

// The inline "+ Add Subcontractor" quick-create modal never navigates away,
// so it can't confirm success via the ?flash= pattern (that only exists
// because a redirect unmounts the form). Same write path as
// createSubcontractorAction — including the same OWNER_ADMIN-only 403,
// surfaced as `formError` exactly as the full form shows it. The caller
// prepends { id, name } into the picker's local options and selects it once
// this resolves { success: true }.
export async function createSubcontractorQuickAction(
  _prevState: CreateSubcontractorFormState,
  formData: FormData,
): Promise<CreateSubcontractorFormState> {
  const result = await submitSubcontractor(formData);
  if (!result.ok) return result.state;

  revalidateSubcontractorPaths();
  return { success: true, id: result.id, name: result.name };
}
