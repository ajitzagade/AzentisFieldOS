// Shared display formatters (AD-5) — several list pages/list-clients
// (Expenses, Payments, RMC) each defined byte-identical local copies of
// these; centralized here instead of re-implemented per screen.

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Built manually (day/month-abbreviation/year) rather than via
// toLocaleDateString: the latter can't reliably guarantee an exact
// slash-separated "DD/MMM/YYYY" 3-letter-month form across environments
// and ICU/locale versions.
//
// Fields are read via Intl.DateTimeFormat's own `timeZone` option (Asia/
// Kolkata), not the Date object's local getters (finding, client-readiness
// batch): this app's production API runs on Vercel's iad1 region (US
// East), so `.getDate()`/`.getMonth()` during SSR would read the SERVER's
// zone and can roll the calendar day back across the IST boundary — a
// Purchase timestamped just after IST midnight would otherwise render as
// the previous evening's date.
export function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = part("day");
  const month = MONTH_ABBREVIATIONS[Number(part("month")) - 1];
  const year = part("year");
  return `${day}/${month}/${year}`;
}

// Same DD/MMM/YYYY date part, plus the time-of-day formatting already used
// across the app's local formatDateTime implementations (hour/minute via
// Intl, en-IN locale) — reused here rather than reinvented.
//
// Pinned to Asia/Kolkata (finding, client-readiness batch): this app's
// production API is deployed on Vercel's iad1 region (US East), not IST —
// without an explicit timeZone, the browser/server's own zone renders a
// displayed time that's off by 5.5 hours. Every other timeOfDay formatter in
// this codebase (site-operations-table, supervisor-home, owner-dashboard)
// already pins this; this shared helper had lost it in the consolidation.
export function formatDateTime(iso: string): string {
  const time = new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  return `${formatDate(iso)}, ${time}`;
}
