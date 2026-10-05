// Shared by the Purchase/Movement/Consumption schemas: a transaction date
// typed as next year (or any other future date) by mistake is a real
// wrong-entry risk with no validation catching it today. Compared against
// IST since that's this codebase's established timezone convention for
// every other user-facing date (see apps/web/lib/format.ts's formatDate).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function todayIst(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// `date` is a YYYY-MM-DD string (z.iso.date()) — lexicographic comparison
// is exactly chronological comparison for that format.
export function isFutureIstDate(date: string): boolean {
  return date > todayIst();
}

// RmcEntry/WasteDisposal use z.coerce.date(), so by the time superRefine
// sees the value it's already a Date instance, not a string — compared by
// calendar day in IST (not exact instant), so a value entered as "today"
// at any time of day is never wrongly flagged.
export function isFutureIstDateObj(date: Date): boolean {
  const dateIst = new Date(date.getTime() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
  return dateIst > todayIst();
}
