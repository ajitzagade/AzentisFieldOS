"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreatePaymentForm } from "./parse";

export interface CreatePaymentFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Payment entry and a correction of
// one — POST /payments branches on correctsId, same uniform-write-path
// design as Story 7.1's createAdvanceAction. The optional linked Advance
// Adjustment (AC #3/#4) is reconstructed from its own flat form fields
// into createPaymentSchema's nested advanceAdjustment shape.
export async function createPaymentAction(
  _prevState: CreatePaymentFormState,
  formData: FormData,
): Promise<CreatePaymentFormState> {
  const parsed = parseCreatePaymentForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Payment. Please try again." };
  }

  if (res.status === 400) {
    // Three distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures,
    // PaymentsService's own `{ error: { code, message } }` for the AC #4
    // cap check on the linked Adjustment (surfaced next to the
    // Adjustment section, not a generic toast — same handling as Story
    // 7.2's createAdvanceAdjustmentAction), and Nest's default body for a
    // plain `BadRequestException('<string>')` for the correction-mismatch
    // message — read `body.message` for the latter.
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
      return { errors: { adjustmentAmount: [body.error.message ?? "Adjustment cannot exceed the current Outstanding Balance."] } };
    }
    return { formError: body?.message ?? "This Payment references a Team Member or Advance that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Payment. Please try again." };
  }

  redirect(
    `/payments?flash=${encodeURIComponent(formData.get("correctsId") ? "Payment correction recorded" : "Payment recorded")}`,
  );
}

export interface MarkPaymentPaidFormState {
  formError?: string;
  done?: boolean;
}

// `id` is bound at the call site (MarkPaidButton) since a Server Action
// passed to useActionState only receives (prevState, formData) — same
// pattern as materials/categories's toggleMaterialCategoryAction.
export async function markPaymentPaidAction(id: string): Promise<MarkPaymentPaidFormState> {
  let res: Response;
  try {
    res = await authedFetch(`/payments/${id}/mark-paid`, { method: "PATCH" });
  } catch {
    return { formError: "Could not mark this Payment as paid. Please try again." };
  }

  if (res.status === 409) {
    return { formError: "This Payment has already been marked paid." };
  }
  if (res.status === 404) {
    return { formError: "This Payment no longer exists." };
  }
  if (!res.ok) {
    return { formError: "Could not mark this Payment as paid. Please try again." };
  }

  revalidatePath("/payments");
  return { done: true };
}
