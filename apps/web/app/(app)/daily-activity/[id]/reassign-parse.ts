import { reassignDsrSiteDateSchema } from "@azentisfieldos/shared";

// Shared FormData→schema coercion for the Owner-only "Reassign Site/Date"
// form (AD-7) — used by both the Server Action (reassign-actions.ts) and
// the client's pre-submit validation (useClientValidation).
export function parseReassignSiteDateForm(formData: FormData) {
  return reassignDsrSiteDateSchema.safeParse({
    siteId: formData.get("siteId"),
    reportDate: formData.get("reportDate"),
  });
}
