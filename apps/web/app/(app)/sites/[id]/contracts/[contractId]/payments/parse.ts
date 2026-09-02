import { createSubcontractorPaymentSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Subcontractor Payment (AD-7):
// imported by the Server Action (source of truth) AND by the client form's
// pre-submit validation (useClientValidation).
export function parseSubcontractorPaymentForm(formData: FormData) {
  return createSubcontractorPaymentSchema.safeParse({
    siteContractId: formData.get("siteContractId"),
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
    paymentMethod: formData.get("paymentMethod") || undefined,
    paidAt: formData.get("paidAt"),
    note: formData.get("note") || undefined,
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
