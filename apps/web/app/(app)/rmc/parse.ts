import { createRmcEntrySchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for an RMC delivery (AD-7): imported
// by the Server Action (the source of truth) AND by the client form's
// pre-submit validation (useClientValidation), so inline errors can never
// disagree with what the server would say.
export function parseRmcEntryForm(formData: FormData) {
  return createRmcEntrySchema.safeParse({
    siteId: formData.get("siteId"),
    vendorId: formData.get("vendorId"),
    quantityM3: Number(formData.get("quantityM3")),
    grade: formData.get("grade"),
    ratePerM3: Number(formData.get("ratePerM3")),
    totalAmount: Number(formData.get("totalAmount")),
    invoiceOrChallanNo: formData.get("invoiceOrChallanNo") || undefined,
    challanPhotoUrl: formData.get("challanPhotoUrl") || undefined,
    deliveredAt: formData.get("deliveredAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
