// Postgres `contains`/`insensitive` has no built-in relevance score. Every
// item passed in has already matched the query via a DB `contains` filter —
// this just orders that already-matched set so the best matches surface
// first: an exact match, then a starts-with match, then everything else
// (plain contains), alphabetical within each tier. `getText` may return
// several fields the query was matched against (e.g. a Site's name,
// location, and contract reference) — the item's tier is the best (lowest)
// tier across all of them, so an exact match on any one field outranks a
// mere starts-with on another.
export function rankByQuery<T>(
  items: T[],
  query: string,
  getText: (item: T) => string | string[],
): T[] {
  const q = query.trim().toLowerCase();

  function fields(item: T): string[] {
    const text = getText(item);
    return Array.isArray(text) ? text : [text];
  }

  function tier(item: T): 0 | 1 | 2 {
    return fields(item).reduce<0 | 1 | 2>((best, field) => {
      const text = field.toLowerCase();
      const fieldTier = text === q ? 0 : text.startsWith(q) ? 1 : 2;
      return Math.min(best, fieldTier) as 0 | 1 | 2;
    }, 2);
  }

  return [...items].sort((a, b) => {
    const tierDiff = tier(a) - tier(b);
    if (tierDiff !== 0) return tierDiff;
    return (fields(a)[0] ?? '').localeCompare(fields(b)[0] ?? '');
  });
}
