import { describe, expect, it } from 'vitest';
import { paginationParams } from './pagination';

describe('paginationParams', () => {
  it("is unpaginated when neither page nor pageSize is passed — preserves today's unbounded behavior", () => {
    expect(paginationParams()).toEqual({ paginated: false });
    expect(paginationParams(undefined, undefined)).toEqual({
      paginated: false,
    });
  });

  it('defaults page to 1 and pageSize to 25 once pagination is requested', () => {
    expect(paginationParams('1')).toEqual({
      paginated: true,
      page: 1,
      pageSize: 25,
      skip: 0,
      take: 25,
    });
  });

  it('computes skip from page and pageSize', () => {
    expect(paginationParams('3', '10')).toEqual({
      paginated: true,
      page: 3,
      pageSize: 10,
      skip: 20,
      take: 10,
    });
  });

  it('falls back to page 1 for a non-numeric, zero, or negative page', () => {
    expect(paginationParams('abc')).toMatchObject({ page: 1 });
    expect(paginationParams('0')).toMatchObject({ page: 1 });
    expect(paginationParams('-3')).toMatchObject({ page: 1 });
  });

  it('falls back to the default pageSize for a non-numeric, zero, or negative pageSize', () => {
    expect(paginationParams(undefined, 'abc')).toMatchObject({ pageSize: 25 });
    expect(paginationParams(undefined, '0')).toMatchObject({ pageSize: 25 });
    expect(paginationParams(undefined, '-5')).toMatchObject({ pageSize: 25 });
  });

  it('clamps an oversized pageSize to the maximum rather than letting a caller request an unbounded page', () => {
    expect(paginationParams('1', '10000')).toMatchObject({ pageSize: 100 });
  });

  it('clamps an oversized page number too — an unbounded page forces unbounded skip/take in top-k-merge callers like MovementsLogService', () => {
    expect(paginationParams('999999999')).toMatchObject({ page: 10000 });
  });

  it('rejects a fractional page or pageSize by falling back to the default', () => {
    expect(paginationParams('1.5')).toMatchObject({ page: 1 });
    expect(paginationParams(undefined, '10.5')).toMatchObject({ pageSize: 25 });
  });
});
