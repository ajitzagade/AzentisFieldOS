import { createRmcEntrySchema } from "@azentisfieldos/shared";
import { optionalNumber } from "../../../lib/parse-helpers";

// The single FormData→schema coercion for an RMC delivery (AD-7): imported
// by the Server Action (the source of truth) AND by the client form's
// pre-submit validation (useClientValidation), so inline errors can never
// disagree with what the server would say.
//
// ratePerM3/totalAmount are optional as a group (client-readiness batch,
// goal 1, mirrors D7's Purchase pricing-pending pattern) — a blank field
// must parse to `undefined`, never `NaN`, so the schema's `.optional()`
// actually accepts an unpriced delivery.
export function parseRmcEntryForm(formData: FormData) {
  return createRmcEntrySchema.safeParse({
    siteId: formData.get("siteId"),
    vendorId: formData.get("vendorId"),
    quantityM3: Number(formData.get("quantityM3")),
    grade: formData.get("grade"),
    ratePerM3: optionalNumber(formData.get("ratePerM3")),
    totalAmount: optionalNumber(formData.get("totalAmount")),
    invoiceOrChallanNo: formData.get("invoiceOrChallanNo") || undefined,
    challanPhotoUrl: formData.get("challanPhotoUrl") || undefined,
    deliveredAt: formData.get("deliveredAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
