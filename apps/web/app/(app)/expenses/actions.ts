"use server";

import { redirect } from "next/navigation";
import { createExpenseSchema } from "@azentisfieldos/shared";

export interface CreateExpenseFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Expense and a correction of one — the
// API has a single POST /expenses that branches on correctsId (mirroring
// RmcController's POST /rmc-entries), so the form layer mirrors that rather
// than maintaining two separate submit paths.
export async function createExpenseAction(
  _prevState: CreateExpenseFormState,
  formData: FormData,
): Promise<CreateExpenseFormState> {
  const parsed = createExpenseSchema.safeParse({
    siteId: formData.get("siteId"),
    categoryId: formData.get("categoryId"),
    amount: Number(formData.get("amount")),
    description: formData.get("description") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    personOrVendor: formData.get("personOrVendor") || undefined,
    incurredAt: formData.get("incurredAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording this expense. Please try again." };
  }

  if (res.status === 400) {
    // Two distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures, and
    // Nest's default body for a plain `BadRequestException('<string>')`
    // (`{ statusCode, message, error: 'Bad Request' }`, where `error` is a
    // string) for the FK-violation / correction-mismatch messages — read
    // `body.message` for the latter, not `body.error.message`.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return {
      formError: body?.message ?? "This Expense references a Site or Category that does not exist.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording this expense. Please try again." };
  }

  redirect("/expenses");
}
