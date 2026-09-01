import { createVehicleSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateVehicleForm(formData: FormData) {
  return createVehicleSchema.safeParse({
    number: formData.get("number"),
    typeId: formData.get("typeId"),
    // FormData.get() returns null (not undefined) for an absent field —
    // z.string().optional() accepts undefined but rejects null.
    ownership: formData.get("ownership") || undefined,
    driver: formData.get("driver") || undefined,
  });
}
