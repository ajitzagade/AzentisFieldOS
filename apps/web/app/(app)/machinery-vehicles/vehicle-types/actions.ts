"use server";

import { revalidatePath } from "next/cache";
import { createVehicleTypeSchema } from "@azentisfieldos/shared";

export interface CreateVehicleTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createVehicleTypeAction(
  _prevState: CreateVehicleTypeFormState,
  formData: FormData,
): Promise<CreateVehicleTypeFormState> {
  const parsed = createVehicleTypeSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/vehicle-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "A Vehicle Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Vehicle Type. Please try again." };
  }

  revalidatePath("/machinery-vehicles/vehicle-types");
  revalidatePath("/machinery-vehicles/vehicles/new");
  return {};
}
