// Story 13.2: a single inclusive [from, to] date-range → Prisma filter
// helper, shared by every report query that threads from/to into an existing
// findMany. `to` is made end-of-day-inclusive by advancing to the next UTC
// midnight and using `lt`, so a `to=2026-08-11` filter includes records
// timestamped any time on the 11th — correct for both @db.Date fields
// (stored at midnight) and full DateTime business-date fields (purchasedAt,
// movedAt, ...). Dates are treated in UTC, consistent with the rest of the
// app's date handling (see reports.controller.toReportDate / dashboard's
// local-day notes).
//
// Returns `undefined` when neither bound is set so callers can assign it
// straight onto a Prisma field (`purchasedAt: bounds`) — Prisma reads an
// `undefined` filter as "no constraint", so an unfiltered report needs no
// branching at the call site.
export interface DateRangeBounds {
  gte?: Date;
  lt?: Date;
}

export function dateRangeBounds(
  from?: string,
  to?: string,
): DateRangeBounds | undefined {
  const bounds: DateRangeBounds = {};
  if (from) {
    bounds.gte = new Date(from);
  }
  if (to) {
    const end = new Date(to);
    end.setUTCDate(end.getUTCDate() + 1);
    bounds.lt = end;
  }
  return bounds.gte || bounds.lt ? bounds : undefined;
}
