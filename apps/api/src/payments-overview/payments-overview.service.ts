import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { dateRangeBounds } from '../common/date-range';
import { isSortOrder } from '../common/sort-order';

// The unified "All Payments" feed (2026-09-19): every money-out record in
// the system in one date-ordered list, so the Owner sees paid/unpaid/pending
// across Employee Payments, Advances, Subcontractor Payments, Vendor
// Purchases, RMC, Waste Disposal and Expenses without visiting seven pages.
// Read-only aggregation over the owning epics' tables — no write endpoints,
// no new source of truth (AD-9 untouched).
export type PaymentOverviewKind =
  | 'EMPLOYEE_PAYMENT'
  | 'EMPLOYEE_ADVANCE'
  | 'SUBCONTRACTOR'
  | 'PURCHASE'
  | 'RMC'
  | 'WASTE_DISPOSAL'
  | 'VENDOR_ADVANCE'
  | 'EXPENSE';

const PAYMENT_OVERVIEW_KINDS: readonly PaymentOverviewKind[] = [
  'EMPLOYEE_PAYMENT',
  'EMPLOYEE_ADVANCE',
  'SUBCONTRACTOR',
  'PURCHASE',
  'RMC',
  'WASTE_DISPOSAL',
  'VENDOR_ADVANCE',
  'EXPENSE',
];

function isPaymentOverviewKind(
  value: string | undefined,
): value is PaymentOverviewKind {
  return (
    Boolean(value) &&
    PAYMENT_OVERVIEW_KINDS.includes(value as PaymentOverviewKind)
  );
}

// Normalized across sources: Purchase/WasteDisposal carry PAID|PARTIAL|
// UNPAID (their shared Zod vocabulary), Employee Payment carries
// pending|paid (mapped to PENDING|PAID), and an unpriced original Purchase
// is PRICING_PENDING (D7 — never a silent ₹0). RMC deliveries track no
// payment status at all and surface as `null` ("Not tracked"), matching
// only the unfiltered view.
export type PaymentOverviewStatus =
  'PAID' | 'PARTIAL' | 'UNPAID' | 'PENDING' | 'PRICING_PENDING';

const STATUS_FILTERS = ['PAID', 'PARTIAL', 'UNPAID', 'PENDING'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return (
    Boolean(value) && (STATUS_FILTERS as readonly string[]).includes(value!)
  );
}

export interface PaymentsOverviewQuery {
  q?: string;
  from?: string;
  to?: string;
  // Raw query-string values — an unrecognized kind/status is treated as
  // "no filter" (same convention as MovementsLogService's `type`).
  kind?: string;
  status?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

export interface PaymentOverviewRow {
  kind: PaymentOverviewKind;
  id: string;
  date: Date;
  /** Who the money goes to (Team Member / Vendor / Subcontractor / payee). */
  partyName: string;
  siteName: string | null;
  /** Kind-specific context: pay period, expense category, waste type, … */
  detail: string | null;
  /** null ⇔ Purchase pricing pending (D7) — the web layer must never render it as ₹0. */
  amount: Prisma.Decimal | number | null;
  status: PaymentOverviewStatus | null;
  isCorrection: boolean;
  /** FKs the web layer needs to build each kind's deep link. */
  refs: { teamMemberId?: string; siteId?: string; contractId?: string };
}

export interface PaymentsOverviewSummary {
  /** Sum of everything recorded as fully paid in the range. */
  paidTotal: number;
  /** Unpaid + Partial (at recorded value) + pending Employee Payments. */
  outstandingTotal: number;
  /** Unpriced original Purchases in the range — a count, never a ₹ figure (D7). */
  pendingPricingCount: number;
}

// Same top-N-per-source merge as MovementsLogService (see its header comment
// for why this beats raw SQL or per-source cursors), with the same
// deep-pagination cap reasoning — eight sources here instead of four, so the
// per-page cost grows a little faster, but the UI's Previous/Next-only
// Pagination makes a deep page just as unreachable in practice.
const PAYMENTS_OVERVIEW_MAX_PAGE = 200;

@Injectable()
export class PaymentsOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: PaymentsOverviewQuery,
  ): Promise<PaginatedResult<PaymentOverviewRow>> {
    const { q, from, to } = query;
    const pagination = paginationParams(query.page, query.pageSize);
    const page = pagination.paginated ? pagination.page : 1;
    const pageSize = pagination.paginated ? pagination.pageSize : 25;
    const limit = page * pageSize;
    const withinPageCap = page <= PAYMENTS_OVERVIEW_MAX_PAGE;
    const dateRange = dateRangeBounds(from, to);
    const dateDirection: 'asc' | 'desc' =
      query.sort === 'date' && isSortOrder(query.order) ? query.order : 'desc';

    const kind = isPaymentOverviewKind(query.kind) ? query.kind : undefined;
    const status = isStatusFilter(query.status) ? query.status : undefined;

    // Which sources a status filter can ever match:
    // - PENDING: pending Employee Payments + unpriced original Purchases
    // - PARTIAL/UNPAID: only the two sources that track a payment status
    //   (Purchase, hired Waste Disposal)
    // - PAID: those two plus every money-already-handed-over source
    //   (Advances, Vendor Advances, Subcontractor Payments, Expenses)
    // - RMC tracks no status, so it appears only unfiltered.
    const wantEmployeePayment =
      (!kind || kind === 'EMPLOYEE_PAYMENT') &&
      (!status || status === 'PAID' || status === 'PENDING');
    const wantInherentlyPaid = !status || status === 'PAID';
    const wantEmployeeAdvance =
      (!kind || kind === 'EMPLOYEE_ADVANCE') && wantInherentlyPaid;
    const wantSubcontractor =
      (!kind || kind === 'SUBCONTRACTOR') && wantInherentlyPaid;
    const wantVendorAdvance =
      (!kind || kind === 'VENDOR_ADVANCE') && wantInherentlyPaid;
    const wantExpense = (!kind || kind === 'EXPENSE') && wantInherentlyPaid;
    const wantPurchase = !kind || kind === 'PURCHASE';
    const wantWasteDisposal =
      (!kind || kind === 'WASTE_DISPOSAL') && status !== 'PENDING';
    const wantRmc = (!kind || kind === 'RMC') && !status;

    const nameContains = q
      ? { contains: q, mode: 'insensitive' as const }
      : undefined;

    const paymentWhere: Prisma.PaymentWhereInput = {
      ...(dateRange ? { createdAt: dateRange } : {}),
      ...(status === 'PAID' ? { status: 'paid' } : {}),
      ...(status === 'PENDING' ? { status: 'pending' } : {}),
      ...(nameContains ? { teamMember: { name: nameContains } } : {}),
    };
    const advanceWhere: Prisma.AdvanceWhereInput = {
      ...(dateRange ? { givenAt: dateRange } : {}),
      ...(nameContains ? { teamMember: { name: nameContains } } : {}),
    };
    const subcontractorPaymentWhere: Prisma.SubcontractorPaymentWhereInput = {
      ...(dateRange ? { paidAt: dateRange } : {}),
      ...(nameContains
        ? { siteContract: { subcontractor: { name: nameContains } } }
        : {}),
    };
    const purchaseWhere: Prisma.PurchaseWhereInput = {
      ...(dateRange ? { purchasedAt: dateRange } : {}),
      ...(nameContains ? { vendor: { name: nameContains } } : {}),
      // PAID/PARTIAL/UNPAID narrow to that recorded status; PENDING means
      // "pricing pending" here — the same { totalAmount: null, correctsId:
      // null } universe countPendingPricing() uses (a correction row is a
      // signed delta and never carries its own pricing, so it is never
      // "pending").
      ...(status === 'PENDING'
        ? { totalAmount: null, correctsId: null }
        : status
          ? { paymentStatus: status }
          : {}),
    };
    const wasteDisposalWhere: Prisma.WasteDisposalWhereInput = {
      ...(dateRange ? { disposedAt: dateRange } : {}),
      ...(nameContains ? { vendor: { name: nameContains } } : {}),
      // HIRED trips only — an OWN-asset disposal has no counterparty being
      // paid, so it isn't a "payment" in this feed (it stays on the Waste &
      // Disposal page as a cost record).
      paymentStatus: status ?? { not: null },
    };
    const vendorAdvanceWhere: Prisma.VendorAdvanceWhereInput = {
      ...(dateRange ? { givenAt: dateRange } : {}),
      ...(nameContains ? { vendor: { name: nameContains } } : {}),
    };
    const expenseWhere: Prisma.ExpenseWhereInput = {
      ...(dateRange ? { incurredAt: dateRange } : {}),
      // An Expense with purchaseId IS that Purchase's cost entry — the
      // Purchase row already represents it here; including both would
      // double-count the same money.
      purchaseId: null,
      ...(nameContains
        ? {
            OR: [
              { personOrVendor: nameContains },
              { category: { name: nameContains } },
            ],
          }
        : {}),
    };
    const rmcWhere: Prisma.RmcEntryWhereInput = {
      ...(dateRange ? { deliveredAt: dateRange } : {}),
      ...(nameContains ? { vendor: { name: nameContains } } : {}),
    };

    // Same shape as MovementsLogService: each source's [findMany, count]
    // pair, all sources concurrent; findMany gated on withinPageCap, count
    // never, so `total` stays honest on a page past the cap.
    const sourceQuery = <R>(
      want: boolean,
      findMany: () => Promise<R[]>,
      count: () => Promise<number>,
    ): Promise<readonly [R[], number]> =>
      want
        ? Promise.all([
            withinPageCap ? findMany() : Promise.resolve([]),
            count(),
          ])
        : Promise.resolve([[], 0] as const);

    const [
      [payments, paymentTotal],
      [advances, advanceTotal],
      [subcontractorPayments, subcontractorPaymentTotal],
      [purchases, purchaseTotal],
      [wasteDisposals, wasteDisposalTotal],
      [vendorAdvances, vendorAdvanceTotal],
      [expenses, expenseTotal],
      [rmcEntries, rmcTotal],
    ] = await Promise.all([
      sourceQuery(
        wantEmployeePayment,
        () =>
          this.prisma.payment.findMany({
            where: paymentWhere,
            include: { teamMember: { select: { id: true, name: true } } },
            orderBy: { createdAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.payment.count({ where: paymentWhere }),
      ),
      sourceQuery(
        wantEmployeeAdvance,
        () =>
          this.prisma.advance.findMany({
            where: advanceWhere,
            include: { teamMember: { select: { id: true, name: true } } },
            orderBy: { givenAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.advance.count({ where: advanceWhere }),
      ),
      sourceQuery(
        wantSubcontractor,
        () =>
          this.prisma.subcontractorPayment.findMany({
            where: subcontractorPaymentWhere,
            include: {
              siteContract: {
                select: {
                  id: true,
                  siteId: true,
                  workCategory: true,
                  subcontractor: { select: { name: true } },
                  site: { select: { name: true } },
                },
              },
            },
            orderBy: { paidAt: dateDirection },
            take: limit,
          }),
        () =>
          this.prisma.subcontractorPayment.count({
            where: subcontractorPaymentWhere,
          }),
      ),
      sourceQuery(
        wantPurchase,
        () =>
          this.prisma.purchase.findMany({
            where: purchaseWhere,
            include: {
              vendor: { select: { name: true } },
              site: { select: { name: true } },
              materialSize: {
                select: { material: { select: { name: true } } },
              },
            },
            orderBy: { purchasedAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.purchase.count({ where: purchaseWhere }),
      ),
      sourceQuery(
        wantWasteDisposal,
        () =>
          this.prisma.wasteDisposal.findMany({
            where: wasteDisposalWhere,
            include: {
              vendor: { select: { name: true } },
              site: { select: { name: true } },
            },
            orderBy: { disposedAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.wasteDisposal.count({ where: wasteDisposalWhere }),
      ),
      sourceQuery(
        wantVendorAdvance,
        () =>
          this.prisma.vendorAdvance.findMany({
            where: vendorAdvanceWhere,
            include: { vendor: { select: { name: true } } },
            orderBy: { givenAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.vendorAdvance.count({ where: vendorAdvanceWhere }),
      ),
      sourceQuery(
        wantExpense,
        () =>
          this.prisma.expense.findMany({
            where: expenseWhere,
            include: {
              site: { select: { name: true } },
              category: { select: { name: true } },
            },
            orderBy: { incurredAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.expense.count({ where: expenseWhere }),
      ),
      sourceQuery(
        wantRmc,
        () =>
          this.prisma.rmcEntry.findMany({
            where: rmcWhere,
            include: {
              vendor: { select: { name: true } },
              site: { select: { name: true } },
            },
            orderBy: { deliveredAt: dateDirection },
            take: limit,
          }),
        () => this.prisma.rmcEntry.count({ where: rmcWhere }),
      ),
    ]);

    const merged: PaymentOverviewRow[] = [
      ...payments.map((p): PaymentOverviewRow => ({
        kind: 'EMPLOYEE_PAYMENT',
        id: p.id,
        date: p.createdAt,
        partyName: p.teamMember.name,
        siteName: null,
        detail: p.payPeriod,
        amount: p.netPayable,
        status: p.status === 'paid' ? 'PAID' : 'PENDING',
        isCorrection: p.correctsId !== null,
        refs: { teamMemberId: p.teamMember.id },
      })),
      ...advances.map((a): PaymentOverviewRow => ({
        kind: 'EMPLOYEE_ADVANCE',
        id: a.id,
        date: a.givenAt,
        partyName: a.teamMember.name,
        siteName: null,
        detail: a.reason,
        amount: a.amount,
        status: 'PAID',
        isCorrection: a.correctsId !== null,
        refs: { teamMemberId: a.teamMember.id },
      })),
      ...subcontractorPayments.map((sp): PaymentOverviewRow => ({
        kind: 'SUBCONTRACTOR',
        id: sp.id,
        date: sp.paidAt,
        partyName: sp.siteContract.subcontractor.name,
        siteName: sp.siteContract.site.name,
        detail: [
          sp.type === 'ADVANCE' ? 'Advance' : 'Payment',
          sp.siteContract.workCategory,
        ]
          .filter(Boolean)
          .join(' — '),
        amount: sp.amount,
        status: 'PAID',
        isCorrection: sp.correctsId !== null,
        refs: {
          siteId: sp.siteContract.siteId,
          contractId: sp.siteContract.id,
        },
      })),
      ...purchases.map((p): PaymentOverviewRow => ({
        kind: 'PURCHASE',
        id: p.id,
        date: p.purchasedAt,
        partyName: p.vendor.name,
        siteName: p.site?.name ?? 'Godown',
        detail: p.materialSize.material.name,
        amount: p.totalAmount,
        // A correction row is a signed delta with no pricing of its own —
        // neither pending nor statused (movements-list draws the same line).
        status:
          p.totalAmount === null
            ? p.correctsId === null
              ? 'PRICING_PENDING'
              : null
            : ((p.paymentStatus as PaymentOverviewStatus | null) ?? null),
        isCorrection: p.correctsId !== null,
        refs: {},
      })),
      ...wasteDisposals.map((w): PaymentOverviewRow => ({
        kind: 'WASTE_DISPOSAL',
        id: w.id,
        date: w.disposedAt,
        partyName: w.vendor?.name ?? '—',
        siteName: w.site.name,
        detail: w.wasteType,
        amount: w.totalAmount,
        status: (w.paymentStatus as PaymentOverviewStatus | null) ?? null,
        isCorrection: w.correctsId !== null,
        refs: {},
      })),
      ...vendorAdvances.map((va): PaymentOverviewRow => ({
        kind: 'VENDOR_ADVANCE',
        id: va.id,
        date: va.givenAt,
        partyName: va.vendor.name,
        siteName: null,
        detail: null,
        amount: va.amount,
        status: 'PAID',
        isCorrection: va.correctsId !== null,
        refs: {},
      })),
      ...expenses.map((e): PaymentOverviewRow => ({
        kind: 'EXPENSE',
        id: e.id,
        date: e.incurredAt,
        partyName: e.personOrVendor ?? e.category.name,
        siteName: e.site.name,
        detail: e.category.name,
        amount: e.amount,
        status: 'PAID',
        isCorrection: e.correctsId !== null,
        refs: {},
      })),
      ...rmcEntries.map((r): PaymentOverviewRow => ({
        kind: 'RMC',
        id: r.id,
        date: r.deliveredAt,
        partyName: r.vendor.name,
        siteName: r.site.name,
        detail: `${r.grade} — ${r.quantityM3.toString()} m³`,
        amount: r.totalAmount,
        status: null,
        isCorrection: r.correctsId !== null,
        refs: {},
      })),
    ].sort((a, b) =>
      dateDirection === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime(),
    );

    const skip = (page - 1) * pageSize;
    const rows = merged.slice(skip, skip + pageSize);
    const total =
      paymentTotal +
      advanceTotal +
      subcontractorPaymentTotal +
      purchaseTotal +
      wasteDisposalTotal +
      vendorAdvanceTotal +
      expenseTotal +
      rmcTotal;

    return { rows, total, page, pageSize };
  }

  // The three stat tiles above the list — computed over the same date range
  // as the list but never narrowed by its kind/status/search filters (the
  // tiles answer "how does this period stand overall", same convention as
  // the Employee Payments page's own tiles). Unpriced Purchases are a count
  // (D7 — never ₹0 in a money aggregate); RMC tracks no status, so it joins
  // neither bucket. Correction rows' signed deltas sum in naturally.
  async summary(from?: string, to?: string): Promise<PaymentsOverviewSummary> {
    const dateRange = dateRangeBounds(from, to);
    const decimal = (value: Prisma.Decimal | null | undefined): number =>
      value ? Number(value) : 0;

    const [
      paidPayments,
      pendingPayments,
      paidPurchases,
      owedPurchases,
      paidWaste,
      owedWaste,
      advances,
      vendorAdvances,
      subcontractorPayments,
      expenses,
      pendingPricingCount,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: 'paid',
          ...(dateRange ? { createdAt: dateRange } : {}),
        },
        _sum: { netPayable: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'pending',
          ...(dateRange ? { createdAt: dateRange } : {}),
        },
        _sum: { netPayable: true },
      }),
      this.prisma.purchase.aggregate({
        where: {
          paymentStatus: 'PAID',
          ...(dateRange ? { purchasedAt: dateRange } : {}),
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchase.aggregate({
        where: {
          paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
          ...(dateRange ? { purchasedAt: dateRange } : {}),
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.wasteDisposal.aggregate({
        where: {
          paymentStatus: 'PAID',
          ...(dateRange ? { disposedAt: dateRange } : {}),
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.wasteDisposal.aggregate({
        where: {
          paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
          ...(dateRange ? { disposedAt: dateRange } : {}),
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.advance.aggregate({
        where: dateRange ? { givenAt: dateRange } : {},
        _sum: { amount: true },
      }),
      this.prisma.vendorAdvance.aggregate({
        where: dateRange ? { givenAt: dateRange } : {},
        _sum: { amount: true },
      }),
      this.prisma.subcontractorPayment.aggregate({
        where: dateRange ? { paidAt: dateRange } : {},
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        // purchaseId: null — same double-count exclusion as list().
        where: {
          purchaseId: null,
          ...(dateRange ? { incurredAt: dateRange } : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.purchase.count({
        where: {
          totalAmount: null,
          correctsId: null,
          ...(dateRange ? { purchasedAt: dateRange } : {}),
        },
      }),
    ]);

    return {
      paidTotal:
        decimal(paidPayments._sum.netPayable) +
        decimal(paidPurchases._sum.totalAmount) +
        decimal(paidWaste._sum.totalAmount) +
        decimal(advances._sum.amount) +
        decimal(vendorAdvances._sum.amount) +
        decimal(subcontractorPayments._sum.amount) +
        decimal(expenses._sum.amount),
      outstandingTotal:
        decimal(pendingPayments._sum.netPayable) +
        decimal(owedPurchases._sum.totalAmount) +
        decimal(owedWaste._sum.totalAmount),
      pendingPricingCount,
    };
  }
}
