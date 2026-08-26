"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createConsumptionSchema } from "@azentisfieldos/shared";

export interface CreateConsumptionFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Consumption entry and a correction of
// one — POST /consumption branches on correctsId, same uniform-write-path
// design as Story 5.1's createPurchaseAction.
export async function createConsumptionAction(
  _prevState: CreateConsumptionFormState,
  formData: FormData,
): Promise<CreateConsumptionFormState> {
  const parsed = createConsumptionSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    quantity: Number(formData.get("quantity")),
    activityReference: formData.get("activityReference") || undefined,
    notes: formData.get("notes") || undefined,
    consumedAt: formData.get("consumedAt"),
    recordedByUserId: formData.get("recordedByUserId"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/consumption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Consumption. Please try again." };
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
    return { formError: body?.message ?? "This Consumption references a Site, Material Size, or User that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Consumption. Please try again." };
  }

  redirect("/movements");
}
