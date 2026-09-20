// Shared FormData→number coercion helpers (AD-7 in spirit: one
// implementation, reused everywhere a form's FormData needs parsing) — a
// blank/absent field must parse to `undefined`, never `NaN`, so an
// optional-pricing field (D7's Purchase pattern, and the RMC/Waste
// Disposal rate-optional fields it was extended to) can travel through the
// Zod schema's `.optional()` cleanly instead of failing as a bad number.
export function optionalNumber(value: FormDataEntryValue | null | undefined): number | undefined {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  return Number(value);
}
