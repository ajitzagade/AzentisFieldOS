"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseSubcontractorPaymentForm } from "./parse";

export interface SubcontractorPaymentFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Payment/Advance and a correction of
// one — POST /subcontractor-payments branches on correctsId, same
// uniform-write-path design as createWorkEntryAction. Owner/Admin only
// (enforced by the API).
export async function createSubcontractorPaymentAction(
  siteId: string,
  contractId: string,
  _prevState: SubcontractorPaymentFormState,
  formData: FormData,
): Promise<SubcontractorPaymentFormState> {
  const parsed = parseSubcontractorPaymentForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/subcontractor-payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording this Payment. Please try again." };
  }

  if (res.status === 403) {
    return { formError: "Only an Owner/Admin can record a Subcontractor Payment." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { code?: string; details?: { fieldErrors?: Record<string, string[]> }; message?: string }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    // A floor-check rejection is about the amount field specifically —
    // show it inline next to that field, same discipline as the
    // quantity floor-check on Work Entries.
    if (body?.error?.code === "AMOUNT_PAID_BELOW_ZERO") {
      return { errors: { amount: [body.error.message ?? "This correction would reduce amount paid below zero."] } };
    }
    return { formError: body?.error?.message ?? body?.message ?? "This Payment could not be recorded." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording this Payment. Please try again." };
  }

  redirect(
    `/sites/${siteId}/contracts/${contractId}?flash=${encodeURIComponent(
      formData.get("correctsId") ? "Payment correction recorded" : "Payment recorded",
    )}`,
  );
}
