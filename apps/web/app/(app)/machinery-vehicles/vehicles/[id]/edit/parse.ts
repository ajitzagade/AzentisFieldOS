import { updateVehicleSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseUpdateVehicleForm(formData: FormData) {
  return updateVehicleSchema.safeParse({
    number: formData.get("number") || undefined,
    typeId: formData.get("typeId") || undefined,
    // The form always resubmits every field (full-replace, not a diff) —
    // an intentionally-blanked Ownership/Driver must reach the API as an
    // explicit `null` so it's actually cleared, not silently dropped by
    // JSON.stringify omitting an `undefined` key.
    ownership: formData.get("ownership") || null,
    driver: formData.get("driver") || null,
  });
}
