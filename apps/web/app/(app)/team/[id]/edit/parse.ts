import { updateTeamMemberSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseUpdateTeamMemberForm(formData: FormData) {
  return updateTeamMemberSchema.safeParse({
    name: formData.get("name") || undefined,
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked Designation/Contact must reach the API as
    // an explicit `null` so it's actually cleared, not silently dropped
    // by JSON.stringify omitting an `undefined` key.
    designation: formData.get("designation") || null,
    contact: formData.get("contact") || null,
    employmentTypeId: formData.get("employmentTypeId") || undefined,
    isActive: formData.get("isActive") === "true",
  });
}
