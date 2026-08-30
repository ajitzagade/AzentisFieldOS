import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateWasteDisposalInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { WasteDisposalService } from './waste-disposal.service';

function makeService() {
  const prisma = {
    wasteDisposal: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  };
  const service = new WasteDisposalService(prisma as never);
  return { service, prisma };
}

const HIRED_INPUT: CreateWasteDisposalInput = {
  siteId: '00000000-0000-7000-8000-000000000001',
  wasteType: 'Debris',
  ownership: 'HIRED',
  vendorId: '00000000-0000-7000-8000-000000000002',
  tripCount: 6,
  ratePerTrip: 450,
  otherCharges: 300,
  paymentStatus: 'UNPAID',
  disposedAt: new Date('2026-08-30'),
};

let ctx: ReturnType<typeof makeService>;
beforeEach(() => {
  ctx = makeService();
  ctx.prisma.wasteDisposal.create.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) => Promise.resolve(data),
  );
});

describe('WasteDisposalService.create', () => {
  it('computes totalAmount server-side: trips × rate + other charges', async () => {
    await ctx.service.create(HIRED_INPUT, 'user-1');

    const { data } = ctx.prisma.wasteDisposal.create.mock.calls[0]![0] as {
      data: { totalAmount: Prisma.Decimal; recordedByUserId: string };
    };
    // 6 × 450 + 300 = 3000
    expect(data.totalAmount.toNumber()).toBe(3000);
    // Attribution comes from the session argument, never the body.
    expect(data.recordedByUserId).toBe('user-1');
  });

  it('defaults otherCharges to 0 when omitted', async () => {
    const rest: CreateWasteDisposalInput = { ...HIRED_INPUT };
    delete rest.otherCharges;
    await ctx.service.create(rest, 'user-1');

    const { data } = ctx.prisma.wasteDisposal.create.mock.calls[0]![0] as {
      data: { totalAmount: Prisma.Decimal; otherCharges: number };
    };
    expect(data.totalAmount.toNumber()).toBe(2700); // 6 × 450
    expect(data.otherCharges).toBe(0);
  });

  it('a signed correction produces a signed totalAmount delta (Story 5.1 rule)', async () => {
    ctx.prisma.wasteDisposal.findUnique.mockResolvedValue({
      id: 'wd-1',
      siteId: HIRED_INPUT.siteId,
      wasteType: 'Debris',
      ownership: 'HIRED',
      vendorId: HIRED_INPUT.vendorId,
      ratePerTrip: new Prisma.Decimal(450),
    });

    await ctx.service.create(
      {
        ...HIRED_INPUT,
        tripCount: -2,
        otherCharges: 0,
        correctsId: 'wd-1',
        reason: 'Two trips were double-counted',
      },
      'user-1',
    );

    const { data } = ctx.prisma.wasteDisposal.create.mock.calls[0]![0] as {
      data: { totalAmount: Prisma.Decimal };
    };
    expect(data.totalAmount.toNumber()).toBe(-900); // -2 × 450
  });

  it('rejects a correction whose original does not exist', async () => {
    await expect(
      ctx.service.create(
        { ...HIRED_INPUT, correctsId: HIRED_INPUT.siteId, reason: 'x' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a correction whose rate/party/Site diverge from the original', async () => {
    ctx.prisma.wasteDisposal.findUnique.mockResolvedValue({
      id: 'wd-1',
      siteId: HIRED_INPUT.siteId,
      wasteType: 'Debris',
      ownership: 'HIRED',
      vendorId: HIRED_INPUT.vendorId,
      ratePerTrip: new Prisma.Decimal(500), // original rate differs
    });

    await expect(
      ctx.service.create(
        { ...HIRED_INPUT, tripCount: -1, correctsId: 'wd-1', reason: 'x' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('WasteDisposalService.summary', () => {
  it('totals cost/trips with own-vs-hired split and vendor/waste-type/Site breakdowns', async () => {
    const site1 = { id: 'site-1', name: 'NH-48' };
    const site2 = { id: 'site-2', name: 'Bypass' };
    const vendor = { id: 'v-1', name: 'Balaji Transport' };
    ctx.prisma.wasteDisposal.findMany.mockResolvedValue([
      {
        site: site1,
        vendor,
        ownership: 'HIRED',
        wasteType: 'Debris',
        tripCount: 6,
        totalAmount: new Prisma.Decimal(3000),
      },
      {
        site: site1,
        vendor: null,
        ownership: 'OWN',
        wasteType: 'Excavated earth',
        tripCount: 4,
        totalAmount: new Prisma.Decimal(800),
      },
      {
        site: site2,
        vendor,
        ownership: 'HIRED',
        wasteType: 'Debris',
        tripCount: 2,
        totalAmount: new Prisma.Decimal(1000),
      },
    ]);

    const summary = await ctx.service.summary({});

    expect(summary.totalCost).toBe(4800);
    expect(summary.totalTrips).toBe(12);
    expect(summary.own).toEqual({ cost: 800, trips: 4 });
    expect(summary.hired).toEqual({ cost: 4000, trips: 8 });
    expect(summary.byVendor).toEqual([
      { vendorId: 'v-1', name: 'Balaji Transport', cost: 4000, trips: 8 },
    ]);
    expect(summary.byWasteType).toEqual([
      { wasteType: 'Debris', cost: 4000, trips: 8 },
      { wasteType: 'Excavated earth', cost: 800, trips: 4 },
    ]);
    expect(summary.bySite).toEqual([
      { siteId: 'site-1', name: 'NH-48', cost: 3800, trips: 10 },
      { siteId: 'site-2', name: 'Bypass', cost: 1000, trips: 2 },
    ]);
  });

  it('threads Site/vendor/date filters into the query where-clause', async () => {
    await ctx.service.summary({
      siteId: 's-1',
      vendorId: 'v-1',
      from: '2026-08-01',
      to: '2026-08-31',
    });

    const { where } = ctx.prisma.wasteDisposal.findMany.mock.calls[0]![0] as {
      where: {
        siteId: string;
        vendorId: string;
        disposedAt: { gte: Date; lt: Date };
      };
    };
    expect(where.siteId).toBe('s-1');
    expect(where.vendorId).toBe('v-1');
    expect(where.disposedAt.gte).toEqual(new Date('2026-08-01'));
    expect(where.disposedAt.lt.getTime()).toBeGreaterThan(
      where.disposedAt.gte.getTime(),
    );
  });
});

describe('WasteDisposalService.findOne', () => {
  it('404s for an unknown id', async () => {
    await expect(ctx.service.findOne('ghost')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
