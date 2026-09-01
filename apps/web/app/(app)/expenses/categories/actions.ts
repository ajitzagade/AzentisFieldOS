"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { updateExpenseCategorySchema } from "@azentisfieldos/shared";
import { parseCreateExpenseCategoryForm } from "./parse";

// Story 14.3: the admin list plus the Record Expense entry-form picker (AC #1).
function revalidateExpenseCategoryPaths() {
  revalidatePath("/expenses/categories");
  revalidatePath("/expenses/new");
}

export interface CreateExpenseCategoryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createExpenseCategoryAction(
  _prevState: CreateExpenseCategoryFormState,
  formData: FormData,
): Promise<CreateExpenseCategoryFormState> {
  const parsed = parseCreateExpenseCategoryForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/expense-categories`, {
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

  revalidateExpenseCategoryPaths();
  return {};
}

// Story 14.3 (FR-49): rename via the shared updateExpenseCategorySchema (AD-7).
export interface RenameExpenseCategoryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameExpenseCategoryAction(
  id: string,
  _prevState: RenameExpenseCategoryFormState,
  formData: FormData,
): Promise<RenameExpenseCategoryFormState> {
  const parsed = updateExpenseCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/expense-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Could not rename this Expense Category. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.error?.message ?? "An Expense Category with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Expense Category. Please try again." };
  }

  revalidateExpenseCategoryPaths();
  return { ok: true };
}

export interface ToggleExpenseCategoryFormState {
  formError?: string;
}

export async function toggleExpenseCategoryAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleExpenseCategoryFormState> {
  const res = await authedFetch(`/expense-categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Expense Category. Please try again."
        : "Could not disable this Expense Category. Please try again.",
    };
  }

  revalidateExpenseCategoryPaths();
  return {};
}
