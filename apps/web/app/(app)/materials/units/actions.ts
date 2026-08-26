"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { createUnitSchema } from "@azentisfieldos/shared";

export interface CreateUnitFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createUnitAction(
  _prevState: CreateUnitFormState,
  formData: FormData,
): Promise<CreateUnitFormState> {
  const parsed = createUnitSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/units`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Unit. Please try again." };
  }

  revalidatePath("/materials/units");
  return {};
}
