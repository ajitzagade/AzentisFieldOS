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

export interface SearchResultGroup<T> {
  results: T[];
  total: number;
}

export interface SearchResponse {
  sites: SearchResultGroup<SiteSearchResult>;
  materials: SearchResultGroup<MaterialSearchResult>;
}
