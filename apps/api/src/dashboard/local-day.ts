// "Today" for the Dashboard's same-day aggregates means the deployment's
// configured local-timezone calendar day, never naive UTC midnight — per the
// architecture spine's Consistency Conventions ("Timestamps: stored UTC
// ISO-8601, rendered in the deployment's configured local timezone"). A DSR
// or Purchase entered at 11 PM local time in India (UTC+5:30) is still
// "today"; a naive `WHERE ... = CURRENT_DATE` evaluated in UTC would push it
// to "yesterday" and, for the DSR case, wrongly flag that Site as missing.
//
// The timezone is deployment configuration (`APP_TIMEZONE`), the same way
// `TENANT_ID`/branding are (spine AD-1). Default is India Standard Time,
// the platform's launch market.
export const DEFAULT_APP_TIMEZONE = 'Asia/Kolkata';

export function resolveAppTimeZone(): string {
  return process.env.APP_TIMEZONE ?? DEFAULT_APP_TIMEZONE;
}

// The signed offset, in milliseconds, of `timeZone` from UTC at the given
// instant (e.g. +5:30 IST -> 19_800_000). Derived by asking Intl to render
// the instant's wall-clock in that zone and diffing it back against UTC — the
// only DST-correct way to get an offset without a timezone database of our
// own.
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const asUtc = Date.UTC(
    lookup('year'),
    lookup('month') - 1,
    lookup('day'),
    lookup('hour'),
    lookup('minute'),
    lookup('second'),
  );
  return asUtc - instant.getTime();
}

// The UTC instant of local midnight for the given calendar date in `timeZone`.
function zonedMidnightUtc(
  year: number,
  monthIndex: number,
  day: number,
  timeZone: string,
): Date {
  // Midnight-UTC of the same Y/M/D is our first guess; correct it by the
  // zone's offset at that instant. Date.UTC handles day/month/year overflow
  // (e.g. day = 32) so the "next day" boundary needs no special-casing.
  const guessUtc = Date.UTC(year, monthIndex, day, 0, 0, 0, 0);
  const offset = timeZoneOffsetMs(new Date(guessUtc), timeZone);
  return new Date(guessUtc - offset);
}

export interface LocalDayRange {
  // The local calendar date, `YYYY-MM-DD`.
  dateStr: string;
  // A Date at UTC-midnight of `dateStr`, for equality against Prisma `@db.Date`
  // columns (DailySiteReport.reportDate), which Prisma stores/returns as
  // UTC-midnight-of-the-date with no time component.
  dateOnly: Date;
  // Half-open UTC instant range [startUtc, endUtc) covering the local day, for
  // filtering full `DateTime` columns (purchasedAt/consumedAt/deliveredAt/
  // incurredAt).
  startUtc: Date;
  endUtc: Date;
}

// The local-timezone calendar day containing `now`.
export function localDayRange(now: Date, timeZone: string): LocalDayRange {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // en-CA yields ISO-shaped YYYY-MM-DD

  const [year, month, day] = dateStr.split('-').map(Number) as [
    number,
    number,
    number,
  ];

  return {
    dateStr,
    dateOnly: new Date(`${dateStr}T00:00:00.000Z`),
    startUtc: zonedMidnightUtc(year, month - 1, day, timeZone),
    endUtc: zonedMidnightUtc(year, month - 1, day + 1, timeZone),
  };
}
