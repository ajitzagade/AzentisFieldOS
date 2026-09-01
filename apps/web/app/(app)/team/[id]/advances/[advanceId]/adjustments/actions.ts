"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateAdvanceAdjustmentForm } from "./parse";

export interface CreateAdvanceAdjustmentFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Adjustment entry and a correction of
// one — POST /advance-adjustments branches on correctsId, same
// uniform-write-path design as Story 7.1's createAdvanceAction.
export async function createAdvanceAdjustmentAction(
  _prevState: CreateAdvanceAdjustmentFormState,
  formData: FormData,
): Promise<CreateAdvanceAdjustmentFormState> {
  const teamMemberId = formData.get("teamMemberId") as string;

  const parsed = parseCreateAdvanceAdjustmentForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/advance-adjustments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Adjustment. Please try again." };
  }

  if (res.status === 400) {
    // Three distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures,
    // AdvanceAdjustmentsService's own `{ error: { code, message } }` for
    // the AC #1 cap check (AC #1: surfaced inline next to Amount, not a
    // generic toast, whether caught client-side or here), and Nest's
    // default body for a plain `BadRequestException('<string>')`
    // (`{ statusCode, message, error: 'Bad Request' }`, where `error` is
    // a string) for translateWriteError/the correction-mismatch message.
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
      return { errors: body.error.details.fieldErrors };
    }
    if (body?.error?.code === "ADJUSTMENT_EXCEEDS_BALANCE") {
      return { errors: { amount: [body.error.message ?? "Adjustment cannot exceed the current Outstanding Balance."] } };
    }
    return { formError: body?.message ?? "This Adjustment references an Advance that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Adjustment. Please try again." };
  }

  redirect(
    `/team/${teamMemberId}?flash=${encodeURIComponent(formData.get("correctsId") ? "Adjustment correction recorded" : "Advance Adjustment recorded")}`,
  );
}
