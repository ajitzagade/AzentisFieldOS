"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parsePricingForm } from "./parse";

export interface CompletePricingFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// D7: the Owner's one-time completion of a Supervisor's unpriced inward
// entry — PATCH /purchases/:id/pricing (Owner/Admin-only server-side).
export async function completePricingAction(
  purchaseId: string,
  _prevState: CompletePricingFormState,
  formData: FormData,
): Promise<CompletePricingFormState> {
  const parsed = parsePricingForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/purchases/${purchaseId}/pricing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong saving the pricing. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.error?.message ?? body?.message ?? "This entry could not be priced." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong saving the pricing. Please try again." };
  }

  redirect(`/movements?flash=${encodeURIComponent("Pricing saved")}`);
}
