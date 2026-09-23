import { describe, expect, it, vi } from 'vitest';
import { getSiteSubcontractorGap } from './site-subcontractor-gap';
import type { PrismaService } from '../prisma/prisma.service';

// getSiteSubcontractorGap first calls supersededDsrIds(), which itself calls
// dailySiteReport.findMany() once for correction rows — a second, distinct
// findMany call is then the Site-scoped report query. Chaining
// mockResolvedValueOnce keeps each test's two calls independently mockable,
// matching the convention dsr.service.spec.ts uses for the same helper.
function makePrisma(options: {
  correctionRows?: { correctsId: string | null }[];
  reports?: { subcontractorEntries: unknown }[];
  siteContracts?: { subcontractorId: string }[];
}) {
  const dsrFindMany = vi
    .fn()
    .mockResolvedValueOnce(options.correctionRows ?? [])
    .mockResolvedValueOnce(options.reports ?? []);
  const siteContractFindMany = vi
    .fn()
    .mockResolvedValue(options.siteContracts ?? []);
  const prisma = {
    dailySiteReport: { findMany: dsrFindMany },
    siteContract: { findMany: siteContractFindMany },
  } as unknown as PrismaService;
  return { prisma, dsrFindMany, siteContractFindMany };
}

describe('getSiteSubcontractorGap', () => {
  it('returns a zero count when the Site has no submitted DSRs', async () => {
    const { prisma, siteContractFindMany } = makePrisma({ reports: [] });

    const result = await getSiteSubcontractorGap(prisma, 'site-1');

    expect(result).toEqual({ count: 0, subcontractorIds: [] });
    // No Subcontractor names logged means there's nothing to check against
    // SiteContract — the query is skipped entirely.
    expect(siteContractFindMany).not.toHaveBeenCalled();
  });

  it('counts a Subcontractor logged via a DSR with zero SiteContract rows at this Site', async () => {
    const { prisma } = makePrisma({
      reports: [{ subcontractorEntries: [{ subcontractorId: 'sub-1' }] }],
      siteContracts: [],
    });

    const result = await getSiteSubcontractorGap(prisma, 'site-1');

    expect(result).toEqual({ count: 1, subcontractorIds: ['sub-1'] });
  });

  it('excludes a Subcontractor that already has a SiteContract at this Site', async () => {
    const { prisma } = makePrisma({
      reports: [{ subcontractorEntries: [{ subcontractorId: 'sub-1' }] }],
      siteContracts: [{ subcontractorId: 'sub-1' }],
    });

    const result = await getSiteSubcontractorGap(prisma, 'site-1');

    expect(result).toEqual({ count: 0, subcontractorIds: [] });
  });

  it('still counts a Subcontractor whose only SiteContract is at a different Site (Site-scoped, not global)', async () => {
    // The siteContract.findMany mock is itself scoped by the `where: {
    // siteId }` this function always passes — a Subcontractor's contract at
    // another Site never appears in that result set, so it never suppresses
    // the gap here.
    const { prisma, siteContractFindMany } = makePrisma({
      reports: [{ subcontractorEntries: [{ subcontractorId: 'sub-1' }] }],
      siteContracts: [],
    });

    const result = await getSiteSubcontractorGap(prisma, 'site-1');

    expect(siteContractFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 'site-1', subcontractorId: { in: ['sub-1'] } },
      }),
    );
    expect(result).toEqual({ count: 1, subcontractorIds: ['sub-1'] });
  });

  it('counts multiple distinct gap Subcontractors, deduplicated across multiple DSRs', async () => {
    const { prisma } = makePrisma({
      reports: [
        {
          subcontractorEntries: [
            { subcontractorId: 'sub-1' },
            { subcontractorId: 'sub-2' },
          ],
        },
        {
          subcontractorEntries: [
            { subcontractorId: 'sub-1' },
            { subcontractorId: 'sub-3' },
          ],
        },
      ],
      siteContracts: [{ subcontractorId: 'sub-2' }],
    });

    const result = await getSiteSubcontractorGap(prisma, 'site-1');

    expect(result.count).toBe(2);
    expect(result.subcontractorIds.sort()).toEqual(['sub-1', 'sub-3']);
  });

  it('excludes a superseded (corrected-over) DSR from the gap computation', async () => {
    const { prisma, dsrFindMany } = makePrisma({
      correctionRows: [{ correctsId: 'dsr-original' }],
      reports: [{ subcontractorEntries: [{ subcontractorId: 'sub-1' }] }],
    });

    await getSiteSubcontractorGap(prisma, 'site-1');

    expect(dsrFindMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          siteId: 'site-1',
          status: 'SUBMITTED',
          id: { notIn: ['dsr-original'] },
        },
      }),
    );
  });

  it('reads defensively: a malformed/missing subcontractorEntries never throws', async () => {
    const { prisma } = makePrisma({
      reports: [
        { subcontractorEntries: null },
        { subcontractorEntries: [{ workNote: 'no id here' }] },
        { subcontractorEntries: 'not-an-array' },
      ],
    });

    await expect(getSiteSubcontractorGap(prisma, 'site-1')).resolves.toEqual({
      count: 0,
      subcontractorIds: [],
    });
  });
});
