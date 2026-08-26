"use server";

import { revalidatePath } from "next/cache";
import { createExpenseCategorySchema } from "@azentisfieldos/shared";

export interface CreateExpenseCategoryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createExpenseCategoryAction(
  _prevState: CreateExpenseCategoryFormState,
  formData: FormData,
): Promise<CreateExpenseCategoryFormState> {
  const parsed = createExpenseCategorySchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/expense-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong creating the Expense Category. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "An Expense Category with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Expense Category. Please try again." };
  }

  revalidatePath("/expenses/categories");
  revalidatePath("/expenses/new");
  return {};
}
