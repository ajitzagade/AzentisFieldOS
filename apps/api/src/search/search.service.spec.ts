import { describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service';

type Fn = ReturnType<typeof vi.fn>;

const toNumber = (n: number) => ({ toNumber: () => n });

function makeService(overrides: Record<string, Fn> = {}) {
  const empty = () => vi.fn().mockResolvedValue({ candidates: [], total: 0 });

  const keys = [
    'searchSites',
    'searchMaterials',
    'searchVendors',
    'searchTeamMembers',
    'searchPayments',
    'searchPurchases',
    'searchSubcontractors',
    'searchRmc',
    'searchExpenses',
    'searchMovements',
    'searchConsumption',
    'searchWasteDisposal',
    'searchReturnWastage',
    'searchAdvances',
    'searchAdvanceAdjustments',
    'searchMachinery',
    'searchVehicles',
    'searchSiteContracts',
    'searchWorkEntries',
    'searchSubcontractorPayments',
    'searchWorkRecords',
    'searchDsr',
    'searchAudit',
  ] as const;

  const fns = Object.fromEntries(
    keys.map((key) => [key, overrides[key] ?? empty()]),
  ) as Record<(typeof keys)[number], Fn>;

  const service = new SearchService(
    { searchCandidates: fns.searchSites } as unknown as ConstructorParameters<typeof SearchService>[0],
    { searchCandidates: fns.searchMaterials } as unknown as ConstructorParameters<typeof SearchService>[1],
    { searchCandidates: fns.searchVendors } as unknown as ConstructorParameters<typeof SearchService>[2],
    { searchCandidates: fns.searchTeamMembers } as unknown as ConstructorParameters<typeof SearchService>[3],
    { searchCandidates: fns.searchPayments } as unknown as ConstructorParameters<typeof SearchService>[4],
    { searchCandidates: fns.searchPurchases } as unknown as ConstructorParameters<typeof SearchService>[5],
    { searchCandidates: fns.searchSubcontractors } as unknown as ConstructorParameters<typeof SearchService>[6],
    { searchCandidates: fns.searchRmc } as unknown as ConstructorParameters<typeof SearchService>[7],
    { searchCandidates: fns.searchExpenses } as unknown as ConstructorParameters<typeof SearchService>[8],
    { searchCandidates: fns.searchMovements } as unknown as ConstructorParameters<typeof SearchService>[9],
    { searchCandidates: fns.searchConsumption } as unknown as ConstructorParameters<typeof SearchService>[10],
    { searchCandidates: fns.searchWasteDisposal } as unknown as ConstructorParameters<typeof SearchService>[11],
    { searchCandidates: fns.searchReturnWastage } as unknown as ConstructorParameters<typeof SearchService>[12],
    { searchCandidates: fns.searchAdvances } as unknown as ConstructorParameters<typeof SearchService>[13],
    { searchCandidates: fns.searchAdvanceAdjustments } as unknown as ConstructorParameters<typeof SearchService>[14],
    { searchCandidates: fns.searchMachinery } as unknown as ConstructorParameters<typeof SearchService>[15],
    { searchCandidates: fns.searchVehicles } as unknown as ConstructorParameters<typeof SearchService>[16],
    { searchCandidates: fns.searchSiteContracts } as unknown as ConstructorParameters<typeof SearchService>[17],
    { searchCandidates: fns.searchWorkEntries } as unknown as ConstructorParameters<typeof SearchService>[18],
    { searchCandidates: fns.searchSubcontractorPayments } as unknown as ConstructorParameters<typeof SearchService>[19],
    { searchCandidates: fns.searchWorkRecords } as unknown as ConstructorParameters<typeof SearchService>[20],
    { searchCandidates: fns.searchDsr } as unknown as ConstructorParameters<typeof SearchService>[21],
    { searchCandidates: fns.searchAudit } as unknown as ConstructorParameters<typeof SearchService>[22],
  );

  return { service, ...fns };
}

const EMPTY_GROUP = { results: [], total: 0 };
const ALL_GROUP_KEYS = [
  'sites',
  'materials',
  'vendors',
  'teamMembers',
  'payments',
  'purchases',
  'subcontractors',
  'rmc',
  'expenses',
  'movements',
  'consumptions',
  'wasteDisposals',
  'returnWastages',
  'advances',
  'advanceAdjustments',
  'machinery',
  'vehicles',
  'siteContracts',
  'workEntries',
  'subcontractorPayments',
  'workRecords',
  'dailyReports',
  'auditLogs',
] as const;

describe('SearchService.search', () => {
  it('short-circuits a blank/whitespace query to empty results with no DB call', async () => {
    const { service, ...fns } = makeService({});

    const result = await service.search('   ', 'OWNER_ADMIN');

    for (const fn of Object.values(fns)) {
      expect(fn).not.toHaveBeenCalled();
    }
    expect(result).toEqual(
      Object.fromEntries(ALL_GROUP_KEYS.map((key) => [key, EMPTY_GROUP])),
    );
  });

  it('short-circuits a sub-2-character query to empty results with no DB call', async () => {
    const { service, ...fns } = makeService({});

    const result = await service.search('a', 'OWNER_ADMIN');

    for (const fn of Object.values(fns)) {
      expect(fn).not.toHaveBeenCalled();
    }
    expect(result).toEqual(
      Object.fromEntries(ALL_GROUP_KEYS.map((key) => [key, EMPTY_GROUP])),
    );
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

    const result = await service.search('site', 'OWNER_ADMIN');

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

    const result = await service.search('nashik', 'OWNER_ADMIN');

    expect(result.sites.results.map((s) => s.id)).toEqual([
      'exact-location',
      'partial',
    ]);
  });

  it('queries every entity with the trimmed query, including the gated ones for an OWNER_ADMIN', async () => {
    const { service, ...fns } = makeService({});

    await service.search('  cement  ', 'OWNER_ADMIN');

    for (const fn of Object.values(fns)) {
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

    const result = await service.search('cement', 'OWNER_ADMIN');

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

    const result = await service.search('nashik', 'OWNER_ADMIN');

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

    const result = await service.search('shree', 'OWNER_ADMIN');

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

    const result = await service.search('cement', 'OWNER_ADMIN');

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
    const pricedResult = await pricedService.search('cement', 'OWNER_ADMIN');
    expect(pricedResult.purchases.results[0]!.totalAmount).toBe(50000);
  });

  it('maps a Team Member candidate to its search result shape', async () => {
    const searchTeamMembers = vi.fn().mockResolvedValue({
      candidates: [
        { id: 'tm1', name: 'Ravi Kumar', designation: 'Bar Bender' },
      ],
      total: 1,
    });
    const { service } = makeService({ searchTeamMembers });

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.teamMembers.results).toEqual([
      { id: 'tm1', name: 'Ravi Kumar', designation: 'Bar Bender' },
    ]);
    expect(result.teamMembers.total).toBe(1);
  });

  it('maps a Payment candidate to its search result shape', async () => {
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

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.payments.results).toEqual([
      {
        id: 'pay1',
        teamMemberName: 'Ravi Kumar',
        payPeriod: 'Aug 2026',
        netPayable: 8000,
      },
    ]);
    expect(result.payments.total).toBe(1);
  });

  it('maps a Subcontractor candidate to its search result shape', async () => {
    const searchSubcontractors = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'sc1',
          name: 'Universal Waterproofing',
          contactPerson: 'Suresh',
          phone: '9988776655',
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchSubcontractors });

    const result = await service.search('universal', 'OWNER_ADMIN');

    expect(result.subcontractors.results).toEqual([
      {
        id: 'sc1',
        name: 'Universal Waterproofing',
        contactPerson: 'Suresh',
        phone: '9988776655',
      },
    ]);
    expect(result.subcontractors.total).toBe(1);
  });

  it('maps an RMC candidate to its search result shape', async () => {
    const searchRmc = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'rmc1',
          grade: 'M25',
          site: { name: 'NH-48 Widening' },
          vendor: { name: 'Balaji RMC' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchRmc });

    const result = await service.search('m25', 'OWNER_ADMIN');

    expect(result.rmc.results).toEqual([
      {
        id: 'rmc1',
        grade: 'M25',
        siteName: 'NH-48 Widening',
        vendorName: 'Balaji RMC',
      },
    ]);
    expect(result.rmc.total).toBe(1);
  });

  it('maps an Expense candidate to its search result shape', async () => {
    const searchExpenses = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'exp1',
          description: 'Site fuel',
          site: { name: 'NH-48 Widening' },
          amount: toNumber(2000),
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchExpenses });

    const result = await service.search('fuel', 'OWNER_ADMIN');

    expect(result.expenses.results).toEqual([
      {
        id: 'exp1',
        description: 'Site fuel',
        siteName: 'NH-48 Widening',
        amount: 2000,
      },
    ]);
    expect(result.expenses.total).toBe(1);
  });

  it('maps a Movement candidate to its search result shape', async () => {
    const searchMovements = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'mv1',
          materialSize: { material: { name: 'Cement' } },
          sourceSite: null,
          destinationSite: { name: 'NH-48 Widening' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchMovements });

    const result = await service.search('cement', 'OWNER_ADMIN');

    expect(result.movements.results).toEqual([
      {
        id: 'mv1',
        materialName: 'Cement',
        sourceSiteName: null,
        destinationSiteName: 'NH-48 Widening',
      },
    ]);
    expect(result.movements.total).toBe(1);
  });

  it('maps a Consumption candidate to its search result shape', async () => {
    const searchConsumption = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'cn1',
          materialSize: { material: { name: 'Cement' } },
          site: { name: 'NH-48 Widening' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchConsumption });

    const result = await service.search('cement', 'OWNER_ADMIN');

    expect(result.consumptions.results).toEqual([
      { id: 'cn1', materialName: 'Cement', siteName: 'NH-48 Widening' },
    ]);
    expect(result.consumptions.total).toBe(1);
  });

  it('maps a Waste Disposal candidate to its search result shape', async () => {
    const searchWasteDisposal = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'wd1',
          wasteType: 'Debris',
          site: { name: 'NH-48 Widening' },
          vendor: { name: 'Kumar Haulers' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchWasteDisposal });

    const result = await service.search('debris', 'OWNER_ADMIN');

    expect(result.wasteDisposals.results).toEqual([
      {
        id: 'wd1',
        wasteType: 'Debris',
        siteName: 'NH-48 Widening',
        vendorName: 'Kumar Haulers',
      },
    ]);
    expect(result.wasteDisposals.total).toBe(1);
  });

  it('maps a Return/Wastage candidate to its search result shape', async () => {
    const searchReturnWastage = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'rw1',
          kind: 'WASTAGE',
          materialSize: { material: { name: 'Cement' } },
          site: { name: 'NH-48 Widening' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchReturnWastage });

    const result = await service.search('cement', 'OWNER_ADMIN');

    expect(result.returnWastages.results).toEqual([
      {
        id: 'rw1',
        kind: 'WASTAGE',
        materialName: 'Cement',
        siteName: 'NH-48 Widening',
      },
    ]);
    expect(result.returnWastages.total).toBe(1);
  });

  it('maps an Advance candidate to its search result shape', async () => {
    const searchAdvances = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'adv1',
          teamMemberId: 'tm1',
          teamMember: { name: 'Ravi Kumar' },
          amount: toNumber(3000),
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchAdvances });

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.advances.results).toEqual([
      { id: 'adv1', teamMemberId: 'tm1', teamMemberName: 'Ravi Kumar', amount: 3000 },
    ]);
    expect(result.advances.total).toBe(1);
  });

  it('maps an Advance Adjustment candidate to its search result shape', async () => {
    const searchAdvanceAdjustments = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'adj1',
          advanceId: 'adv1',
          advance: { teamMemberId: 'tm1', teamMember: { name: 'Ravi Kumar' } },
          amount: toNumber(-500),
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchAdvanceAdjustments });

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.advanceAdjustments.results).toEqual([
      {
        id: 'adj1',
        teamMemberId: 'tm1',
        advanceId: 'adv1',
        teamMemberName: 'Ravi Kumar',
        amount: -500,
      },
    ]);
    expect(result.advanceAdjustments.total).toBe(1);
  });

  it('maps a Machinery candidate to its search result shape', async () => {
    const searchMachinery = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'mc1',
          name: 'JCB 3DX',
          assetNumber: 'MC-001',
          currentSite: { name: 'NH-48 Widening' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchMachinery });

    const result = await service.search('jcb', 'OWNER_ADMIN');

    expect(result.machinery.results).toEqual([
      {
        id: 'mc1',
        name: 'JCB 3DX',
        assetNumber: 'MC-001',
        currentSiteName: 'NH-48 Widening',
      },
    ]);
    expect(result.machinery.total).toBe(1);
  });

  it('maps a Vehicle candidate to its search result shape', async () => {
    const searchVehicles = vi.fn().mockResolvedValue({
      candidates: [
        { id: 'vh1', number: 'MH12AB1234', currentSite: null },
      ],
      total: 1,
    });
    const { service } = makeService({ searchVehicles });

    const result = await service.search('mh12', 'OWNER_ADMIN');

    expect(result.vehicles.results).toEqual([
      { id: 'vh1', number: 'MH12AB1234', currentSiteName: null },
    ]);
    expect(result.vehicles.total).toBe(1);
  });

  it('maps a Site Contract candidate to its search result shape', async () => {
    const searchSiteContracts = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'sct1',
          siteId: 's1',
          subcontractor: { name: 'Universal Waterproofing' },
          site: { name: 'NH-48 Widening' },
          status: 'ACTIVE',
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchSiteContracts });

    const result = await service.search('universal', 'OWNER_ADMIN');

    expect(result.siteContracts.results).toEqual([
      {
        id: 'sct1',
        siteId: 's1',
        subcontractorName: 'Universal Waterproofing',
        siteName: 'NH-48 Widening',
        status: 'ACTIVE',
      },
    ]);
    expect(result.siteContracts.total).toBe(1);
  });

  it('maps a Subcontractor Work Entry candidate to its search result shape', async () => {
    const searchWorkEntries = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'we1',
          siteContractId: 'sct1',
          siteContract: {
            siteId: 's1',
            subcontractor: { name: 'Universal Waterproofing' },
            site: { name: 'NH-48 Widening' },
          },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchWorkEntries });

    const result = await service.search('universal', 'OWNER_ADMIN');

    expect(result.workEntries.results).toEqual([
      {
        id: 'we1',
        siteId: 's1',
        siteContractId: 'sct1',
        subcontractorName: 'Universal Waterproofing',
        siteName: 'NH-48 Widening',
      },
    ]);
    expect(result.workEntries.total).toBe(1);
  });

  it('maps a Work Record candidate to its search result shape', async () => {
    const searchWorkRecords = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'wr1',
          teamMemberId: 'tm1',
          teamMember: { name: 'Ravi Kumar' },
          site: { name: 'NH-48 Widening' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchWorkRecords });

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.workRecords.results).toEqual([
      {
        id: 'wr1',
        teamMemberId: 'tm1',
        teamMemberName: 'Ravi Kumar',
        siteName: 'NH-48 Widening',
      },
    ]);
    expect(result.workRecords.total).toBe(1);
  });

  it('maps a Daily Report candidate to its search result shape', async () => {
    const searchDsr = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: 'dsr1',
          site: { name: 'NH-48 Widening' },
          submittedBy: { name: 'Ravi Kumar' },
        },
      ],
      total: 1,
    });
    const { service } = makeService({ searchDsr });

    const result = await service.search('ravi', 'OWNER_ADMIN');

    expect(result.dailyReports.results).toEqual([
      {
        id: 'dsr1',
        siteName: 'NH-48 Widening',
        submittedByName: 'Ravi Kumar',
      },
    ]);
    expect(result.dailyReports.total).toBe(1);
  });

  describe('role-gated groups (Story 16.5/16.6): Subcontractor Payment and Audit Log', () => {
    it('excludes Subcontractor Payment and Audit Log results, without even querying, for a SITE_SUPERVISOR', async () => {
      const searchSubcontractorPayments = vi.fn().mockResolvedValue({
        candidates: [{ id: 'sp1' }],
        total: 1,
      });
      const searchAudit = vi.fn().mockResolvedValue({
        candidates: [{ id: 'al1' }],
        total: 1,
      });
      const { service } = makeService({
        searchSubcontractorPayments,
        searchAudit,
      });

      const result = await service.search('payment', 'SITE_SUPERVISOR');

      expect(searchSubcontractorPayments).not.toHaveBeenCalled();
      expect(searchAudit).not.toHaveBeenCalled();
      expect(result.subcontractorPayments).toEqual({ results: [], total: 0 });
      expect(result.auditLogs).toEqual({ results: [], total: 0 });
    });

    it('includes Subcontractor Payment and Audit Log results for an OWNER_ADMIN', async () => {
      const searchSubcontractorPayments = vi.fn().mockResolvedValue({
        candidates: [
          {
            id: 'sp1',
            siteContractId: 'sct1',
            siteContract: {
              siteId: 's1',
              subcontractor: { name: 'Universal Waterproofing' },
              site: { name: 'NH-48 Widening' },
            },
            note: null,
            amount: toNumber(10000),
          },
        ],
        total: 1,
      });
      const searchAudit = vi.fn().mockResolvedValue({
        candidates: [
          {
            id: 'al1',
            action: 'Recorded Payment',
            entityType: 'Payment',
            user: { name: 'Owner Admin' },
          },
        ],
        total: 1,
      });
      const { service } = makeService({
        searchSubcontractorPayments,
        searchAudit,
      });

      const result = await service.search('universal', 'OWNER_ADMIN');

      expect(searchSubcontractorPayments).toHaveBeenCalledWith('universal');
      expect(searchAudit).toHaveBeenCalledWith('universal');
      expect(result.subcontractorPayments.results).toEqual([
        {
          id: 'sp1',
          siteId: 's1',
          siteContractId: 'sct1',
          subcontractorName: 'Universal Waterproofing',
          siteName: 'NH-48 Widening',
          amount: 10000,
        },
      ]);
      expect(result.auditLogs.results).toEqual([
        { id: 'al1', action: 'Recorded Payment', userName: 'Owner Admin' },
      ]);
    });
  });
});
