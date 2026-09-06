import { createSiteSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
// `status` falls back to `undefined` (not `formData.get`'s own `null`) when
// absent — the quick-create modal (2026-09-06) omits the Status field
// entirely, and createSiteSchema's `status: siteStatusSchema.default("ACTIVE")`
// only applies its default for `undefined`, never for `null`, so an absent
// field must be coerced the same way the optional fields below already are.
export function parseCreateSiteForm(formData: FormData) {
  return createSiteSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    status: formData.get("status") || undefined,
    contractReference: formData.get("contractReference") || undefined,
    description: formData.get("description") || undefined,
  });
}
