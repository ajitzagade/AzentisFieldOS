// Shared display formatters (AD-5) — several list pages/list-clients
// (Expenses, Payments, RMC) each defined byte-identical local copies of
// these; centralized here instead of re-implemented per screen.

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
