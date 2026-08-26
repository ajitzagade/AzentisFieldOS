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
}
