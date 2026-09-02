import { updateSubcontractorSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseUpdateSubcontractorForm(formData: FormData) {
  return updateSubcontractorSchema.safeParse({
    name: formData.get("name"),
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked field must reach the API as an explicit
    // `null` so it's actually cleared, not silently dropped by
    // JSON.stringify omitting an `undefined` key.
    contactPerson: formData.get("contactPerson") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    address: formData.get("address") || null,
    workCategories: formData.getAll("workCategories"),
  });
}
