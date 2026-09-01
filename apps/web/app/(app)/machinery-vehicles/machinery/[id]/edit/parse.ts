import { updateMachinerySchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseUpdateMachineryForm(formData: FormData) {
  return updateMachinerySchema.safeParse({
    name: formData.get("name") || undefined,
    typeId: formData.get("typeId") || undefined,
    assetNumber: formData.get("assetNumber") || undefined,
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked Model/Ownership/Operator must reach the API
    // as an explicit `null` so it's actually cleared, not silently dropped
    // by JSON.stringify omitting an `undefined` key.
    model: formData.get("model") || null,
    ownership: formData.get("ownership") || null,
    operator: formData.get("operator") || null,
  });
}
