import { createAdvanceSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateAdvanceForm(formData: FormData) {
  return createAdvanceSchema.safeParse({
    teamMemberId: formData.get("teamMemberId"),
    amount: Number(formData.get("amount")),
    reason: formData.get("reason") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    givenAt: formData.get("givenAt"),
    correctsId: formData.get("correctsId") || undefined,
    correctionReason: formData.get("correctionReason") || undefined,
  });
}
