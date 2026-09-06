"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateSiteForm } from "./parse";

export interface CreateSiteFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createSiteQuickAction's non-redirecting success path —
   * createSiteAction never sets this since it redirects on success instead
   * (mirrors createVendorAction/createVendorQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitSiteResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateSiteFormState };

// The shared parse+POST+error-mapping path — both createSiteAction
// (full-page /sites/new, redirects) and createSiteQuickAction (inline
// "+ Add Site" quick-create modal, returns success inline) call this so
// there is exactly one write path to POST /sites; only the navigation
// outcome differs per caller. Client- and server-side validation both
// import the same createSiteSchema instance (AD-7), so this Server
// Action's own safeParse is a fail-fast shortcut that avoids a round trip
// for obviously invalid input; the API's own ZodValidationPipe remains the
// actual source of truth.
async function submitSite(formData: FormData): Promise<SubmitSiteResult> {
  const parsed = parseCreateSiteForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { ok: false, state: { errors: body.error?.details?.fieldErrors ?? {} } };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating the Site. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3).
export async function createSiteAction(
  _prevState: CreateSiteFormState,
  formData: FormData,
): Promise<CreateSiteFormState> {
  const result = await submitSite(formData);
  if (!result.ok) return result.state;

  redirect(`/sites?flash=${encodeURIComponent("Site created")}`);
}

// Every entry-form route with a SiteField picker gets the inline "+ Add
// Site" affordance (2026-09-06 fix — Site was the one master-data entity
// left out of the original inline-quick-create pass) — revalidate every
// page a newly-created Site needs to appear in immediately.
function revalidateSitePaths() {
  revalidatePath("/sites");
  revalidatePath("/dsr/new");
  revalidatePath("/daily-activity");
  revalidatePath("/expenses/new");
  revalidatePath("/rmc/new");
  revalidatePath("/movements/purchases/new");
  revalidatePath("/movements/return-wastage/new");
  revalidatePath("/movements/consumption/new");
  revalidatePath("/movements/godown-to-site/new");
  revalidatePath("/machinery-vehicles");
  revalidatePath("/waste-disposal/new");
}

// The inline "+ Add Site" quick-create modal never navigates away, so it
// can't confirm success via the ?flash= pattern (that only exists because a
// redirect unmounts the form). Same write path as createSiteAction; the
// caller prepends { id, name } into the picker's local options and selects
// it once this resolves { success: true }.
export async function createSiteQuickAction(
  _prevState: CreateSiteFormState,
  formData: FormData,
): Promise<CreateSiteFormState> {
  const result = await submitSite(formData);
  if (!result.ok) return result.state;

  revalidateSitePaths();
  return { success: true, id: result.id, name: result.name };
}
