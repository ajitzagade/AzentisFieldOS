"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { confirmMovementReceiptSchema } from "@azentisfieldos/shared";

export interface ConfirmMovementReceiptFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// `id` is bound at the call site since a Server Action passed to
// useActionState only receives (prevState, formData) — same pattern as
// materials/[id]/edit/actions.ts's updateMaterialAction.
export async function confirmMovementReceiptAction(
  id: string,
  _prevState: ConfirmMovementReceiptFormState,
  formData: FormData,
): Promise<ConfirmMovementReceiptFormState> {
  const parsed = confirmMovementReceiptSchema.safeParse({
    receivedQuantity: Number(formData.get("receivedQuantity")),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/movements/${id}/confirm-receipt`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Movement's receipt has already been confirmed." };
  }

  if (res.status === 404) {
    return { formError: "This Movement no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong confirming receipt. Please try again." };
  }

  redirect(`/movements?flash=${encodeURIComponent("Receipt confirmed — Site Stock updated")}`);
}
