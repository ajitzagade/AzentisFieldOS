import { createSiteSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateSiteForm(formData: FormData) {
  return createSiteSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    status: formData.get("status"),
    contractReference: formData.get("contractReference") || undefined,
    description: formData.get("description") || undefined,
  });
}
