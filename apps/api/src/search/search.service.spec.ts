import { describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service';

type Fn = ReturnType<typeof vi.fn>;

function makeService(overrides: {
  searchSites?: Fn;
  searchMaterials?: Fn;
  searchVendors?: Fn;
  searchTeamMembers?: Fn;
  searchPayments?: Fn;
  searchPurchases?: Fn;
  searchSubcontractors?: Fn;
  searchRmc?: Fn;
  searchExpenses?: Fn;
}) {
  const empty = () => vi.fn().mockResolvedValue({ candidates: [], total: 0 });

  const searchSites = overrides.searchSites ?? empty();
  const searchMaterials = overrides.searchMaterials ?? empty();
  const searchVendors = overrides.searchVendors ?? empty();
  const searchTeamMembers = overrides.searchTeamMembers ?? empty();
  const searchPayments = overrides.searchPayments ?? empty();
  const searchPurchases = overrides.searchPurchases ?? empty();
  const searchSubcontractors = overrides.searchSubcontractors ?? empty();
  const searchRmc = overrides.searchRmc ?? empty();
  const searchExpenses = overrides.searchExpenses ?? empty();

  const sites = { searchCandidates: searchSites };
  const materials = { searchCandidates: searchMaterials };
  const vendors = { searchCandidates: searchVendors };
  const teamMembers = { searchCandidates: searchTeamMembers };
  const payments = { searchCandidates: searchPayments };
  const purchases = { searchCandidates: searchPurchases };
  const subcontractors = { searchCandidates: searchSubcontractors };
  const rmc = { searchCandidates: searchRmc };
  const expenses = { searchCandidates: searchExpenses };

  const service = new SearchService(
    sites as unknown as ConstructorParameters<typeof SearchService>[0],
    materials as unknown as ConstructorParameters<typeof SearchService>[1],
    vendors as unknown as ConstructorParameters<typeof SearchService>[2],
    teamMembers as unknown as ConstructorParameters<typeof SearchService>[3],
    payments as unknown as ConstructorParameters<typeof SearchService>[4],
    purchases as unknown as ConstructorParameters<typeof SearchService>[5],
    subcontractors as unknown as ConstructorParameters<typeof SearchService>[6],
    rmc as unknown as ConstructorParameters<typeof SearchService>[7],
    expenses as unknown as ConstructorParameters<typeof SearchService>[8],
  );

  return {
    service,
    searchSites,
    searchMaterials,
    searchVendors,
    searchTeamMembers,
    searchPayments,
    searchPurchases,
    searchSubcontractors,
    searchRmc,
    searchExpenses,
  };
}

const EMPTY_GROUP = { results: [], total: 0 };

describe('SearchService.search', () => {
  it('short-circuits a blank/whitespace query to empty results with no DB call', async () => {
    const {
      service,
      searchSites,
      searchMaterials,
      searchVendors,
      searchTeamMembers,
      searchPayments,
      searchPurchases,
      searchSubcontractors,
      searchRmc,
      searchExpenses,
    } = makeService({});

    const result = await service.search('   ');

    for (const fn of [
      searchSites,
      searchMaterials,
      searchVendors,
      searchTeamMembers,
      searchPayments,
      searchPurchases,
      searchSubcontractors,
      searchRmc,
      searchExpenses,
    ]) {
      expect(fn).not.toHaveBeenCalled();
    }
    expect(result).toEqual({
      sites: EMPTY_GROUP,
      materials: EMPTY_GROUP,
      vendors: EMPTY_GROUP,
      teamMembers: EMPTY_GROUP,
      payments: EMPTY_GROUP,
      purchases: EMPTY_GROUP,
      subcontractors: EMPTY_GROUP,
      rmc: EMPTY_GROUP,
      expenses: EMPTY_GROUP,
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

  it('queries every entity with the trimmed query', async () => {
    const {
      service,
      searchSites,
      searchMaterials,
      searchVendors,
      searchTeamMembers,
      searchPayments,
      searchPurchases,
      searchSubcontractors,
      searchRmc,
      searchExpenses,
    } = makeService({});

    await service.search('  cement  ');

    for (const fn of [
      searchSites,
      searchMaterials,
      searchVendors,
      searchTeamMembers,
      searchPayments,
      searchPurchases,
      searchSubcontractors,
      searchRmc,
      searchExpenses,
    ]) {
      expect(fn).toHaveBeenCalledWith('cement');
    }
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

  it('returns every other group even when a Story 19.2 entity (Vendors) search rejects', async () => {
    const searchVendors = vi
      .fn()
      .mockRejectedValue(new Error('vendors query failed'));
    const searchSites = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 's1',
          name: 'Nashik Metro',
          location: 'Nashik',
          contractReference: null,
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchVendors, searchSites });

    const result = await service.search('nashik');

    expect(result.vendors).toEqual({ results: [], total: 0 });
    expect(result.sites.results).toEqual([
      {
        id: 's1',
        name: 'Nashik Metro',
        location: 'Nashik',
        contractReference: null,
      },
    ]);
  });

  it('maps a Vendor candidate to its search result shape', async () => {
    const searchVendors = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'v1',
          name: 'Shree Cement Traders',
          contactPerson: 'Ramesh',
          phone: '9876543210',
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchVendors });

    const result = await service.search('shree');

    expect(result.vendors.results).toEqual([
      {
        id: 'v1',
        name: 'Shree Cement Traders',
        contactPerson: 'Ramesh',
        phone: '9876543210',
      },
    ]);
    expect(result.vendors.total).toBe(1);
  });

  it('maps a Purchase candidate to its search result shape, including a null totalAmount (D7 Pricing pending)', async () => {
    const toNumber = (n: number) => ({ toNumber: () => n });
    const searchPurchases = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'p1',
          vendor: { name: 'Shree Cement Traders' },
          materialSize: { material: { name: 'Cement' } },
          invoiceOrChallanNo: 'INV-1',
          totalAmount: null,
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchPurchases });

    const result = await service.search('cement');

    expect(result.purchases.results).toEqual([
      {
        id: 'p1',
        vendorName: 'Shree Cement Traders',
        materialName: 'Cement',
        totalAmount: null,
      },
    ]);

    // A priced Purchase reports the numeric amount, not null.
    const pricedSearch = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'p2',
          vendor: { name: 'Shree Cement Traders' },
          materialSize: { material: { name: 'Cement' } },
          invoiceOrChallanNo: 'INV-2',
          totalAmount: toNumber(50000),
        },
      ],
      total: 1,
    });
    const { service: pricedService } = makeService({
      searchPurchases: pricedSearch,
    });
    const pricedResult = await pricedService.search('cement');
    expect(pricedResult.purchases.results[0]!.totalAmount).toBe(50000);
  });

  it('maps a Team Member candidate to its search result shape', async () => {
    const searchTeamMembers = vi.fn().mockResolvedValue({
      candidates: [{ id: 'tm1', name: 'Ravi Kumar', designation: 'Bar Bender' }],
      total: 1,
    });
    const { service } = makeService({ searchTeamMembers });

    const result = await service.search('ravi');

    expect(result.teamMembers.results).toEqual([{ id: 'tm1', name: 'Ravi Kumar', designation: 'Bar Bender' }]);
    expect(result.teamMembers.total).toBe(1);
  });

  it('maps a Payment candidate to its search result shape', async () => {
    const toNumber = (n: number) => ({ toNumber: () => n });
    const searchPayments = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'pay1',
          teamMember: { name: 'Ravi Kumar' },
          payPeriod: 'Aug 2026',
          netPayable: toNumber(8000),
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchPayments });

    const result = await service.search('ravi');

    expect(result.payments.results).toEqual([
      { id: 'pay1', teamMemberName: 'Ravi Kumar', payPeriod: 'Aug 2026', netPayable: 8000 },
    ]);
    expect(result.payments.total).toBe(1);
  });

  it('maps a Subcontractor candidate to its search result shape', async () => {
    const searchSubcontractors = vi.fn().mockResolvedValue({
      candidates: [{ id: 'sc1', name: 'Universal Waterproofing', contactPerson: 'Suresh', phone: '9988776655' }],
      total: 1,
    });
    const { service } = makeService({ searchSubcontractors });

    const result = await service.search('universal');

    expect(result.subcontractors.results).toEqual([
      { id: 'sc1', name: 'Universal Waterproofing', contactPerson: 'Suresh', phone: '9988776655' },
    ]);
    expect(result.subcontractors.total).toBe(1);
  });

  it('maps an RMC candidate to its search result shape', async () => {
    const searchRmc = vi.fn().mockResolvedValue({
      candidates: [{ id: 'rmc1', grade: 'M25', site: { name: 'NH-48 Widening' }, vendor: { name: 'Balaji RMC' } }],
      total: 1,
    });
    const { service } = makeService({ searchRmc });

    const result = await service.search('m25');

    expect(result.rmc.results).toEqual([
      { id: 'rmc1', grade: 'M25', siteName: 'NH-48 Widening', vendorName: 'Balaji RMC' },
    ]);
    expect(result.rmc.total).toBe(1);
  });

  it('maps an Expense candidate to its search result shape', async () => {
    const toNumber = (n: number) => ({ toNumber: () => n });
    const searchExpenses = vi.fn().mockResolvedValue({
      candidates: [
        { id: 'exp1', description: 'Site fuel', site: { name: 'NH-48 Widening' }, amount: toNumber(2000) },
      ],
      total: 1,
    });
    const { service } = makeService({ searchExpenses });

    const result = await service.search('fuel');

    expect(result.expenses.results).toEqual([
      { id: 'exp1', description: 'Site fuel', siteName: 'NH-48 Widening', amount: 2000 },
    ]);
    expect(result.expenses.total).toBe(1);
  });
});
