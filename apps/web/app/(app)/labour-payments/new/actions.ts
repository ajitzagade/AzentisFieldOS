"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateDailyLabourerForm } from "./parse";

export interface CreateDailyLabourerFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createDailyLabourerQuickAction's non-redirecting success
   * path — createDailyLabourerAction never sets this since it redirects on
   * success instead (mirrors createSubcontractorAction/
   * createSubcontractorQuickAction — spec-dsr-labour-dropdown). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitLabourerResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateDailyLabourerFormState };

// The shared parse+POST+error-mapping path — both createDailyLabourerAction
// (full-page /labour-payments/new, redirects) and
// createDailyLabourerQuickAction (inline "+ Add Labour" quick-create modal
// on the DSR Labour picker, returns success inline) call this so there is
// exactly one write path to POST /daily-labourers. Mirrors
// subcontractors/new/actions.ts's submitSubcontractor exactly.
async function submitLabourer(formData: FormData): Promise<SubmitLabourerResult> {
  const parsed = parseCreateDailyLabourerForm(formData);
  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/daily-labourers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { ok: false, state: { errors: body.error.details.fieldErrors } };
    }
    return { ok: false, state: { formError: body.error?.message ?? "Something went wrong creating this Labourer." } };
  }
  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating this Labourer. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

export async function createDailyLabourerAction(
  _prevState: CreateDailyLabourerFormState,
  formData: FormData,
): Promise<CreateDailyLabourerFormState> {
  const result = await submitLabourer(formData);
  if (!result.ok) return result.state;

  redirect(`/labour-payments/${result.id}?flash=${encodeURIComponent("Labourer added")}`);
}

// The inline "+ Add Labour" quick-create modal (DSR Labour picker,
// spec-dsr-labour-dropdown) never navigates away, so it can't confirm
// success via the ?flash= pattern (that only exists because a redirect
// unmounts the form). Same write path as createDailyLabourerAction. The
// caller prepends { id, name } into the picker's local options and selects
// it once this resolves { success: true }.
export async function createDailyLabourerQuickAction(
  _prevState: CreateDailyLabourerFormState,
  formData: FormData,
): Promise<CreateDailyLabourerFormState> {
  const result = await submitLabourer(formData);
  if (!result.ok) return result.state;

  return { success: true, id: result.id, name: result.name };
}
