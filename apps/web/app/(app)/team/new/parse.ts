import { createTeamMemberSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7) —
// one validator, two run sites, so the inline errors a user sees while typing
// can never disagree with what the server would say.
export function parseCreateTeamMemberForm(formData: FormData) {
  return createTeamMemberSchema.safeParse({
    name: formData.get("name"),
    // FormData.get() returns null (not undefined) for an absent field —
    // z.string().optional() accepts undefined but rejects null.
    designation: formData.get("designation") || undefined,
    contact: formData.get("contact") || undefined,
    employmentTypeId: formData.get("employmentTypeId"),
  });
}
