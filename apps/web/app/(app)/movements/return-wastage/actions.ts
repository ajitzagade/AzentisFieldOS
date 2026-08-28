"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createReturnWastageSchema } from "@azentisfieldos/shared";

export interface CreateReturnWastageFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Return/Wastage entry and a correction
// of one — POST /return-wastage branches on correctsId, same
// uniform-write-path design as Story 5.1's createPurchaseAction.
export async function createReturnWastageAction(
  _prevState: CreateReturnWastageFormState,
  formData: FormData,
): Promise<CreateReturnWastageFormState> {
  const parsed = createReturnWastageSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    kind: formData.get("kind"),
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") || undefined,
    recordedAt: formData.get("recordedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/return-wastage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording this entry. Please try again." };
  }

  if (res.status === 400) {
    // Two distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures, and
    // Nest's default body for a plain `BadRequestException('<string>')`
    // (`{ statusCode, message, error: 'Bad Request' }`, where `error` is a
    // string) for translateWriteError's FK-violation message — read
    // `body.message` for the latter, not `body.error.message`.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return {
      formError: body?.message ?? "This Return/Wastage entry references a Site or Material Size that does not exist.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording this entry. Please try again." };
  }

  redirect(
    `/movements?flash=${encodeURIComponent(formData.get("correctsId") ? "Return/Wastage correction recorded" : "Return/Wastage recorded")}`,
  );
}
