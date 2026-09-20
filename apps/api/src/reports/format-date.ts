// Duplicated DD/MMM/YYYY logic from apps/web/lib/format.ts's formatDate —
// intentional (per AGENTS.md): apps/api never imports from apps/web/lib, and
// pulling in a cross-package dependency for the handful of call sites here
// would be over-engineering.
//
// Uses UTC getters (unlike the web version's local-time getters): every date
// formatted here is a pure calendar day — a Prisma DateTime stored at UTC
// midnight (DailySiteReport.reportDate) or a YYYY-MM-DD range-boundary string
// (report-schedules.service.ts's dateRange()) — so using local-time getters
// would risk an off-by-one-day shift depending on the server process's
// timezone. The values this formats are never wall-clock timestamps.
const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
