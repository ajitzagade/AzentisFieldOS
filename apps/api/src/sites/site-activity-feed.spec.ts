import { describe, expect, it, vi } from 'vitest';
import { getSiteActivityFeed } from './site-activity-feed';
import type { PrismaService } from '../prisma/prisma.service';

function decimal(value: number) {
  return { toNumber: () => value };
}

function emptyFindMany() {
  return vi.fn().mockResolvedValue([]);
}

describe('getSiteActivityFeed', () => {
  it("merges mixed record types into one feed, sorted newest first by each record's own business date", async () => {
    const prisma = {
      purchase: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'purchase-1',
            purchasedAt: new Date('2026-08-10T09:00:00Z'),
            quantity: 40,
            totalAmount: decimal(12000),
            materialSize: { label: '50kg', material: { name: 'Cement' } },
            vendor: { name: 'ABC Suppliers' },
          },
        ]),
      },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'expense-1',
            incurredAt: new Date('2026-08-12T18:00:00Z'),
            amount: decimal(4200),
            description: 'Diesel refill',
            category: { name: 'Fuel' },
          },
        ]),
      },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'dsr-1',
            reportDate: new Date('2026-08-11T00:00:00Z'),
            workCompleted: 'RCC pour completed',
            submittedBy: { name: 'Ramesh Yadav' },
            photos: [{ id: 'p1' }, { id: 'p2' }],
          },
        ]),
      },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
      siteContract: { findMany: emptyFindMany() },
      subcontractorWorkEntry: { findMany: emptyFindMany() },
      subcontractorPayment: { findMany: emptyFindMany() },
    } as any as PrismaService;

    const feed = await getSiteActivityFeed(prisma, 'site-1');

    expect(feed).toHaveLength(3);
    // Newest first: expense (Aug 12) > dsr (Aug 11) > purchase (Aug 10).
    expect(feed.map((item) => item.type)).toEqual([
      'EXPENSE',
      'DSR',
      'PURCHASE',
    ]);
    expect(feed[0]).toMatchObject({
      id: 'expense-1',
      amount: 4200,
      summary: 'Diesel refill',
    });
    expect(feed[1]).toMatchObject({ id: 'dsr-1', amount: null });
    expect(feed[1]?.summary).toContain('2 photos');
    expect(feed[2]).toMatchObject({ id: 'purchase-1', amount: 12000 });
    expect(feed[2]?.summary).toContain('Cement');
  });

  it('returns an empty feed when a Site has zero linked records of any type', async () => {
    const prisma = {
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: { findMany: emptyFindMany() },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
      siteContract: { findMany: emptyFindMany() },
      subcontractorWorkEntry: { findMany: emptyFindMany() },
      subcontractorPayment: { findMany: emptyFindMany() },
    } as any as PrismaService;

    const feed = await getSiteActivityFeed(prisma, 'site-empty');

    expect(feed).toEqual([]);
  });

  it('queries Movement by both source and destination siteId (a Site can appear on either side)', async () => {
    const movementFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: movementFindMany },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: { findMany: emptyFindMany() },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
      siteContract: { findMany: emptyFindMany() },
      subcontractorWorkEntry: { findMany: emptyFindMany() },
      subcontractorPayment: { findMany: emptyFindMany() },
    } as any as PrismaService;

    await getSiteActivityFeed(prisma, 'site-1');

    expect(movementFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ sourceSiteId: 'site-1' }, { destinationSiteId: 'site-1' }],
        },
      }),
    );
  });

  it('excludes DRAFT reports from the activity feed — the DSR query filters status:SUBMITTED (spec-dsr-drafts)', async () => {
    const dsrFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: { findMany: dsrFindMany },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
      siteContract: { findMany: emptyFindMany() },
      subcontractorWorkEntry: { findMany: emptyFindMany() },
      subcontractorPayment: { findMany: emptyFindMany() },
    } as unknown as PrismaService;

    await getSiteActivityFeed(prisma, 'site-1');

    // A private DRAFT (and its photos) must never appear in the feed. Fails if
    // the draft filter is dropped.
    expect(dsrFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SUBMITTED' }) as object,
      }),
    );
  });

  // Goal 1 (nullable pricing): a pricing-pending RMC delivery or Waste
  // Material trip has totalAmount: null — the feed must show it as
  // amount-less (never a thrown error, never a fabricated ₹0).
  it('maps a pricing-pending RMC delivery and Waste Material trip to a null FeedItem.amount, without throwing', async () => {
    const rmcFindMany = vi.fn().mockResolvedValue([
      {
        id: 'rmc-priced',
        deliveredAt: new Date('2026-08-14T09:00:00Z'),
        quantityM3: { toString: () => '20' },
        grade: 'M25',
        totalAmount: decimal(124000),
        vendor: { name: 'Anand RMC Suppliers' },
      },
      {
        id: 'rmc-pending',
        deliveredAt: new Date('2026-08-13T09:00:00Z'),
        quantityM3: { toString: () => '10' },
        grade: 'M25',
        totalAmount: null,
        vendor: { name: 'Anand RMC Suppliers' },
      },
    ]);
    const wasteDisposalFindMany = vi.fn().mockResolvedValue([
      {
        id: 'wd-priced',
        disposedAt: new Date('2026-08-14T10:00:00Z'),
        wasteType: 'Debris',
        tripCount: 4,
        vendor: { name: 'Balaji Transport' },
        disposalLocation: null,
        totalAmount: decimal(3000),
      },
      {
        id: 'wd-pending',
        disposedAt: new Date('2026-08-13T10:00:00Z'),
        wasteType: 'Debris',
        tripCount: 2,
        vendor: { name: 'Balaji Transport' },
        disposalLocation: null,
        totalAmount: null,
      },
    ]);
    const prisma = {
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: rmcFindMany },
      dailySiteReport: { findMany: emptyFindMany() },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: wasteDisposalFindMany },
      siteContract: { findMany: emptyFindMany() },
      subcontractorWorkEntry: { findMany: emptyFindMany() },
      subcontractorPayment: { findMany: emptyFindMany() },
    } as any as PrismaService;

    const feed = await getSiteActivityFeed(prisma, 'site-1');

    expect(feed).toHaveLength(4);
    const byId = Object.fromEntries(feed.map((item) => [item.id, item]));
    expect(byId['rmc-priced']).toMatchObject({ amount: 124000 });
    expect(byId['rmc-pending']).toMatchObject({ amount: null });
    expect(byId['wd-priced']).toMatchObject({ amount: 3000 });
    expect(byId['wd-pending']).toMatchObject({ amount: null });
  });

  it('includes Site Contract, Work Entry, and Subcontractor Payment events (Epic 18), filtered via the SiteContract relation', async () => {
    const siteContractFindMany = vi.fn().mockResolvedValue([
      {
        id: 'sc-1',
        createdAt: new Date('2026-09-01T09:00:00Z'),
        updatedAt: new Date('2026-09-01T09:00:00Z'),
        workCategory: 'Storm-water pipe laying',
        status: 'DRAFT',
        subcontractor: { name: 'Ganesh Pipeline Works' },
      },
    ]);
    const workEntryFindMany = vi.fn().mockResolvedValue([
      {
        id: 'we-1',
        workDate: new Date('2026-09-03T00:00:00Z'),
        quantity: { toString: () => '260' },
        siteContract: {
          workCategory: 'Storm-water pipe laying',
          rateType: 'PER_PIPE',
          rateUnitLabel: null,
          subcontractor: { name: 'Ganesh Pipeline Works' },
        },
      },
    ]);
    const paymentFindMany = vi.fn().mockResolvedValue([
      {
        id: 'p-1',
        paidAt: new Date('2026-09-02T00:00:00Z'),
        type: 'PAYMENT',
        amount: decimal(30000),
        siteContract: {
          workCategory: 'Storm-water pipe laying',
          subcontractor: { name: 'Ganesh Pipeline Works' },
        },
      },
    ]);
    const prisma = {
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: { findMany: emptyFindMany() },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
      siteContract: { findMany: siteContractFindMany },
      subcontractorWorkEntry: { findMany: workEntryFindMany },
      subcontractorPayment: { findMany: paymentFindMany },
    } as any as PrismaService;

    const feed = await getSiteActivityFeed(prisma, 'site-1');

    expect(workEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteContract: { siteId: 'site-1' } }),
      }),
    );
    expect(paymentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteContract: { siteId: 'site-1' } }),
      }),
    );
    expect(siteContractFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({ siteId: 'site-1' }),
      }),
    );
    expect(feed).toHaveLength(3);
    // Newest first: Work Entry (Sep 3) > Payment (Sep 2) > Site Contract (Sep 1).
    expect(feed.map((item) => item.type)).toEqual([
      'WORK_ENTRY',
      'SUBCONTRACTOR_PAYMENT',
      'SITE_CONTRACT',
    ]);
    expect(feed[0]).toMatchObject({ id: 'we-1', amount: null });
    expect(feed[0]?.summary).toContain('Ganesh Pipeline Works');
    expect(feed[0]?.summary).toContain('260 pipes');
    expect(feed[1]).toMatchObject({ id: 'p-1', amount: 30000 });
    expect(feed[2]).toMatchObject({ id: 'sc-1', amount: null });
    // Enum is humanized, never rendered raw/uppercase to the user.
    expect(feed[2]?.summary).toContain('draft');
    expect(feed[2]?.summary).not.toContain('DRAFT');
  });
});
