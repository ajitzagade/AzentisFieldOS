import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { DailyLabourersService } from './daily-labourers.service';
import { DailyLabourAttendanceService } from './daily-labour-attendance.service';
import { DailyLabourAdvancesService } from './daily-labour-advances.service';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

// Real integration test against a live Postgres instance (not a mocked
// Prisma) — exercises the whole module against real Decimal columns and
// real transactions, which the unit-tested (mocked) *.service.spec.ts files
// can't. Skips itself when no DATABASE_URL is configured.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('Labour Payment module (integration)', () => {
  let prisma: PrismaService;
  let labourers: DailyLabourersService;
  let attendance: DailyLabourAttendanceService;
  let advances: DailyLabourAdvancesService;
  let weeklyPayments: DailyLabourWeeklyPaymentsService;
  let siteId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    labourers = new DailyLabourersService(prisma);
    attendance = new DailyLabourAttendanceService(prisma);
    advances = new DailyLabourAdvancesService(prisma);
    weeklyPayments = new DailyLabourWeeklyPaymentsService(prisma);

    const site = await prisma.site.create({
      data: { name: 'Labour Payment Test Site', location: 'Test Location' },
    });
    siteId = site.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('records a full week of attendance (with an embedded Advance), settles the week with a partial Advance adjustment, and reflects it all in the ledger', async () => {
    const labourer = await labourers.create({
      name: 'Ramesh Kumar',
      category: 'Mason',
      defaultPerDayAmount: 800,
      isActive: true,
    });
    expect(Number(labourer.outstandingAdvanceBalance)).toBe(0);

    // Monday: attended, with an embedded ₹500 advance.
    await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-10',
      attended: true,
      perDayAmount: 800,
      advance: { amount: 500, description: 'Medical' },
    });
    // Tuesday: attended, no advance.
    await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-11',
      attended: true,
      perDayAmount: 800,
    });
    // Wednesday: absent — must not count toward totalEarned.
    await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-12',
      attended: false,
      perDayAmount: 800,
    });

    const afterAdvance = await labourers.findOne(labourer.id);
    expect(Number(afterAdvance.outstandingAdvanceBalance)).toBe(500);

    const [givenAdvance] = await advances.list(labourer.id);
    expect(givenAdvance).toBeDefined();

    const payment = await weeklyPayments.create({
      labourerId: labourer.id,
      weekStartDate: '2026-08-09',
      amountPaid: 1300, // 1600 earned - 300 adjusted
      status: 'PARTIAL',
      paidAt: '2026-08-16',
      advanceAdjustment: {
        advanceId: givenAdvance!.id,
        amount: 300,
        note: 'Partial repay',
      },
    });

    expect(Number(payment.totalEarned)).toBe(1600); // Mon + Tue only, Wed absent
    expect(payment.weekEndDate.toISOString().slice(0, 10)).toBe('2026-08-15');

    const afterSettlement = await labourers.findOne(labourer.id);
    expect(Number(afterSettlement.outstandingAdvanceBalance)).toBe(200); // 500 - 300

    const ledger = await weeklyPayments.listForLabourer(labourer.id);
    expect(ledger).toHaveLength(1);
    expect(ledger[0]!.advanceAdjustments).toHaveLength(1);
    expect(Number(ledger[0]!.advanceAdjustments[0]!.amount)).toBe(300);
    expect(ledger[0]!.status).toBe('PARTIAL');
  });

  it("rejects an Advance adjustment that would exceed the Labourer's outstanding balance", async () => {
    const labourer = await labourers.create({
      name: 'Suresh Patil',
      category: 'Helper',
      isActive: true,
    });
    await advances.create({
      labourerId: labourer.id,
      amount: 200,
      givenAt: '2026-08-10',
    });
    const [advance] = await advances.list(labourer.id);

    await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-10',
      attended: true,
      perDayAmount: 800,
    });

    await expect(
      weeklyPayments.create({
        labourerId: labourer.id,
        weekStartDate: '2026-08-09',
        amountPaid: 300,
        status: 'PARTIAL',
        advanceAdjustment: { advanceId: advance!.id, amount: 500 },
      }),
    ).rejects.toThrow();
  });

  it('a correction to attendance never double-counts toward totalEarned', async () => {
    const labourer = await labourers.create({
      name: 'Geeta Rao',
      category: 'Helper',
      isActive: true,
    });

    const original = await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-10',
      attended: true,
      perDayAmount: 700,
    });
    await attendance.create({
      labourerId: labourer.id,
      siteId,
      workDate: '2026-08-10',
      attended: true,
      perDayAmount: 900,
      correctsId: original.id,
      correctionReason: 'Wrong rate entered',
    });

    const payment = await weeklyPayments.create({
      labourerId: labourer.id,
      weekStartDate: '2026-08-09',
      amountPaid: 900,
      status: 'PAID',
    });

    expect(Number(payment.totalEarned)).toBe(900); // only the correction counts, not 700+900
  });
});
