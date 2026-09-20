import { describe, expect, it, vi } from 'vitest';
import { PaymentsOverviewService } from './payments-overview.service';

const SOURCES = [
  'payment',
  'advance',
  'subcontractorPayment',
  'purchase',
  'wasteDisposal',
  'vendorAdvance',
  'expense',
  'rmcEntry',
] as const;
type Source = (typeof SOURCES)[number];

function makePrisma(
  overrides: Partial<
    Record<Source, unknown[]> & Record<`${Source}Count`, number>
  > = {},
  aggregates: Partial<Record<Source, unknown[]>> = {},
) {
  const prisma = {} as Record<
    Source,
    {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    }
  >;
  for (const source of SOURCES) {
    // summary() calls aggregate more than once for payment/purchase/
    // wasteDisposal (paid vs owed buckets) — mockResolvedValueOnce chains
    // in call order, falling back to a zero sum.
    const aggregate = vi.fn().mockResolvedValue({ _sum: {} });
    for (const value of aggregates[source] ?? []) {
      aggregate.mockResolvedValueOnce(value);
    }
    prisma[source] = {
      findMany: vi.fn().mockResolvedValue(overrides[source] ?? []),
      count: vi.fn().mockResolvedValue(overrides[`${source}Count`] ?? 0),
      aggregate,
    };
  }
  return prisma;
}

function makeService(prisma: ReturnType<typeof makePrisma>) {
  return new PaymentsOverviewService(
    prisma as unknown as ConstructorParameters<
      typeof PaymentsOverviewService
    >[0],
  );
}

const paymentRow = (id: string, createdAt: string, status = 'paid') => ({
  id,
  createdAt: new Date(createdAt),
  netPayable: 5000,
  payPeriod: '1-15 Aug',
  status,
  correctsId: null,
  teamMember: { id: 'tm1', name: 'Ravi' },
});

const purchaseRow = (
  id: string,
  purchasedAt: string,
  extra: Partial<{
    totalAmount: number | null;
    paymentStatus: string | null;
    correctsId: string | null;
  }> = {},
) => ({
  id,
  purchasedAt: new Date(purchasedAt),
  totalAmount: 12000,
  paymentStatus: 'UNPAID',
  correctsId: null,
  vendor: { name: 'Balaji Traders' },
  site: { name: 'Site A' },
  materialSize: { material: { name: 'Cement' } },
  ...extra,
});

const expenseRow = (id: string, incurredAt: string) => ({
  id,
  incurredAt: new Date(incurredAt),
  amount: 800,
  personOrVendor: 'Tea stall',
  correctsId: null,
  site: { name: 'Site A' },
  category: { name: 'Food' },
});

describe('PaymentsOverviewService.list', () => {
  it('merges every source sorted by date descending with an honest combined total', async () => {
    const prisma = makePrisma({
      payment: [paymentRow('pay1', '2026-09-10')],
      purchase: [purchaseRow('pur1', '2026-09-12')],
      expense: [expenseRow('e1', '2026-09-11')],
      paymentCount: 1,
      purchaseCount: 1,
      expenseCount: 1,
    });
    const service = makeService(prisma);

    const result = await service.list({ page: '1', pageSize: '25' });

    expect(result.rows.map((r) => `${r.kind}:${r.id}`)).toEqual([
      'PURCHASE:pur1',
      'EXPENSE:e1',
      'EMPLOYEE_PAYMENT:pay1',
    ]);
    expect(result.total).toBe(3);
  });

  it('normalizes each source status: paid/pending Payments, Purchase paymentStatus, inherently-paid Expenses', async () => {
    const prisma = makePrisma({
      payment: [
        paymentRow('pay1', '2026-09-10', 'paid'),
        paymentRow('pay2', '2026-09-09', 'pending'),
      ],
      purchase: [purchaseRow('pur1', '2026-09-08')],
      expense: [expenseRow('e1', '2026-09-07')],
    });
    const service = makeService(prisma);

    const result = await service.list({});

    expect(result.rows.map((r) => r.status)).toEqual([
      'PAID',
      'PENDING',
      'UNPAID',
      'PAID',
    ]);
  });

  it('D7: an unpriced original Purchase is PRICING_PENDING with a null amount, never ₹0; an unpriced correction is neither', async () => {
    const prisma = makePrisma({
      purchase: [
        purchaseRow('pur1', '2026-09-10', {
          totalAmount: null,
          paymentStatus: null,
        }),
        purchaseRow('pur2', '2026-09-09', {
          totalAmount: null,
          paymentStatus: null,
          correctsId: 'pur0',
        }),
      ],
    });
    const service = makeService(prisma);

    const result = await service.list({});

    expect(result.rows[0]).toMatchObject({
      id: 'pur1',
      amount: null,
      status: 'PRICING_PENDING',
      isCorrection: false,
    });
    expect(result.rows[1]).toMatchObject({
      id: 'pur2',
      amount: null,
      status: null,
      isCorrection: true,
    });
  });

  it('excludes Purchase-linked Expenses (double-count) and OWN Waste Disposals (no counterparty)', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({});

    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ purchaseId: null }),
      }),
    );
    expect(prisma.wasteDisposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownership: 'HIRED' }),
      }),
    );
  });

  it('surfaces a pricing-pending original RMC delivery and Waste Material trip as PRICING_PENDING, but not their corrections', async () => {
    const prisma = makePrisma({
      rmcEntry: [
        {
          id: 'rmc1',
          deliveredAt: new Date('2026-09-10'),
          totalAmount: null,
          correctsId: null,
          grade: 'M25',
          quantityM3: { toString: () => '20' },
          vendor: { name: 'Anand RMC Suppliers' },
          site: { name: 'Site A' },
        },
        {
          id: 'rmc2',
          deliveredAt: new Date('2026-09-09'),
          totalAmount: null,
          correctsId: 'rmc0',
          grade: 'M25',
          quantityM3: { toString: () => '5' },
          vendor: { name: 'Anand RMC Suppliers' },
          site: { name: 'Site A' },
        },
      ],
      wasteDisposal: [
        {
          id: 'wd1',
          disposedAt: new Date('2026-09-08'),
          totalAmount: null,
          paymentStatus: null,
          correctsId: null,
          wasteType: 'Debris',
          vendor: { name: 'Balaji Transport' },
          site: { name: 'Site A' },
        },
      ],
    });
    const service = makeService(prisma);

    const result = await service.list({});

    const byId = Object.fromEntries(result.rows.map((r) => [r.id, r]));
    expect(byId.rmc1).toMatchObject({
      amount: null,
      status: 'PRICING_PENDING',
      isCorrection: false,
    });
    expect(byId.rmc2).toMatchObject({
      amount: null,
      status: null,
      isCorrection: true,
    });
    expect(byId.wd1).toMatchObject({
      amount: null,
      status: 'PRICING_PENDING',
      isCorrection: false,
    });
  });

  it('status=PENDING queries only pending Employee Payments and unpriced original Purchases', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ status: 'PENDING' });

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'pending' }),
      }),
    );
    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          totalAmount: null,
          correctsId: null,
        }),
      }),
    );
    // No status-tracking, no pending concept — these sources sit out.
    expect(prisma.expense.findMany).not.toHaveBeenCalled();
    expect(prisma.advance.findMany).not.toHaveBeenCalled();
    expect(prisma.subcontractorPayment.findMany).not.toHaveBeenCalled();
    expect(prisma.vendorAdvance.findMany).not.toHaveBeenCalled();
    expect(prisma.wasteDisposal.findMany).not.toHaveBeenCalled();
    expect(prisma.rmcEntry.findMany).not.toHaveBeenCalled();
  });

  it('status=UNPAID narrows to the two status-tracking sources only', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ status: 'UNPAID' });

    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ paymentStatus: 'UNPAID' }),
      }),
    );
    expect(prisma.wasteDisposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ paymentStatus: 'UNPAID' }),
      }),
    );
    expect(prisma.payment.findMany).not.toHaveBeenCalled();
    expect(prisma.expense.findMany).not.toHaveBeenCalled();
    expect(prisma.rmcEntry.findMany).not.toHaveBeenCalled();
  });

  it('status=PAID includes the inherently-paid sources but never RMC (no status tracked)', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ status: 'PAID' });

    expect(prisma.expense.findMany).toHaveBeenCalled();
    expect(prisma.advance.findMany).toHaveBeenCalled();
    expect(prisma.subcontractorPayment.findMany).toHaveBeenCalled();
    expect(prisma.vendorAdvance.findMany).toHaveBeenCalled();
    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'paid' }),
      }),
    );
    expect(prisma.rmcEntry.findMany).not.toHaveBeenCalled();
  });

  it('kind filter queries only that source', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ kind: 'SUBCONTRACTOR' });

    expect(prisma.subcontractorPayment.findMany).toHaveBeenCalled();
    for (const source of SOURCES.filter((s) => s !== 'subcontractorPayment')) {
      expect(prisma[source].findMany).not.toHaveBeenCalled();
    }
  });

  it('fetches top (skip+take) rows from every source — the top-k-merge bound', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ page: '2', pageSize: '10' });

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { createdAt: 'desc' } }),
    );
    expect(prisma.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { purchasedAt: 'desc' } }),
    );
  });

  it('threads the date range into every source on its own business-date field', async () => {
    const prisma = makePrisma({});
    const service = makeService(prisma);

    await service.list({ from: '2026-09-01', to: '2026-09-15' });

    const bounds = {
      gte: new Date('2026-09-01'),
      lt: new Date('2026-09-16'),
    };
    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ createdAt: bounds }),
      }),
    );
    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ incurredAt: bounds }),
      }),
    );
    expect(prisma.rmcEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deliveredAt: bounds }),
      }),
    );
  });
});

describe('PaymentsOverviewService.summary', () => {
  it('sums paid vs outstanding buckets and counts (never sums) unpriced Purchases, RMC deliveries, and Waste Material trips', async () => {
    const prisma = makePrisma(
      { purchaseCount: 3, rmcEntryCount: 2, wasteDisposalCount: 1 },
      {
        // Call order within summary(): payment paid, payment pending;
        // purchase PAID, purchase UNPAID+PARTIAL; waste PAID, waste owed.
        payment: [
          { _sum: { netPayable: 5000 } },
          { _sum: { netPayable: 2000 } },
        ],
        purchase: [
          { _sum: { totalAmount: 10000 } },
          { _sum: { totalAmount: 4000 } },
        ],
        wasteDisposal: [
          { _sum: { totalAmount: 1000 } },
          { _sum: { totalAmount: 500 } },
        ],
        advance: [{ _sum: { amount: 300 } }],
        vendorAdvance: [{ _sum: { amount: 200 } }],
        subcontractorPayment: [{ _sum: { amount: 700 } }],
        expense: [{ _sum: { amount: 800 } }],
      },
    );
    const service = makeService(prisma);

    const summary = await service.summary('2026-09-01', '2026-09-30');

    expect(summary).toEqual({
      paidTotal: 5000 + 10000 + 1000 + 300 + 200 + 700 + 800,
      outstandingTotal: 2000 + 4000 + 500,
      pendingPricingCount: 3 + 2 + 1,
    });
    expect(prisma.purchase.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ totalAmount: null, correctsId: null }),
    });
    expect(prisma.rmcEntry.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ totalAmount: null, correctsId: null }),
    });
    expect(prisma.wasteDisposal.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ totalAmount: null, correctsId: null }),
    });
  });

  it('returns zeros when nothing is recorded', async () => {
    const service = makeService(makePrisma());

    expect(await service.summary()).toEqual({
      paidTotal: 0,
      outstandingTotal: 0,
      pendingPricingCount: 0,
    });
  });
});
