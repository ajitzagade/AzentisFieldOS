import { describe, expect, it } from 'vitest';
import { localDayRange } from './local-day';

const IST = 'Asia/Kolkata'; // fixed +5:30, no DST

describe('localDayRange (timezone-correct day boundary)', () => {
  it('maps a UTC instant that is still evening-yesterday-UTC but already today in IST to the correct local day', () => {
    // 2026-08-26T18:45:00Z === 2026-08-27 00:15 IST — the DSR-at-11pm-local
    // hazard the story calls out: naive UTC would classify this as the 26th.
    const range = localDayRange(new Date('2026-08-26T18:45:00.000Z'), IST);

    expect(range.dateStr).toBe('2026-08-27');
    expect(range.dateOnly.toISOString()).toBe('2026-08-27T00:00:00.000Z');
    // IST midnight of the 27th is 18:30 UTC on the 26th.
    expect(range.startUtc.toISOString()).toBe('2026-08-26T18:30:00.000Z');
    expect(range.endUtc.toISOString()).toBe('2026-08-27T18:30:00.000Z');
  });

  it('maps a UTC instant just before IST midnight to the earlier local day', () => {
    // 2026-08-26T18:15:00Z === 2026-08-26 23:45 IST.
    const range = localDayRange(new Date('2026-08-26T18:15:00.000Z'), IST);

    expect(range.dateStr).toBe('2026-08-26');
    expect(range.startUtc.toISOString()).toBe('2026-08-25T18:30:00.000Z');
    expect(range.endUtc.toISOString()).toBe('2026-08-26T18:30:00.000Z');
  });

  it('produces a half-open range exactly one day wide', () => {
    const range = localDayRange(new Date('2026-08-26T09:00:00.000Z'), IST);
    expect(range.endUtc.getTime() - range.startUtc.getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
  });

  it('honours a non-IST timezone (UTC) too', () => {
    const range = localDayRange(new Date('2026-08-26T18:45:00.000Z'), 'UTC');
    expect(range.dateStr).toBe('2026-08-26');
    expect(range.startUtc.toISOString()).toBe('2026-08-26T00:00:00.000Z');
    expect(range.endUtc.toISOString()).toBe('2026-08-27T00:00:00.000Z');
  });
});
