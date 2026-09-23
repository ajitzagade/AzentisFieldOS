"use server";

import { authedFetch } from "@/lib/api";
import { parseReassignSiteDateForm } from "./reassign-parse";

export interface ReassignSiteDateFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only on a resolved success — this modal never redirects (the
   * report stays at the same id, just a different Site/date), so the
   * caller closes the modal and router.refresh()es instead of following
   * the ?flash= redirect convention every other write in this app uses. */
  success?: boolean;
}

// spec-dsr-reassign-site-date: Owner-only, narrow AD-9 exception (same
// class as D7's Purchase-pricing completion, AGENTS.md) — PATCHes
// /dsr/:id/reassign. `dsrId` is bound by the caller (ReassignSiteDateTrigger,
// same .bind(null, id) convention as completePricingAction) since
// useActionState reserves the first two args for (prevState, formData).
export async function reassignDsrSiteDateAction(
  dsrId: string,
  _prevState: ReassignSiteDateFormState,
  formData: FormData,
): Promise<ReassignSiteDateFormState> {
  const parsed = parseReassignSiteDateForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/dsr/${dsrId}/reassign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong reassigning this report. Please try again." };
  }

  if (res.status === 400) {
    // ZodValidationPipe's own shape (`{ error: { details: { fieldErrors } } }`)
    // for schema failures; the two guard rejections in dsr.service.ts's
    // reassignSiteDate() are plain `BadRequestException('<string>')`, which
    // Nest serializes as `{ statusCode, message, error: 'Bad Request' }`
    // (`error` a string here, not an object) — same 400-shape handling as
    // apps/web/app/(app)/team/[id]/advances/actions.ts.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This report can't be reassigned." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong reassigning this report. Please try again." };
  }

  return { success: true };
}
