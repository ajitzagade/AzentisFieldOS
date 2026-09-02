"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateAdvanceForm } from "./parse";

export interface CreateAdvanceFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createAdvanceQuickAction's non-redirecting success path
   * (Story 19.1) — createAdvanceAction never sets this since it redirects
   * on success instead. */
  success?: boolean;
}

type SubmitAdvanceResult =
  | { ok: true }
  | { ok: false; state: CreateAdvanceFormState };

// The shared parse+POST+error-mapping path (Story 19.1) — both
// createAdvanceAction (full-page entry, redirects) and
// createAdvanceQuickAction (Dashboard quick-entry modal, returns success
// inline) call this so there is exactly one write path to POST /advances;
// only the navigation outcome differs per caller.
async function submitAdvance(formData: FormData): Promise<SubmitAdvanceResult> {
  const parsed = parseCreateAdvanceForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  let res: Response;
  try {
    res = await authedFetch(`/advances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { ok: false, state: { formError: "Something went wrong recording the Advance. Please try again." } };
  }

  if (res.status === 400) {
    // Three distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures,
    // decrementOutstandingBalanceWithFloorCheck's own
    // `{ error: { code: 'ADJUSTMENT_EXCEEDS_BALANCE', message } }` when a
    // negative correction would take the Outstanding Balance below zero
    // (surfaced inline next to Amount, not a generic toast — same handling
    // as Story 7.2's createAdvanceAdjustmentAction), and Nest's default
    // body for a plain `BadRequestException('<string>')`
    // (`{ statusCode, message, error: 'Bad Request' }`, where `error` is a
    // string) for translateWriteError/the correction-mismatch message.
    const body = (await res.json().catch(() => undefined)) as
      | {
          error?: {
            code?: string;
            message?: string;
            details?: { fieldErrors?: Record<string, string[]> };
          };
          message?: string;
        }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { ok: false, state: { errors: body.error.details.fieldErrors } };
    }
    if (body?.error?.code === "ADJUSTMENT_EXCEEDS_BALANCE") {
      return {
        ok: false,
        state: {
          errors: { amount: [body.error.message ?? "This correction would take the Outstanding Balance below zero."] },
        },
      };
    }
    return {
      ok: false,
      state: { formError: body?.message ?? "This Advance references a Team Member that does not exist." },
    };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong recording the Advance. Please try again." } };
  }

  return { ok: true };
}

// One Server Action for both a plain Advance entry and a correction of
// one — POST /advances branches on correctsId, same uniform-write-path
// design as Story 5.1's createPurchaseAction.
export async function createAdvanceAction(
  _prevState: CreateAdvanceFormState,
  formData: FormData,
): Promise<CreateAdvanceFormState> {
  const teamMemberId = formData.get("teamMemberId") as string;

  const result = await submitAdvance(formData);
  if (!result.ok) return result.state;

  redirect(
    `/team/${teamMemberId}?flash=${encodeURIComponent(formData.get("correctsId") ? "Advance correction recorded" : "Advance recorded")}`,
  );
}

// Story 19.1: the Dashboard's Outstanding Advances quick-entry modal never
// navigates away, so it can't confirm success via the ?flash= pattern
// (that only exists because a redirect unmounts the form — see
// flash-toast.tsx). Same write path as createAdvanceAction; the caller
// calls toast.success() and closes the modal itself once this resolves
// { success: true }.
export async function createAdvanceQuickAction(
  _prevState: CreateAdvanceFormState,
  formData: FormData,
): Promise<CreateAdvanceFormState> {
  const result = await submitAdvance(formData);
  if (!result.ok) return result.state;
  return { success: true };
}
