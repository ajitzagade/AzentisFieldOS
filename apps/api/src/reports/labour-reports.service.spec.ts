import { describe, expect, it, vi } from 'vitest';
import { LabourReportsService } from './labour-reports.service';

// Mirrors site-inventory-reports.service.spec.ts: stub each owning-epic
// service so these tests assert composition + filter threading, not the
// (separately tested) query internals.
function makeService() {
  const teamMembers = {
    getTeamSummary: vi.fn().mockResolvedValue({
      totalTeamMembers: 0,
      todaysWorkingHeadcount: 0,
      weeklyPaymentTotal: 0,
      monthlyPaymentTotal: 0,
    }),
    getOutstandingAdvances: vi
      .fn()
      .mockResolvedValue({ total: 0, byTeamMember: [] }),
  };
  const workRecords = { list: vi.fn().mockResolvedValue([]) };
  const payments = { list: vi.fn().mockResolvedValue([]) };
  const advances = { list: vi.fn().mockResolvedValue([]) };
  const advanceAdjustments = { list: vi.fn().mockResolvedValue([]) };
  const service = new LabourReportsService(
    teamMembers as never,
    workRecords as never,
    payments as never,
    advances as never,
    advanceAdjustments as never,
  );
  return {
    service,
    teamMembers,
    workRecords,
    payments,
    advances,
    advanceAdjustments,
  };
}

describe('LabourReportsService.getLabourReport (FR-44)', () => {
  it('composes summary, outstanding, work/payment/advance/adjustment history, threading teamMemberId + window into each history source', async () => {
    const ctx = makeService();
    ctx.teamMembers.getTeamSummary.mockResolvedValue({
      totalTeamMembers: 12,
      todaysWorkingHeadcount: 8,
      weeklyPaymentTotal: 45000,
      monthlyPaymentTotal: 180000,
    });
    ctx.teamMembers.getOutstandingAdvances.mockResolvedValue({
      total: 5000,
      byTeamMember: [
        { teamMemberId: 'tm1', name: 'Ravi', outstandingAdvanceBalance: 5000 },
      ],
    });
    ctx.workRecords.list.mockResolvedValue([{ id: 'wr1' }]);
    ctx.payments.list.mockResolvedValue([{ id: 'pay1' }]);
    ctx.advances.list.mockResolvedValue([{ id: 'adv1' }]);
    ctx.advanceAdjustments.list.mockResolvedValue([{ id: 'adj1' }]);

    const filters = {
      teamMemberId: 'tm1',
      from: '2026-08-01',
      to: '2026-08-31',
    };
    const result = await ctx.service.getLabourReport(filters);

    // Work records go through list(siteId, filters) — no Site scoping here, so
    // siteId is undefined and the report filters ride the second argument.
    expect(ctx.workRecords.list).toHaveBeenCalledWith(undefined, filters);
    expect(ctx.payments.list).toHaveBeenCalledWith(filters);
    expect(ctx.advances.list).toHaveBeenCalledWith(filters);
    expect(ctx.advanceAdjustments.list).toHaveBeenCalledWith(filters);
    // The point-in-time aggregates are reused verbatim — not re-scoped to the
    // window (Dev Notes: weekly/monthly + outstanding are current figures).
    expect(ctx.teamMembers.getTeamSummary).toHaveBeenCalledWith();
    expect(ctx.teamMembers.getOutstandingAdvances).toHaveBeenCalledWith();

    expect(result).toEqual({
      summary: {
        totalTeamMembers: 12,
        todaysWorkingHeadcount: 8,
        weeklyPaymentTotal: 45000,
        monthlyPaymentTotal: 180000,
      },
      outstanding: {
        total: 5000,
        byTeamMember: [
          {
            teamMemberId: 'tm1',
            name: 'Ravi',
            outstandingAdvanceBalance: 5000,
          },
        ],
      },
      workRecords: [{ id: 'wr1' }],
      payments: [{ id: 'pay1' }],
      advances: [{ id: 'adv1' }],
      adjustments: [{ id: 'adj1' }],
    });
  });

  it('with no teamMemberId, every Team Member\'s history composes (the "All" view)', async () => {
    const ctx = makeService();

    await ctx.service.getLabourReport({ from: '2026-08-01', to: '2026-08-31' });

    const expected = {
      teamMemberId: undefined,
      from: '2026-08-01',
      to: '2026-08-31',
    };
    expect(ctx.workRecords.list).toHaveBeenCalledWith(undefined, expected);
    expect(ctx.payments.list).toHaveBeenCalledWith(expected);
    expect(ctx.advances.list).toHaveBeenCalledWith(expected);
    expect(ctx.advanceAdjustments.list).toHaveBeenCalledWith(expected);
  });

  it('a window with no matching history is an empty result set, not an error', async () => {
    const ctx = makeService();

    const result = await ctx.service.getLabourReport({
      from: '2099-01-01',
      to: '2099-12-31',
    });

    expect(result.workRecords).toEqual([]);
    expect(result.payments).toEqual([]);
    expect(result.advances).toEqual([]);
    expect(result.adjustments).toEqual([]);
  });
});
