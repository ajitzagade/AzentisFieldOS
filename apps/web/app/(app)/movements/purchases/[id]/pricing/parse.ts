import { completePurchasePricingSchema } from "@azentisfieldos/shared";

// Shared FormData→schema coercion for the pricing-completion form (AD-7) —
// used by both the Server Action and the client's pre-submit validation.
export function parsePricingForm(formData: FormData) {
  return completePurchasePricingSchema.safeParse({
    rate: Number(formData.get("rate")),
    totalAmount: Number(formData.get("totalAmount")),
    paymentStatus: formData.get("paymentStatus"),
  });
}
