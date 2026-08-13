"use server";

import { redirect } from "next/navigation";
import { createReturnWastageSchema } from "@azentisfieldos/shared";

export interface CreateReturnWastageFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Return/Wastage entry and a correction
// of one — POST /return-wastage branches on correctsId, same
// uniform-write-path design as Story 5.1's createPurchaseAction.
export async function createReturnWastageAction(
  _prevState: CreateReturnWastageFormState,
  formData: FormData,
): Promise<CreateReturnWastageFormState> {
  const parsed = createReturnWastageSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    kind: formData.get("kind"),
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") || undefined,
    recordedAt: formData.get("recordedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/return-wastage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return {
      formError: body.error?.message ?? "This Return/Wastage entry references a Site or Material Size that does not exist.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording this entry. Please try again." };
  }

  redirect("/movements");
}
