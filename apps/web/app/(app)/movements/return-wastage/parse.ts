import { createReturnWastageSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Return/Wastage entry (AD-7):
// imported by the Server Action (the source of truth) AND by the client
// form's pre-submit validation (useClientValidation), so inline errors can
// never disagree with what the server would say.
export function parseReturnWastageForm(formData: FormData) {
  return createReturnWastageSchema.safeParse({
    siteId: formData.get("siteId"),
    materialSizeId: formData.get("materialSizeId"),
    kind: formData.get("kind"),
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes") || undefined,
    recordedAt: formData.get("recordedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
