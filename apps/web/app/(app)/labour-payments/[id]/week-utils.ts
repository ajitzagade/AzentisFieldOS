// Sun-Sat week math for the Labourer calendar/ledger — labour payments are
// generally handled weekly (per the ask), so every date here is anchored to
// its Sunday, matching DailyLabourWeeklyPayment.weekStartDate server-side.
const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function sundayOf(iso: string): string {
  const date = toUtcDate(iso);
  const day = date.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = -day;
  return toIsoDate(new Date(date.getTime() + diff * DAY_MS));
}

export function addWeeks(weekStartIso: string, weeks: number): string {
  return toIsoDate(new Date(toUtcDate(weekStartIso).getTime() + weeks * 7 * DAY_MS));
}

export function weekDates(weekStartIso: string): string[] {
  const start = toUtcDate(weekStartIso);
  return Array.from({ length: 7 }, (_, i) => toIsoDate(new Date(start.getTime() + i * DAY_MS)));
}

export function currentWeekStart(): string {
  return sundayOf(toIsoDate(new Date()));
}
