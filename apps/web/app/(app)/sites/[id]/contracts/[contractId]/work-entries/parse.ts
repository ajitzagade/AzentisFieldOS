import { createSubcontractorWorkEntrySchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for a Work Entry (AD-7): imported by
// the Server Action (source of truth) AND by the client form's pre-submit
// validation (useClientValidation).
export function parseWorkEntryForm(formData: FormData) {
  return createSubcontractorWorkEntrySchema.safeParse({
    siteContractId: formData.get("siteContractId"),
    quantity: Number(formData.get("quantity")),
    workDate: formData.get("workDate"),
    note: formData.get("note") || undefined,
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
