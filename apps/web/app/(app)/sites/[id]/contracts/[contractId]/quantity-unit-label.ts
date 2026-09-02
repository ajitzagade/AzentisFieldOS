import type { SiteContractDetail } from "./page";

// Restates a Site Contract's rate-type as a plural unit label for Work
// Entry quantity fields/columns — shared by the Site Contract detail page,
// the Log Work form, and the Work Entry correction form (3rd consumer,
// promoted out of per-file duplication).
export function quantityUnitLabel(
  contract: Pick<SiteContractDetail, "rateType" | "rateUnitLabel">,
): string {
  if (contract.rateType === "PER_TRIP") return "trips";
  if (contract.rateType === "PER_PIPE") return "pipes";
  return contract.rateUnitLabel ?? "units";
}
