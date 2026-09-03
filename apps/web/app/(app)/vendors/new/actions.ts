"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateVendorForm } from "./parse";

export interface CreateVendorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createVendorQuickAction's non-redirecting success path —
   * createVendorAction never sets this since it redirects on success
   * instead (mirrors createAdvanceAction/createAdvanceQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitVendorResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateVendorFormState };

// The shared parse+POST+error-mapping path — both createVendorAction
// (full-page /vendors/new, redirects) and createVendorQuickAction (inline
// "+ Add Vendor" quick-create modal, returns success inline) call this so
// there is exactly one write path to POST /vendors; only the navigation
// outcome differs per caller. Client- and server-side validation both
// import the same createVendorSchema instance (AD-7).
async function submitVendor(formData: FormData): Promise<SubmitVendorResult> {
  const parsed = parseCreateVendorForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { ok: false, state: { errors: body.error?.details?.fieldErrors ?? {} } };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating the Vendor. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3).
export async function createVendorAction(
  _prevState: CreateVendorFormState,
  formData: FormData,
): Promise<CreateVendorFormState> {
  const result = await submitVendor(formData);
  if (!result.ok) return result.state;

  redirect(`/vendors?flash=${encodeURIComponent("Vendor added")}`);
}

// Every entry-form route with a Vendor picker (inline quick-create spec) —
// the admin list plus every combobox that lists Vendors by name.
function revalidateVendorPaths() {
  revalidatePath("/vendors");
  revalidatePath("/movements/purchases/new");
  revalidatePath("/rmc/new");
  revalidatePath("/waste-disposal/new");
  revalidatePath("/daily-activity");
  revalidatePath("/dsr/new");
}

// The inline "+ Add Vendor" quick-create modal never navigates away, so it
// can't confirm success via the ?flash= pattern (that only exists because a
// redirect unmounts the form). Same write path as createVendorAction; the
// caller prepends { id, name } into the picker's local options and selects
// it once this resolves { success: true }.
export async function createVendorQuickAction(
  _prevState: CreateVendorFormState,
  formData: FormData,
): Promise<CreateVendorFormState> {
  const result = await submitVendor(formData);
  if (!result.ok) return result.state;

  revalidateVendorPaths();
  return { success: true, id: result.id, name: result.name };
}
