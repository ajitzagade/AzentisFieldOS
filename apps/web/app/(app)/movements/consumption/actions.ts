"use server";

import { redirect } from "next/navigation";
import { createConsumptionSchema } from "@azentisfieldos/shared";

export interface CreateConsumptionFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Consumption entry and a correction of
// one — POST /consumption branches on correctsId, same uniform-write-path
// design as Story 5.1's createPurchaseAction.
export async function createConsumptionAction(
  _prevState: CreateConsumptionFormState,
  formData: FormData,
): Promise<CreateConsumptionFormState> {
  const parsed = createConsumptionSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    quantity: Number(formData.get("quantity")),
    activityReference: formData.get("activityReference") || undefined,
    notes: formData.get("notes") || undefined,
    consumedAt: formData.get("consumedAt"),
    recordedByUserId: formData.get("recordedByUserId"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/consumption`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Consumption references a Site, Material Size, or User that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Consumption. Please try again." };
  }

  redirect("/movements");
}
