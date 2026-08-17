"use server";

import { revalidatePath } from "next/cache";
import { createMachineryTypeSchema } from "@azentisfieldos/shared";

export interface CreateMachineryTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createMachineryTypeAction(
  _prevState: CreateMachineryTypeFormState,
  formData: FormData,
): Promise<CreateMachineryTypeFormState> {
  const parsed = createMachineryTypeSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/machinery-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "A Machinery Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Machinery Type. Please try again." };
  }

  revalidatePath("/machinery-vehicles/machinery-types");
  revalidatePath("/machinery-vehicles/machinery/new");
  return {};
}
