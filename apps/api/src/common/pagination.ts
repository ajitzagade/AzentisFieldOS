// Every list endpoint's page/pageSize query params → Prisma skip/take,
// shared so no endpoint hand-rolls its own parsing/clamping. Mirrors
// date-range.ts's shape: raw query-string inputs in, a typed result out.
//
// `paginated: false` when neither param is passed is deliberate, not a
// default-to-page-1 shortcut — every list endpoint this touches is live in
// production today and returns its full unbounded result set to existing
// callers; a caller that never asked for a page must keep getting exactly
// that until it opts in.
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
// A safety valve, not a real UX limit (the shared `Pagination` UI only
// offers Previous/Next, never jump-to-page) — without this, an oversized
// `page` forces an unbounded `skip`, and in `MovementsLogService`'s
// top-k-merge specifically, an unbounded `take` (page × pageSize) per source.
const MAX_PAGE = 10000;

export type PaginationParams =
  | { paginated: false }
  | {
      paginated: true;
      page: number;
      pageSize: number;
      skip: number;
      take: number;
    };

function positiveInteger(
  value: string | undefined,
  fallback: number,
  max?: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return max ? Math.min(parsed, max) : parsed;
}

export function paginationParams(
  page?: string,
  pageSize?: string,
): PaginationParams {
  if (page === undefined && pageSize === undefined) {
    return { paginated: false };
  }

  const safePage = positiveInteger(page, 1, MAX_PAGE);
  const safePageSize = positiveInteger(
    pageSize,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );

  return {
    paginated: true,
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}
