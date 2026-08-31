import { describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service';

function makeService(overrides: {
  searchSites?: ReturnType<typeof vi.fn>;
  searchMaterials?: ReturnType<typeof vi.fn>;
}) {
  const searchSites =
    overrides.searchSites ??
    vi.fn().mockResolvedValue({ candidates: [], total: 0 });
  const searchMaterials =
    overrides.searchMaterials ??
    vi.fn().mockResolvedValue({ candidates: [], total: 0 });

  const sites = { searchCandidates: searchSites };
  const materials = { searchCandidates: searchMaterials };

  const service = new SearchService(
    sites as unknown as ConstructorParameters<typeof SearchService>[0],
    materials as unknown as ConstructorParameters<typeof SearchService>[1],
  );

  return { service, searchSites, searchMaterials };
}

describe('SearchService.search', () => {
  it('short-circuits a blank/whitespace query to empty results with no DB call', async () => {
    const { service, searchSites, searchMaterials } = makeService({});

    const result = await service.search('   ');

    expect(searchSites).not.toHaveBeenCalled();
    expect(searchMaterials).not.toHaveBeenCalled();
    expect(result).toEqual({
      sites: { results: [], total: 0 },
      materials: { results: [], total: 0 },
    });
  });

  it('ranks candidates and caps the inline results at 5, keeping the true total', async () => {
    const siteCandidates = Array.from({ length: 8 }, (_, i) => ({
      id: `s${i}`,
      name: `Site ${i}`,
      location: 'Nashik',
      contractReference: null,
    }));
    // Put the exact match last in the candidate list — ranking must still
    // surface it first once sliced to the top 5.
    siteCandidates.push({
      id: 'exact',
      name: 'site',
      location: 'Nashik',
      contractReference: null,
    });
    const searchSites = vi
      .fn()
      .mockResolvedValue({ candidates: siteCandidates, total: 9 });
    const searchMaterials = vi.fn().mockResolvedValue({
      candidates: [
        { id: 'm1', name: 'Cement', category: { id: 'c1', name: 'Binders' } },
      ],
      total: 1,
    });
    const { service } = makeService({ searchSites, searchMaterials });

    const result = await service.search('site');

    expect(result.sites.results).toHaveLength(5);
    expect(result.sites.results[0]).toEqual({
      id: 'exact',
      name: 'site',
      location: 'Nashik',
      contractReference: null,
    });
    expect(result.sites.total).toBe(9);
    expect(result.materials.results).toEqual([
      { id: 'm1', name: 'Cement', category: { id: 'c1', name: 'Binders' } },
    ]);
    expect(result.materials.total).toBe(1);
  });

  it('ranks a Site by its best-matching field, not name alone (AC #1: search must also match location/contract reference)', async () => {
    const siteCandidates = [
      // Name only contains "nashik" as a substring — a weaker match...
      {
        id: 'partial',
        name: 'Nashik Metro Depot Extension',
        location: 'Pune',
        contractReference: null,
      },
      // ...than this Site, whose location is an exact match on "nashik".
      {
        id: 'exact-location',
        name: 'Highway Widening',
        location: 'Nashik',
        contractReference: null,
      },
    ];
    const searchSites = vi
      .fn()
      .mockResolvedValue({ candidates: siteCandidates, total: 2 });
    const { service } = makeService({ searchSites });

    const result = await service.search('nashik');

    expect(result.sites.results.map((s) => s.id)).toEqual([
      'exact-location',
      'partial',
    ]);
  });

  it('queries both entities with the trimmed query', async () => {
    const { service, searchSites, searchMaterials } = makeService({});

    await service.search('  cement  ');

    expect(searchSites).toHaveBeenCalledWith('cement');
    expect(searchMaterials).toHaveBeenCalledWith('cement');
  });

  it("returns the Materials group's results even when Sites search rejects (per-group error isolation)", async () => {
    const searchSites = vi
      .fn()
      .mockRejectedValue(new Error('sites query failed'));
    const searchMaterials = vi.fn().mockResolvedValue({
      candidates: [
        { id: 'm1', name: 'Cement', category: { id: 'c1', name: 'Binders' } },
      ],
      total: 1,
    });
    const { service } = makeService({ searchSites, searchMaterials });

    const result = await service.search('cement');

    expect(result.sites).toEqual({ results: [], total: 0 });
    expect(result.materials.results).toEqual([
      { id: 'm1', name: 'Cement', category: { id: 'c1', name: 'Binders' } },
    ]);
  });
});
