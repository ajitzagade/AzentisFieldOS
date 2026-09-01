import { createMovementSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Movement (AD-7): imported by
// the Server Action (the source of truth) AND by the client form's
// pre-submit validation (useClientValidation), so inline errors can never
// disagree with what the server would say. Shared by GODOWN_TO_SITE and
// SITE_TO_SITE — same form, same schema (Story 5.4).
export function parseMovementForm(formData: FormData) {
  return createMovementSchema.safeParse({
    kind: formData.get("kind"),
    materialSizeId: formData.get("materialSizeId"),
    sourceSiteId: formData.get("sourceSiteId") || undefined,
    destinationSiteId: formData.get("destinationSiteId"),
    sentQuantity: Number(formData.get("sentQuantity")),
    vehicleDetails: formData.get("vehicleDetails") || undefined,
    personResponsible: formData.get("personResponsible") || undefined,
    notes: formData.get("notes") || undefined,
    movedAt: formData.get("movedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
