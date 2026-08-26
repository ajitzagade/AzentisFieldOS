import { describe, expect, it } from 'vitest';
import { dateRangeBounds } from './date-range';

describe('dateRangeBounds', () => {
  it('returns undefined when neither bound is set (no constraint)', () => {
    expect(dateRangeBounds()).toBeUndefined();
    expect(dateRangeBounds(undefined, undefined)).toBeUndefined();
  });

  it('sets a gte at the start of the from day', () => {
    expect(dateRangeBounds('2026-08-01')).toEqual({
      gte: new Date('2026-08-01T00:00:00.000Z'),
    });
  });

  it('makes `to` end-of-day-inclusive via the next UTC midnight (lt)', () => {
    // A record timestamped any time on 2026-08-11 must fall inside a
    // to=2026-08-11 window — so the exclusive upper bound is 2026-08-12 00:00Z.
    expect(dateRangeBounds(undefined, '2026-08-11')).toEqual({
      lt: new Date('2026-08-12T00:00:00.000Z'),
    });
  });

  it('composes both bounds for a full window', () => {
    expect(dateRangeBounds('2026-08-01', '2026-08-31')).toEqual({
      gte: new Date('2026-08-01T00:00:00.000Z'),
      lt: new Date('2026-09-01T00:00:00.000Z'),
    });
  });

  it('rolls the month/year over correctly at a boundary `to`', () => {
    expect(dateRangeBounds(undefined, '2026-12-31')).toEqual({
      lt: new Date('2027-01-01T00:00:00.000Z'),
    });
  });
});
