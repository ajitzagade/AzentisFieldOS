import { createMachinerySchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateMachineryForm(formData: FormData) {
  return createMachinerySchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    assetNumber: formData.get("assetNumber"),
    // FormData.get() returns null (not undefined) for an absent field —
    // z.string().optional() accepts undefined but rejects null.
    model: formData.get("model") || undefined,
    ownership: formData.get("ownership") || undefined,
    operator: formData.get("operator") || undefined,
  });
}
