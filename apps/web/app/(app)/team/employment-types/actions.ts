"use server";

import { revalidatePath } from "next/cache";
import { createEmploymentTypeSchema } from "@azentisfieldos/shared";

export interface CreateEmploymentTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createEmploymentTypeAction(
  _prevState: CreateEmploymentTypeFormState,
  formData: FormData,
): Promise<CreateEmploymentTypeFormState> {
  const parsed = createEmploymentTypeSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/employment-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "An Employment Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Employment Type. Please try again." };
  }

  revalidatePath("/team/employment-types");
  revalidatePath("/team/new");
  return {};
}
