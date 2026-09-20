import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateWasteDisposalInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { WasteDisposalService } from './waste-disposal.service';

function makeService() {
  const wasteDisposal = {
    create: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
  };
  const vendorAdvance = {
    create: vi.fn(),
    groupBy: vi.fn().mockResolvedValue([]),
  };
  const tx = { wasteDisposal, vendorAdvance };
  const prisma = {
    wasteDisposal,
    vendorAdvance,
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
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

  // Matrix Test Audit (client-readiness batch, goal 1): a HIRED disposal
  // with no rate yet (pricing pending) must store totalAmount AND
  // paymentStatus as null (all-or-none, D7 pattern) — never thrown, never
  // NaN, never a stray default paymentStatus.
  it('a HIRED disposal with ratePerTrip omitted stores totalAmount and paymentStatus as null', async () => {
    const rest: CreateWasteDisposalInput = { ...HIRED_INPUT };
    delete rest.ratePerTrip;
    delete rest.paymentStatus;

    await ctx.service.create(rest, 'user-1');

    const { data } = ctx.prisma.wasteDisposal.create.mock.calls[0]![0] as {
      data: {
        totalAmount: Prisma.Decimal | null;
        paymentStatus: string | null;
      };
    };
    expect(data.totalAmount).toBeNull();
    expect(data.paymentStatus).toBeNull();
  });

  // Feature (2026-09-06): an advance to a hired disposal's Vendor is a
  // separate VendorAdvance row, written in the same transaction.
  describe('advance to the hired Vendor', () => {
    it('creates a linked VendorAdvance when advance is given, dated the same as the disposal', async () => {
      ctx.prisma.wasteDisposal.create.mockResolvedValue({
        id: 'wd-1',
        vendorId: HIRED_INPUT.vendorId,
        disposedAt: HIRED_INPUT.disposedAt,
      });

      await ctx.service.create(
        { ...HIRED_INPUT, advance: { amount: 2000, paymentMethod: 'Cash' } },
        'user-1',
      );

      expect(ctx.prisma.vendorAdvance.create).toHaveBeenCalledWith({
        data: {
          vendorId: HIRED_INPUT.vendorId,
          wasteDisposalId: 'wd-1',
          amount: 2000,
          paymentMethod: 'Cash',
          givenAt: HIRED_INPUT.disposedAt,
        },
      });
    });

    it('creates no VendorAdvance when none is given', async () => {
      await ctx.service.create(HIRED_INPUT, 'user-1');

      expect(ctx.prisma.vendorAdvance.create).not.toHaveBeenCalled();
    });
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

  // Goal 1 (nullable pricing): a HIRED trip recorded before pricing is
  // known has totalAmount: null — it must contribute 0 to every cost
  // aggregate, never throw on the `?.toNumber()` call.
  it('excludes a pricing-pending HIRED row (totalAmount: null) from cost aggregates without throwing', async () => {
    const site1 = { id: 'site-1', name: 'NH-48' };
    const vendor = { id: 'v-1', name: 'Balaji Transport' };
    ctx.prisma.wasteDisposal.findMany.mockResolvedValue([
      {
        site: site1,
        vendor,
        ownership: 'HIRED',
        wasteType: 'Debris',
        tripCount: 3,
        totalAmount: null,
      },
      {
        site: site1,
        vendor,
        ownership: 'HIRED',
        wasteType: 'Debris',
        tripCount: 6,
        totalAmount: new Prisma.Decimal(3000),
      },
    ]);

    const summary = await ctx.service.summary({});

    expect(summary.totalCost).toBe(3000);
    expect(summary.totalTrips).toBe(9);
    expect(summary.hired).toEqual({ cost: 3000, trips: 9 });
    expect(summary.byVendor).toEqual([
      { vendorId: 'v-1', name: 'Balaji Transport', cost: 3000, trips: 9 },
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

// Feature (2026-09-19): list rows carry the trip's settlement position —
// advances already handed to the Vendor and what is still pending — so no
// screen has to detour to the Vendor page for that answer.
describe('WasteDisposalService.list — advance/pending settlement figures', () => {
  const hiredRoot = {
    id: 'wd-1',
    correctsId: null,
    vendorId: 'v-1',
    ownership: 'HIRED',
    totalAmount: new Prisma.Decimal(3000),
    paymentStatus: 'UNPAID',
    createdAt: new Date('2026-09-01'),
  };

  type SettledRow = {
    id: string;
    advanceTotal: Prisma.Decimal | null;
    pendingAmount: Prisma.Decimal | null;
  };

  it('attaches advanceTotal and pendingAmount = bill − advances on a HIRED root', async () => {
    ctx.prisma.wasteDisposal.findMany.mockResolvedValueOnce([hiredRoot]);
    ctx.prisma.vendorAdvance.groupBy.mockResolvedValue([
      { wasteDisposalId: 'wd-1', _sum: { amount: new Prisma.Decimal(1000) } },
    ]);

    const rows = (await ctx.service.list()) as SettledRow[];

    expect(rows[0]!.advanceTotal!.toNumber()).toBe(1000);
    expect(rows[0]!.pendingAmount!.toNumber()).toBe(2000);
  });

  it('a HIRED root with no advances pends its full bill', async () => {
    ctx.prisma.wasteDisposal.findMany.mockResolvedValueOnce([hiredRoot]);

    const rows = (await ctx.service.list()) as SettledRow[];

    expect(rows[0]!.advanceTotal!.toNumber()).toBe(0);
    expect(rows[0]!.pendingAmount!.toNumber()).toBe(3000);
  });

  // Matrix Test Audit (client-readiness batch, goal 1/row 3): a HIRED root
  // whose rate was never given (totalAmount null, pricing pending) must not
  // throw inside withSettlement()'s .add()/.sub() arithmetic — it should be
  // treated as a 0 contribution to the net bill, with pendingAmount still a
  // real, null-safe figure.
  it('a HIRED root with totalAmount null (pricing pending) does not throw and pends only the advance-relative figure', async () => {
    ctx.prisma.wasteDisposal.findMany.mockResolvedValueOnce([
      { ...hiredRoot, totalAmount: null, paymentStatus: null },
    ]);
    ctx.prisma.vendorAdvance.groupBy.mockResolvedValue([
      { wasteDisposalId: 'wd-1', _sum: { amount: new Prisma.Decimal(500) } },
    ]);

    const rows = (await ctx.service.list()) as SettledRow[];

    expect(rows[0]!.advanceTotal!.toNumber()).toBe(500);
    // Net bill treated as 0 (unpriced) minus the 500 already advanced.
    expect(rows[0]!.pendingAmount!.toNumber()).toBe(-500);
  });

  it('OWN rows have no settlement position (nulls, and no advance query at all)', async () => {
    ctx.prisma.wasteDisposal.findMany.mockResolvedValueOnce([
      {
        ...hiredRoot,
        id: 'wd-own',
        vendorId: null,
        ownership: 'OWN',
        paymentStatus: null,
      },
    ]);

    const rows = (await ctx.service.list()) as SettledRow[];

    expect(rows[0]!.advanceTotal).toBeNull();
    expect(rows[0]!.pendingAmount).toBeNull();
    expect(ctx.prisma.vendorAdvance.groupBy).not.toHaveBeenCalled();
  });

  it('folds a signed correction delta into the root pending; the correction row itself gets nulls', async () => {
    const correction = {
      ...hiredRoot,
      id: 'wd-2',
      correctsId: 'wd-1',
      totalAmount: new Prisma.Decimal(-900),
      paymentStatus: null,
      createdAt: new Date('2026-09-02'),
    };
    ctx.prisma.wasteDisposal.findMany
      .mockResolvedValueOnce([hiredRoot, correction]) // the list query
      .mockResolvedValueOnce([correction]); // correction-chain walk, then default []
    ctx.prisma.vendorAdvance.groupBy.mockResolvedValue([
      { wasteDisposalId: 'wd-1', _sum: { amount: new Prisma.Decimal(1000) } },
    ]);

    const rows = (await ctx.service.list()) as SettledRow[];

    const root = rows.find((r) => r.id === 'wd-1')!;
    expect(root.pendingAmount!.toNumber()).toBe(1100); // 3000 − 900 − 1000
    const correctionRow = rows.find((r) => r.id === 'wd-2')!;
    expect(correctionRow.advanceTotal).toBeNull();
    expect(correctionRow.pendingAmount).toBeNull();
  });

  it('a later correction carrying PAID zeroes the pending (the correction form is how UNPAID becomes PAID)', async () => {
    const paidCorrection = {
      ...hiredRoot,
      id: 'wd-2',
      correctsId: 'wd-1',
      totalAmount: new Prisma.Decimal(0),
      paymentStatus: 'PAID',
      createdAt: new Date('2026-09-02'),
    };
    ctx.prisma.wasteDisposal.findMany
      .mockResolvedValueOnce([hiredRoot])
      .mockResolvedValueOnce([paidCorrection]);
    ctx.prisma.vendorAdvance.groupBy.mockResolvedValue([
      { wasteDisposalId: 'wd-1', _sum: { amount: new Prisma.Decimal(1000) } },
    ]);

    const rows = (await ctx.service.list()) as SettledRow[];

    expect(rows[0]!.pendingAmount!.toNumber()).toBe(0);
  });
});

describe('WasteDisposalService.findOne', () => {
  it('404s for an unknown id', async () => {
    await expect(ctx.service.findOne('ghost')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('carries the same settlement figures the list computes', async () => {
    ctx.prisma.wasteDisposal.findUnique.mockResolvedValue({
      id: 'wd-1',
      correctsId: null,
      vendorId: 'v-1',
      ownership: 'HIRED',
      totalAmount: new Prisma.Decimal(3000),
      paymentStatus: 'UNPAID',
      createdAt: new Date('2026-09-01'),
    });
    ctx.prisma.vendorAdvance.groupBy.mockResolvedValue([
      { wasteDisposalId: 'wd-1', _sum: { amount: new Prisma.Decimal(500) } },
    ]);

    const disposal = await ctx.service.findOne('wd-1');

    expect(disposal.advanceTotal!.toNumber()).toBe(500);
    expect(disposal.pendingAmount!.toNumber()).toBe(2500);
  });
});

describe('WasteDisposalService.searchCandidates', () => {
  it('matches the linked Site/Vendor name, the waste type, and free-text notes, all case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { wasteDisposal: { findMany, count } };
    const service = new WasteDisposalService(prisma as never);

    await service.searchCandidates('debris');

    const expectedWhere = {
      OR: [
        { site: { name: { contains: 'debris', mode: 'insensitive' } } },
        { vendor: { name: { contains: 'debris', mode: 'insensitive' } } },
        { wasteType: { contains: 'debris', mode: 'insensitive' } },
        { notes: { contains: 'debris', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
