"use server";

import { redirect } from "next/navigation";
import { createExpenseSchema } from "@azentisfieldos/shared";

export interface CreateExpenseFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

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
