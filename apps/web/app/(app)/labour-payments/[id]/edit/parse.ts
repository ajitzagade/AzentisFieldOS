import { updateDailyLabourerSchema } from "@azentisfieldos/shared";

// The form always resubmits every field (full-replace, not a diff) — an
// intentionally-blanked Per-Day Amount must reach the API as an explicit
// `null` so it's actually cleared, matching parseUpdateVendorForm's own
// convention for its nullable fields.
function nullableNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  return Number(value);
}

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseUpdateDailyLabourerForm(formData: FormData) {
  return updateDailyLabourerSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    defaultPerDayAmount: nullableNumber(formData.get("defaultPerDayAmount")),
  });
}
