import { createWasteDisposalSchema } from "@azentisfieldos/shared";

// The schema nests the optional advance to the hired Vendor under
// `advance`, but the form's fields (and errorFor keys) are flat — remap
// nested issue paths to the flat names, same pattern as Payment's linked
// Advance Adjustment (parse.ts).
const NESTED_FIELD_MAP: Record<string, string> = {
  amount: "advanceAmount",
  paymentMethod: "advancePaymentMethod",
};

// The single FormData→schema coercion for a Waste Disposal entry (AD-7):
// imported by the Server Action (the source of truth) AND by the client
// form's pre-submit validation (useClientValidation), so inline errors can
// never disagree with what the server would say.
export function parseWasteDisposalForm(formData: FormData) {
  const otherChargesRaw = formData.get("otherCharges");
  const includeAdvance = formData.get("includeAdvance") === "true";

  const parsed = createWasteDisposalSchema.safeParse({
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
    advance: includeAdvance
      ? {
          amount: Number(formData.get("advanceAmount")),
          paymentMethod: formData.get("advancePaymentMethod") || undefined,
        }
      : undefined,
  });

  if (parsed.success) return parsed;

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key =
      issue.path[0] === "advance" && typeof issue.path[1] === "string"
        ? (NESTED_FIELD_MAP[issue.path[1]] ?? String(issue.path[1]))
        : String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return {
    success: false as const,
    error: { flatten: () => ({ fieldErrors }) },
  };
}
