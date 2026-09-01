import { createPaymentSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
// The optional linked Advance Adjustment (AC #3/#4) is reconstructed from its
// own flat form fields into createPaymentSchema's nested advanceAdjustment
// shape.
export function parseCreatePaymentForm(formData: FormData) {
  const includeAdjustment = formData.get("includeAdjustment") === "true";

  return createPaymentSchema.safeParse({
    teamMemberId: formData.get("teamMemberId"),
    basePay: Number(formData.get("basePay")),
    additionalAmount: formData.get("additionalAmount") ? Number(formData.get("additionalAmount")) : undefined,
    deductions: formData.get("deductions") ? Number(formData.get("deductions")) : undefined,
    payPeriod: formData.get("payPeriod") || undefined,
    advanceAdjustment: includeAdjustment
      ? {
          advanceId: formData.get("advanceId"),
          amount: Number(formData.get("adjustmentAmount")),
          note: formData.get("adjustmentNote") || undefined,
        }
      : undefined,
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
