import { updateSiteContractSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
// The form always resubmits every field (full-replace, not a diff) — an
// intentionally-blanked optional field must reach the API as an explicit
// `null` so it's actually cleared, not silently dropped.
export function parseUpdateSiteContractForm(formData: FormData) {
  return updateSiteContractSchema.safeParse({
    workCategory: formData.get("workCategory") || null,
    description: formData.get("description") || null,
    rateType: formData.get("rateType") || null,
    rateUnitLabel: formData.get("rateUnitLabel") || null,
    rate: formData.get("rate") ? Number(formData.get("rate")) : null,
    fixedAmount: formData.get("fixedAmount") ? Number(formData.get("fixedAmount")) : null,
    estimatedQuantity: formData.get("estimatedQuantity") ? Number(formData.get("estimatedQuantity")) : null,
    status: formData.get("status") || undefined,
    startDate: formData.get("startDate") || null,
    endDate: formData.get("endDate") || null,
  });
}
