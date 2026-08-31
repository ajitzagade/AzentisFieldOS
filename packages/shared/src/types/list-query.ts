// List search/filter/sort/pagination query shape, shared by every list page
// and its backing endpoint. Plain types, not a Zod input schema — same
// reasoning as report-filters.ts: these are optional URL query params read
// on a GET, not a mutation body validated against a shared schema (AD-7's
// shared-validator treatment applies to write bodies).
//
// Every field is optional and absence is meaningful: an endpoint receiving
// none of these must return its full, unbounded result exactly as it does
// today — pagination/search/filter/sort are all opt-in additions, never a
// changed default for an existing caller.
export interface ListQuery {
  /** Search term, matched against that list's defined searchable fields. */
  q?: string;
  page?: string;
  pageSize?: string;
  /** Column/field key to sort by — each list defines its own allowed set. */
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}
