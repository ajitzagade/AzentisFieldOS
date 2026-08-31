import { describe, expect, it } from 'vitest';
import { rankByQuery } from './rank-by-query';

interface Named {
  name: string;
}

function names(items: Named[]): string[] {
  return items.map((item) => item.name);
}

describe('rankByQuery', () => {
  it('ranks an exact (case-insensitive) match before a starts-with match', () => {
    const items: Named[] = [{ name: 'Cementite' }, { name: 'Cement' }];

    const ranked = rankByQuery(items, 'cement', (item) => item.name);

    expect(names(ranked)).toEqual(['Cement', 'Cementite']);
  });

  it('ranks a starts-with match before a plain contains match', () => {
    const items: Named[] = [
      { name: 'RCC Cement Pipe' },
      { name: 'Cement Bag' },
    ];

    const ranked = rankByQuery(items, 'cement', (item) => item.name);

    expect(names(ranked)).toEqual(['Cement Bag', 'RCC Cement Pipe']);
  });

  it('orders alphabetically within the same tier', () => {
    const items: Named[] = [{ name: 'Site Zulu' }, { name: 'Site Alpha' }];

    const ranked = rankByQuery(items, 'site', (item) => item.name);

    expect(names(ranked)).toEqual(['Site Alpha', 'Site Zulu']);
  });

  it('does not mutate the input array', () => {
    const items: Named[] = [{ name: 'Zebra' }, { name: 'Apple' }];

    rankByQuery(items, 'a', (item) => item.name);

    expect(names(items)).toEqual(['Zebra', 'Apple']);
  });

  it('ranks by the best-matching field when getText returns multiple fields', () => {
    interface SiteLike {
      name: string;
      location: string;
      contractReference: string | null;
    }
    const items: SiteLike[] = [
      {
        name: 'NH-48 Highway Widening',
        location: 'Nashik',
        contractReference: null,
      },
      {
        name: 'Metro Depot',
        location: 'Nashik Bypass',
        contractReference: null,
      },
    ];

    const ranked = rankByQuery(items, 'nashik', (item) => [
      item.name,
      item.location,
      item.contractReference ?? '',
    ]);

    // Neither name matches, but "Nashik" is an exact location match while
    // "Nashik Bypass" is only a starts-with — the exact field match wins.
    expect(ranked.map((item) => item.name)).toEqual([
      'NH-48 Highway Widening',
      'Metro Depot',
    ]);
  });
});
