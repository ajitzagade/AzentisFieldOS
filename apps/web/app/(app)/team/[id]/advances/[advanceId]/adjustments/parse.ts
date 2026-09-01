import { createAdvanceAdjustmentSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateAdvanceAdjustmentForm(formData: FormData) {
  return createAdvanceAdjustmentSchema.safeParse({
    advanceId: formData.get("advanceId"),
    paymentId: formData.get("paymentId") || undefined,
    amount: Number(formData.get("amount")),
    note: formData.get("note") || undefined,
    adjustedAt: formData.get("adjustedAt"),
    correctsId: formData.get("correctsId") || undefined,
    correctionReason: formData.get("correctionReason") || undefined,
  });
}
