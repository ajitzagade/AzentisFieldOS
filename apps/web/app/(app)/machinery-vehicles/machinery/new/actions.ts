"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createMachinerySchema } from "@azentisfieldos/shared";

export interface CreateMachineryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only)/AD-7 (shared schema) pattern as team/new/actions.ts.
export async function createMachineryAction(
  _prevState: CreateMachineryFormState,
  formData: FormData,
): Promise<CreateMachineryFormState> {
  const parsed = createMachinerySchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    assetNumber: formData.get("assetNumber"),
    // FormData.get() returns null (not undefined) for an absent field —
    // z.string().optional() accepts undefined but rejects null.
    model: formData.get("model") || undefined,
    ownership: formData.get("ownership") || undefined,
    operator: formData.get("operator") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/machinery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Machine references a Machinery Type that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong registering the Machine. Please try again." };
  }

  redirect("/machinery-vehicles");
}
