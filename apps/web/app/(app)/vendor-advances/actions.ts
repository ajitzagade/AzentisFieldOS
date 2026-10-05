"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCorrectVendorAdvanceForm } from "./parse";

export interface CorrectVendorAdvanceFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// The single write path to POST /vendor-advances (AD-9: this endpoint only
// ever accepts a correction — there is no standalone create, see that
// schema's own comment).
export async function correctVendorAdvanceAction(
  _prevState: CorrectVendorAdvanceFormState,
  formData: FormData,
): Promise<CorrectVendorAdvanceFormState> {
  const parsed = parseCorrectVendorAdvanceForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/vendor-advances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the correction. Please try again." };
  }

  if (res.status === 400) {
    // ZodValidationPipe's own body for schema failures, or Nest's default
    // body for a plain BadRequestException('<string>') (the
    // correctsId-doesn't-exist message) — same two shapes every other
    // correction action handles.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return {
      formError: body?.message ?? "This Vendor Advance could not be corrected.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the correction. Please try again." };
  }

  // Redirect target comes from the server-confirmed row, not a client-
  // supplied hidden field — a tampered/stale vendorId would otherwise
  // misdirect the browser to the wrong Vendor's page after a successful
  // write. Falls back to the Vendors list if the response is unexpectedly
  // missing it — the correction itself already succeeded by this point.
  const created = (await res.json().catch(() => undefined)) as { vendorId?: string } | undefined;
  const destination = created?.vendorId ? `/vendors/${created.vendorId}` : "/vendors";
  redirect(`${destination}?flash=${encodeURIComponent("Vendor Advance correction recorded")}`);
}
