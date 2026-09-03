// Global search (Story 16.2) response shape, shared by apps/api's
// GET /search and apps/web's global search UI. Plain types, not a Zod
// schema — same reasoning as list-query.ts: this is a GET response shape,
// not a mutation body.
export interface SiteSearchResult {
  id: string;
  name: string;
  location: string;
  contractReference: string | null;
}

export interface MaterialSearchResult {
  id: string;
  name: string;
  category: { id: string; name: string };
}

// Story 19.2: the palette's entity coverage expands to every remaining
// major record type. Each result carries just enough to render a row
// (label + a short disambiguating description) and to resolve routing —
// Purchase's `totalAmount` decides the pricing-pending vs correct branch
// (D7), the rest route by `id` alone.
export interface VendorSearchResult {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
}

export interface TeamMemberSearchResult {
  id: string;
  name: string;
  designation: string | null;
}

export interface PaymentSearchResult {
  id: string;
  teamMemberName: string;
  payPeriod: string | null;
  netPayable: number;
}

export interface PurchaseSearchResult {
  id: string;
  vendorName: string;
  materialName: string;
  // null ⇔ "Pricing pending" (D7) — the palette routes selection to the
  // pricing screen instead of Correct when this is null.
  totalAmount: number | null;
}

export interface SubcontractorSearchResult {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
}

export interface RmcSearchResult {
  id: string;
  grade: string;
  siteName: string;
  vendorName: string;
}

export interface ExpenseSearchResult {
  id: string;
  description: string | null;
  siteName: string;
  amount: number;
}

// Story 16.6: the palette's coverage expands to every remaining core entity
// type. Same "just enough to render a row and resolve routing" shape as the
// Story 19.2 results above.
export interface MovementSearchResult {
  id: string;
  materialName: string;
  sourceSiteName: string | null;
  destinationSiteName: string;
}

export interface ConsumptionSearchResult {
  id: string;
  materialName: string;
  siteName: string;
}

export interface WasteDisposalSearchResult {
  id: string;
  wasteType: string;
  siteName: string;
  vendorName: string | null;
}

// Distinct from WasteDisposal above — Epic 5's Return/Wastage inventory
// transaction (decreases Site Stock), not Epic 15's per-trip disposal cost
// ledger.
export interface ReturnWastageSearchResult {
  id: string;
  kind: string;
  materialName: string;
  siteName: string;
}

export interface AdvanceSearchResult {
  id: string;
  // Routing needs the parent Team Member's id — /team/[id]/advances/[advanceId]/correct.
  teamMemberId: string;
  teamMemberName: string;
  amount: number;
}

export interface AdvanceAdjustmentSearchResult {
  id: string;
  // Routing needs both — /team/[teamMemberId]/advances/[advanceId]/adjustments/[id]/correct.
  teamMemberId: string;
  advanceId: string;
  teamMemberName: string;
  amount: number;
}

export interface MachinerySearchResult {
  id: string;
  name: string;
  assetNumber: string;
  currentSiteName: string | null;
}

export interface VehicleSearchResult {
  id: string;
  number: string;
  currentSiteName: string | null;
}

export interface SiteContractSearchResult {
  id: string;
  // Routing needs the Site's id — /sites/[siteId]/contracts/[id].
  siteId: string;
  subcontractorName: string;
  siteName: string;
  status: string;
}

export interface WorkEntrySearchResult {
  id: string;
  // Routing needs both — /sites/[siteId]/contracts/[siteContractId]/work-entries/[id]/correct.
  siteId: string;
  siteContractId: string;
  subcontractorName: string;
  siteName: string;
}

// One of two groups the search layer role-gates to OWNER_ADMIN (Story
// 16.5's mechanism) — matches SubcontractorPaymentsController's own
// class-level @Roles('OWNER_ADMIN').
export interface SubcontractorPaymentSearchResult {
  id: string;
  // Routing needs both — /sites/[siteId]/contracts/[siteContractId]/payments/[id]/correct.
  siteId: string;
  siteContractId: string;
  subcontractorName: string;
  siteName: string;
  amount: number;
}

export interface WorkRecordSearchResult {
  id: string;
  // Routing falls back to the Team Member's own detail page — no
  // per-Work-Record page exists today.
  teamMemberId: string;
  teamMemberName: string;
  siteName: string;
}

export interface DailyReportSearchResult {
  id: string;
  siteName: string;
  submittedByName: string;
}

// The other role-gated group (Story 16.5) — matches
// AuditController.list()'s own @Roles('OWNER_ADMIN'). No siteName: resolving
// it needs the same extra siteId->name lookup AuditController.list() does,
// not worth adding to the already-22-way search fan-out for a search-result
// row that already carries `action`.
export interface AuditLogSearchResult {
  id: string;
  action: string;
  userName: string;
}

export interface SearchResultGroup<T> {
  results: T[];
  total: number;
}

export interface SearchResponse {
  sites: SearchResultGroup<SiteSearchResult>;
  materials: SearchResultGroup<MaterialSearchResult>;
  vendors: SearchResultGroup<VendorSearchResult>;
  teamMembers: SearchResultGroup<TeamMemberSearchResult>;
  payments: SearchResultGroup<PaymentSearchResult>;
  purchases: SearchResultGroup<PurchaseSearchResult>;
  subcontractors: SearchResultGroup<SubcontractorSearchResult>;
  rmc: SearchResultGroup<RmcSearchResult>;
  expenses: SearchResultGroup<ExpenseSearchResult>;
  movements: SearchResultGroup<MovementSearchResult>;
  consumptions: SearchResultGroup<ConsumptionSearchResult>;
  wasteDisposals: SearchResultGroup<WasteDisposalSearchResult>;
  returnWastages: SearchResultGroup<ReturnWastageSearchResult>;
  advances: SearchResultGroup<AdvanceSearchResult>;
  advanceAdjustments: SearchResultGroup<AdvanceAdjustmentSearchResult>;
  machinery: SearchResultGroup<MachinerySearchResult>;
  vehicles: SearchResultGroup<VehicleSearchResult>;
  siteContracts: SearchResultGroup<SiteContractSearchResult>;
  workEntries: SearchResultGroup<WorkEntrySearchResult>;
  subcontractorPayments: SearchResultGroup<SubcontractorPaymentSearchResult>;
  workRecords: SearchResultGroup<WorkRecordSearchResult>;
  dailyReports: SearchResultGroup<DailyReportSearchResult>;
  auditLogs: SearchResultGroup<AuditLogSearchResult>;
}
