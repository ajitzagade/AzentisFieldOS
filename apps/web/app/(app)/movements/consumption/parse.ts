import { createConsumptionSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Consumption entry (AD-7):
// imported by the Server Action (the source of truth) AND by the client
// form's pre-submit validation (useClientValidation), so inline errors can
// never disagree with what the server would say.
export function parseConsumptionForm(formData: FormData) {
  return createConsumptionSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    quantity: Number(formData.get("quantity")),
    activityReference: formData.get("activityReference") || undefined,
    notes: formData.get("notes") || undefined,
    consumedAt: formData.get("consumedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
