// Report query filters (Story 13.2, FR-42/FR-43). Plain read/query shapes,
// not Zod input schemas — these are optional URL query params the Reports
// surface threads into each owning epic's existing query, not a mutation
// body to validate (AD-7), so they don't get the shared-validator treatment.
//
// NB (AD-1): there is deliberately NO `tenantId` field here, and there never
// should be — a deployment's database belongs to exactly one Tenant, so a
// Tenant-scoping filter would be solving a problem this architecture does not
// have. AC #2 is satisfied by the absence of such a field, not its presence.
export interface ReportDateRange {
  /** Inclusive lower bound, ISO date (YYYY-MM-DD). */
  from?: string;
  /** Inclusive upper bound, ISO date (YYYY-MM-DD). */
  to?: string;
}

export interface SiteReportFilters extends ReportDateRange {
  siteId?: string;
}

export interface InventoryReportFilters extends ReportDateRange {
  siteId?: string;
  materialId?: string;
  // Story 19.5 (Pending-Pricing Deep Link): Purchase-only filter — when set,
  // PurchasesService.list()'s reportWhere() folds in the exact
  // { totalAmount: null, correctsId: null } clause countPendingPricing()
  // already uses, so the Dashboard gap-flag's count and this filtered list
  // always agree on the same universe of rows. Movements/Consumption/
  // ReturnWastage ignore this field.
  pendingPricing?: boolean;
}

// Story 13.3 (FR-44): Labour reports. `teamMemberId` optional — omitted means
// "All Team Members" (every person's data in the window), exactly as
// InventoryReportFilters' siteId omission means "All Sites". Same AD-1 note as
// above applies: no tenantId here, ever.
export interface LabourReportFilters extends ReportDateRange {
  teamMemberId?: string;
}

// Story 13.3 (FR-45): Machinery/Vehicle reports. `assetType`+`assetId` together
// pick a single Machine/Vehicle to drill into (its usage/movement/service
// history); omitting them shows the register (current-status) view for all
// assets, mirroring the Site report's "pick a Site" gate.
export interface MachineryReportFilters extends ReportDateRange {
  assetType?: "MACHINERY" | "VEHICLE";
  assetId?: string;
}

// Story 13.4 (FR-46): Financial reports. `siteId` optional — omitted means the
// per-Site breakdown lists every Site with a cost in the window; supplied
// narrows the `bySite` breakdown to that one Site. The `contractorTotal`
// rollup is always Contractor-wide (across every Site), independent of this
// filter, because two of its five categories (labour, machineryVehicle) are
// structurally not attributable to a Site at all (see FinancialReportsService).
// Same AD-1 note as above applies: no tenantId here, ever.
export interface FinancialReportFilters extends ReportDateRange {
  siteId?: string;
}
