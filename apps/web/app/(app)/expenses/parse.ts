import { createExpenseSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateExpenseForm(formData: FormData) {
  return createExpenseSchema.safeParse({
    siteId: formData.get("siteId"),
    categoryId: formData.get("categoryId"),
    amount: Number(formData.get("amount")),
    description: formData.get("description") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    personOrVendor: formData.get("personOrVendor") || undefined,
    incurredAt: formData.get("incurredAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
