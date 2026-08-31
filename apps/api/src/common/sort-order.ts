// Shared runtime guard for the `order` query param every sortable list
// endpoint accepts — the value arrives as a raw, unvalidated HTTP query
// string, never actually enforced to be 'asc' | 'desc' just because a
// handler signature says so.
export function isSortOrder(
  value: string | undefined,
): value is 'asc' | 'desc' {
  return value === 'asc' || value === 'desc';
}
