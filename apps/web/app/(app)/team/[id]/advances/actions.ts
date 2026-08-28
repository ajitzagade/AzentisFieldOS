"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createAdvanceSchema } from "@azentisfieldos/shared";

export interface CreateAdvanceFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Advance entry and a correction of
// one — POST /advances branches on correctsId, same uniform-write-path
// design as Story 5.1's createPurchaseAction.
export async function createAdvanceAction(
  _prevState: CreateAdvanceFormState,
  formData: FormData,
): Promise<CreateAdvanceFormState> {
  const teamMemberId = formData.get("teamMemberId") as string;

  const parsed = createAdvanceSchema.safeParse({
    teamMemberId,
    amount: Number(formData.get("amount")),
    reason: formData.get("reason") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    givenAt: formData.get("givenAt"),
    correctsId: formData.get("correctsId") || undefined,
    correctionReason: formData.get("correctionReason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/advances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Advance. Please try again." };
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
      return { errors: body.error.details.fieldErrors };
    }
    if (body?.error?.code === "ADJUSTMENT_EXCEEDS_BALANCE") {
      return { errors: { amount: [body.error.message ?? "This correction would take the Outstanding Balance below zero."] } };
    }
    return { formError: body?.message ?? "This Advance references a Team Member that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Advance. Please try again." };
  }

  redirect(
    `/team/${teamMemberId}?flash=${encodeURIComponent(formData.get("correctsId") ? "Advance correction recorded" : "Advance recorded")}`,
  );
}
