import { createExpenseCategorySchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateExpenseCategoryForm(formData: FormData) {
  return createExpenseCategorySchema.safeParse({ name: formData.get("name") });
}
