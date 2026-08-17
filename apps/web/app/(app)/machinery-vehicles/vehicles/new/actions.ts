"use server";

import { redirect } from "next/navigation";
import { createVehicleSchema } from "@azentisfieldos/shared";

export interface CreateVehicleFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only)/AD-7 (shared schema) pattern as
// machinery/new/actions.ts.
export async function createVehicleAction(
  _prevState: CreateVehicleFormState,
  formData: FormData,
): Promise<CreateVehicleFormState> {
  const parsed = createVehicleSchema.safeParse({
    number: formData.get("number"),
    typeId: formData.get("typeId"),
    // FormData.get() returns null (not undefined) for an absent field —
    // z.string().optional() accepts undefined but rejects null.
    ownership: formData.get("ownership") || undefined,
    driver: formData.get("driver") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Vehicle references a Vehicle Type that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong registering the Vehicle. Please try again." };
  }

  redirect("/machinery-vehicles");
}
