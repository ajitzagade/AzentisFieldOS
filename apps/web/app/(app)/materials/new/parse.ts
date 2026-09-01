import { createMaterialSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateMaterialForm(formData: FormData) {
  return createMaterialSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    unitId: formData.get("unitId"),
  });
}
