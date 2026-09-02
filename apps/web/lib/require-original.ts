// Correction forms derive their signed delta from the ledger row's original
// value. A missing original must fail loudly — deriving a delta against a
// silent 0 would put a wrong adjustment on the ledger (review 2026-09-02).
export function requireOriginal(value: number | string | undefined | null, field: string): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (parsed === undefined || parsed === null || !Number.isFinite(parsed)) {
    throw new Error(`Correction form rendered without the original ${field} — refusing to derive a delta against 0`);
  }
  return parsed;
}
