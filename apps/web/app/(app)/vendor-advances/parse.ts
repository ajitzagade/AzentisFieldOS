import { correctVendorAdvanceSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCorrectVendorAdvanceForm(formData: FormData) {
  return correctVendorAdvanceSchema.safeParse({
    correctsId: formData.get("correctsId"),
    amount: Number(formData.get("amount")),
    paymentMethod: formData.get("paymentMethod") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
