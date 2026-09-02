import { createSiteContractSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
// `siteId` travels as a hidden input (set from the route param) rather than
// a second function argument, so this still matches useClientValidation's
// required `(formData: FormData) => ParseOutcome` shape.
export function parseCreateSiteContractForm(formData: FormData) {
  return createSiteContractSchema.safeParse({
    siteId: formData.get("siteId"),
    subcontractorId: formData.get("subcontractorId"),
    workCategory: formData.get("workCategory") || undefined,
    description: formData.get("description") || undefined,
    rateType: formData.get("rateType") || undefined,
    rateUnitLabel: formData.get("rateUnitLabel") || undefined,
    rate: formData.get("rate") ? Number(formData.get("rate")) : undefined,
    fixedAmount: formData.get("fixedAmount") ? Number(formData.get("fixedAmount")) : undefined,
    estimatedQuantity: formData.get("estimatedQuantity") ? Number(formData.get("estimatedQuantity")) : undefined,
    status: formData.get("status") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });
}
