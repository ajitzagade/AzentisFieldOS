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
}
