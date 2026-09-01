import { createWasteDisposalSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Waste Disposal entry (AD-7):
// imported by the Server Action (the source of truth) AND by the client
// form's pre-submit validation (useClientValidation), so inline errors can
// never disagree with what the server would say.
export function parseWasteDisposalForm(formData: FormData) {
  const otherChargesRaw = formData.get("otherCharges");
  return createWasteDisposalSchema.safeParse({
    siteId: formData.get("siteId"),
    wasteType: formData.get("wasteType"),
    quantityDetails: formData.get("quantityDetails") || undefined,
    ownership: formData.get("ownership"),
    vendorId: formData.get("vendorId") || undefined,
    machineryId: formData.get("machineryId") || undefined,
    vehicleId: formData.get("vehicleId") || undefined,
    vehicleDetails: formData.get("vehicleDetails") || undefined,
    tripCount: Number(formData.get("tripCount")),
    ratePerTrip: Number(formData.get("ratePerTrip")),
    otherCharges: otherChargesRaw ? Number(otherChargesRaw) : undefined,
    disposalLocation: formData.get("disposalLocation") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    notes: formData.get("notes") || undefined,
    disposedAt: formData.get("disposedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
