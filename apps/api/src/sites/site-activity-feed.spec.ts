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
});
