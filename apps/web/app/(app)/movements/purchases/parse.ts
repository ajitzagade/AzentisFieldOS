import { createPurchaseSchema } from "@azentisfieldos/shared";
import { optionalNumber } from "../../../../lib/parse-helpers";

// The single FormData→schema coercion for the Purchase form (AD-7): the
// Server Action parses with this before hitting the API, and the client
// form runs the same function pre-submit for instant inline errors — one
// validator, two run sites.
//
// Pricing (rate / totalAmount / paymentStatus) is optional and each field
// independent of the others (decision D7, widened 2026-09-22, fully
// decoupled 2026-09-23): neither the Supervisor's form nor the Owner's form
// requires pricing to be filled in, and no pricing field requires another —
// the office may know the amount before payment is confirmed, or vice
// versa. An entry with totalAmount unset is recorded "Pricing pending"
// regardless of the other two fields.
type ParseResult =
  | { success: true; data: ReturnType<typeof createPurchaseSchema.parse> }
  | { success: false; error: { flatten(): { fieldErrors: Record<string, string[]> } } };

export function parsePurchaseForm(formData: FormData): ParseResult {
  const parsed = createPurchaseSchema.safeParse({
    vendorId: formData.get("vendorId"),
    materialSizeId: formData.get("materialSizeId"),
    destination: formData.get("destination"),
    siteId: formData.get("siteId") || undefined,
    quantity: Number(formData.get("quantity")),
    rate: optionalNumber(formData.get("rate")),
    totalAmount: optionalNumber(formData.get("totalAmount")),
    invoiceOrChallanNo: formData.get("invoiceOrChallanNo") || undefined,
    challanPhotoUrl: formData.get("challanPhotoUrl") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    deliveryLocation: formData.get("deliveryLocation") || undefined,
    vehicleDetails: formData.get("vehicleDetails") || undefined,
    receiverName: formData.get("receiverName") || undefined,
    notes: formData.get("notes") || undefined,
    purchasedAt: formData.get("purchasedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  return parsed;
}
