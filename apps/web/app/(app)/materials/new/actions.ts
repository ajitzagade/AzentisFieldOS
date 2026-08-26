"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createMaterialSchema } from "@azentisfieldos/shared";

export interface CreateMaterialFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only)/AD-7 (shared schema) pattern as sites/new/actions.ts.
export async function createMaterialAction(
  _prevState: CreateMaterialFormState,
  formData: FormData,
): Promise<CreateMaterialFormState> {
  const parsed = createMaterialSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    unitId: formData.get("unitId"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/materials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Material references a Category or Unit that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Material. Please try again." };
  }

  redirect("/materials");
}
