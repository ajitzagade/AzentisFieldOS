import { createPurchaseSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for the Purchase form (AD-7): the
// Server Action parses with this before hitting the API, and the client
// form runs the same function pre-submit for instant inline errors — one
// validator, two run sites.
//
// Pricing (rate / totalAmount / paymentStatus) is optional as a group
// (decision D7): the Supervisor form doesn't render those fields at all, so
// they're absent from FormData and the entry is recorded "Pricing pending".
// The Owner form renders them and marks itself with the hidden
// `pricingShown` flag — with the flag present, missing pricing is a
// validation error here (the Owner must price what they can see), even
// though the shared schema itself allows an unpriced entry.
type ParseResult =
  | { success: true; data: ReturnType<typeof createPurchaseSchema.parse> }
  | { success: false; error: { flatten(): { fieldErrors: Record<string, string[]> } } };

function optionalNumber(formData: FormData, name: string): number | undefined {
  const raw = formData.get(name);
  if (raw === null || String(raw).trim() === "") return undefined;
  return Number(raw);
}

export function parsePurchaseForm(formData: FormData): ParseResult {
  const parsed = createPurchaseSchema.safeParse({
    vendorId: formData.get("vendorId"),
    materialSizeId: formData.get("materialSizeId"),
    destination: formData.get("destination"),
    siteId: formData.get("siteId") || undefined,
    quantity: Number(formData.get("quantity")),
    rate: optionalNumber(formData, "rate"),
    totalAmount: optionalNumber(formData, "totalAmount"),
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

  if (parsed.success && formData.get("pricingShown") === "1") {
    const missing: Record<string, string[]> = {};
    if (parsed.data.rate === undefined) missing.rate = ["Rate is required"];
    if (parsed.data.totalAmount === undefined) missing.totalAmount = ["Total Amount is required"];
    if (parsed.data.paymentStatus === undefined) missing.paymentStatus = ["Payment Status is required"];
    if (Object.keys(missing).length > 0) {
      return { success: false, error: { flatten: () => ({ fieldErrors: missing }) } };
    }
  }

  return parsed;
}
