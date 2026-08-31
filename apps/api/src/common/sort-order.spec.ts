import { describe, expect, it } from 'vitest';
import { isSortOrder } from './sort-order';

describe('isSortOrder', () => {
  it('accepts "asc" and "desc"', () => {
    expect(isSortOrder('asc')).toBe(true);
    expect(isSortOrder('desc')).toBe(true);
  });

  it('rejects an unrecognized value or undefined', () => {
    expect(isSortOrder('garbage')).toBe(false);
    expect(isSortOrder(undefined)).toBe(false);
  });
});
