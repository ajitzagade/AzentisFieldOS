import { createSubcontractorSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateSubcontractorForm(formData: FormData) {
  return createSubcontractorSchema.safeParse({
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    workCategories: formData.getAll("workCategories"),
  });
}
