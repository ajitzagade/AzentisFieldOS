import { createMaterialSizeSchema, updateMaterialSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for the Material edit form, run by BOTH
// the Server Action (source of truth) and the client's useClientValidation
// hook (AD-7). The action additionally guards unreadable customFields JSON
// with its own formError before calling this — here, unparseable JSON is left
// as the raw string so the schema rejects it the same way both run sites.
export function parseUpdateMaterialForm(formData: FormData) {
  // FR-7: Custom Fields are staged client-side (edit-material-form.tsx)
  // and submitted as one JSON-encoded hidden field alongside the rest of
  // this same form — there is no independent Custom Field endpoint.
  const rawCustomFields = formData.get("customFields");
  let customFields: unknown;
  if (typeof rawCustomFields === "string" && rawCustomFields.length > 0) {
    try {
      customFields = JSON.parse(rawCustomFields);
    } catch {
      customFields = rawCustomFields;
    }
  }

  // Empty means "clear the threshold" (null), not "field omitted" — unlike
  // the other optional() fields, lowStockThreshold is nullable(), so an
  // explicit null is meaningful input, not something to coerce away.
  const rawLowStockThreshold = formData.get("lowStockThreshold");
  const lowStockThreshold =
    typeof rawLowStockThreshold === "string" && rawLowStockThreshold.length > 0 ? Number(rawLowStockThreshold) : null;

  return updateMaterialSchema.safeParse({
    // FormData.get() returns null (not undefined) for an absent field —
    // z.uuid().optional() / z.string().min(1).optional() accept undefined
    // but reject null, so this must be coerced explicitly.
    name: formData.get("name") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    unitId: formData.get("unitId") || undefined,
    isActive: formData.get("isActive") === "true",
    customFields,
    lowStockThreshold,
  });
}

// Same one-validator-two-run-sites pattern for the sibling Sizes form.
export function parseAddMaterialSizeForm(formData: FormData) {
  return createMaterialSizeSchema.safeParse({ label: formData.get("label") });
}
