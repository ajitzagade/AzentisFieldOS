import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { TeamMembersService } from './team-members.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const create = overrides.create ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();

  const prisma = { teamMember: { create, findMany, findUnique, update } };
  const service = new TeamMembersService(
    prisma as unknown as ConstructorParameters<typeof TeamMembersService>[0],
  );

  return { service, create, findMany, findUnique, update };
}

describe('TeamMembersService.create', () => {
  it('translates a foreign-key violation (bad employmentTypeId, P2003) into a clear 400', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2003', message: 'FK violation' });
    const create = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ create });

    await expect(
      service.create({ name: 'Ravi Kumar', employmentTypeId: 'missing' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('re-throws any other error unchanged', async () => {
    const create = vi.fn().mockRejectedValue(new Error('connection lost'));
    const { service } = makeService({ create });

    await expect(
      service.create({ name: 'Ravi Kumar', employmentTypeId: 'et1' }),
    ).rejects.toThrow('connection lost');
  });
});

describe('TeamMembersService.update', () => {
  it('translates a not-found (P2025) into a clear 404', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2025', message: 'Record not found' });
    const update = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ update });

    await expect(
      service.update('missing', { isActive: false }),
    ).rejects.toThrow(NotFoundException);
  });

  it('translates a foreign-key violation (bad employmentTypeId, P2003) into a clear 400', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2003', message: 'FK violation' });
    const update = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ update });

    await expect(
      service.update('1', { employmentTypeId: 'missing' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('TeamMembersService.findOne', () => {
  it('throws NotFoundException when no Team Member matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

// AC #2, made concrete/automatable (Task 5): no query in this service ever
// filters or groups TeamMember by siteId — a Team Member is never bound to
// one Site, assignment is derived only from WorkRecord (Story 6.3's job).
describe('TeamMembersService — AC #2 (never scoped by siteId)', () => {
  it('list() never passes a siteId-shaped where/include clause to Prisma', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list();

    const callArg = findMany.mock.calls[0]?.[0] as
      Record<string, unknown> | undefined;
    expect(JSON.stringify(callArg ?? {})).not.toContain('where');
  });

  it('create()/update() input types have no siteId field (compile-time enforced, exercised here at the value level)', async () => {
    const create = vi.fn().mockResolvedValue({ id: '1' });
    const { service } = makeService({ create });

    await service.create({ name: 'Ravi Kumar', employmentTypeId: 'et1' });

    expect(create).toHaveBeenCalledWith({
      data: { name: 'Ravi Kumar', employmentTypeId: 'et1' },
    });
  });
});

// Story 6.3: TeamMember never stores its own Site — "current/last Site" and
// "today's attendance" must be derived from WorkRecord.
describe('TeamMembersService.list — Story 6.3 derivation', () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  it("derives currentOrLastSite and todaysAttendance from each Team Member's single most recent WorkRecord", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'tm1',
        name: 'Ravi Kumar',
        workRecords: [
          {
            workDate: new Date(todayStr),
            attended: true,
            site: { name: 'NH-48 Highway Widening' },
          },
        ],
      },
    ]);
    const { service } = makeService({ findMany });

    const result = await service.list();

    expect(result).toEqual([
      {
        id: 'tm1',
        name: 'Ravi Kumar',
        currentOrLastSite: 'NH-48 Highway Widening',
        todaysAttendance: 'PRESENT',
      },
    ]);
  });

  it('reports todaysAttendance: null when the most recent WorkRecord is not from today, while still reporting the last Site', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'tm1',
        name: 'Ravi Kumar',
        workRecords: [
          {
            workDate: new Date('2020-01-01'),
            attended: true,
            site: { name: 'Old Site' },
          },
        ],
      },
    ]);
    const { service } = makeService({ findMany });

    const result = await service.list();

    expect(result[0]).toMatchObject({
      currentOrLastSite: 'Old Site',
      todaysAttendance: null,
    });
  });

  it('reports both fields as null for a Team Member with no Work Records yet', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'tm1', name: 'New Hire', workRecords: [] }]);
    const { service } = makeService({ findMany });

    const result = await service.list();

    expect(result[0]).toMatchObject({
      currentOrLastSite: null,
      todaysAttendance: null,
    });
  });

  it("reports todaysAttendance: ABSENT when today's most recent WorkRecord has attended: false", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'tm1',
        name: 'Ravi Kumar',
        workRecords: [
          {
            workDate: new Date(todayStr),
            attended: false,
            site: { name: 'Site A' },
          },
        ],
      },
    ]);
    const { service } = makeService({ findMany });

    const result = await service.list();

    expect(result[0]).toMatchObject({ todaysAttendance: 'ABSENT' });
  });
});

describe('TeamMembersService.getWorkHistory', () => {
  it('throws NotFoundException when no Team Member matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.getWorkHistory('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('orders Work Records by workDate descending, joined with Site (FR-21 AC #1)', async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 'tm1' });
    const workRecordFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      teamMember: { findUnique },
      workRecord: { findMany: workRecordFindMany },
    };
    const service = new TeamMembersService(
      prisma as unknown as ConstructorParameters<typeof TeamMembersService>[0],
    );

    await service.getWorkHistory('tm1');

    expect(workRecordFindMany).toHaveBeenCalledWith({
      where: { teamMemberId: 'tm1' },
      include: { site: true },
      orderBy: { workDate: 'desc' },
    });
  });
});

describe('TeamMembersService.getTeamSummary', () => {
  function makeSummaryService(overrides: {
    teamMemberCount?: ReturnType<typeof vi.fn>;
    workRecordFindMany?: ReturnType<typeof vi.fn>;
    paymentAggregate?: ReturnType<typeof vi.fn>;
  }) {
    const teamMemberCount =
      overrides.teamMemberCount ?? vi.fn().mockResolvedValue(0);
    const workRecordFindMany =
      overrides.workRecordFindMany ?? vi.fn().mockResolvedValue([]);
    const paymentAggregate =
      overrides.paymentAggregate ??
      vi.fn().mockResolvedValue({ _sum: { netPayable: null } });

    const prisma = {
      teamMember: { count: teamMemberCount },
      workRecord: { findMany: workRecordFindMany },
      payment: { aggregate: paymentAggregate },
    };
    const service = new TeamMembersService(
      prisma as unknown as ConstructorParameters<typeof TeamMembersService>[0],
    );

    return {
      service,
      teamMemberCount,
      workRecordFindMany,
      paymentAggregate,
    };
  }

  it('AC #3: returns 0/empty, not an error or null, when no Payment rows exist at all', async () => {
    const { service } = makeSummaryService({});

    const result = await service.getTeamSummary();

    expect(result).toEqual({
      totalTeamMembers: 0,
      todaysWorkingHeadcount: 0,
      weeklyPaymentTotal: 0,
      monthlyPaymentTotal: 0,
    });
  });

  it('AC #4: todaysWorkingHeadcount counts distinct Team Members, using a distinct query — not a raw WorkRecord row count', async () => {
    const workRecordFindMany = vi
      .fn()
      .mockResolvedValue([{ teamMemberId: 'tm1' }, { teamMemberId: 'tm2' }]);
    const { service } = makeSummaryService({ workRecordFindMany });

    const result = await service.getTeamSummary();

    expect(workRecordFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['teamMemberId'] }),
    );
    expect(result.todaysWorkingHeadcount).toBe(2);
  });
});

describe('TeamMembersService.getOutstandingAdvances', () => {
  function makeService(overrides: {
    teamMemberFindMany?: ReturnType<typeof vi.fn>;
    teamMemberAggregate?: ReturnType<typeof vi.fn>;
  }) {
    const teamMemberFindMany =
      overrides.teamMemberFindMany ?? vi.fn().mockResolvedValue([]);
    const teamMemberAggregate =
      overrides.teamMemberAggregate ??
      vi.fn().mockResolvedValue({ _sum: { outstandingAdvanceBalance: null } });

    const prisma = {
      teamMember: {
        findMany: teamMemberFindMany,
        aggregate: teamMemberAggregate,
      },
    };
    const service = new TeamMembersService(
      prisma as unknown as ConstructorParameters<typeof TeamMembersService>[0],
    );

    return { service, teamMemberFindMany, teamMemberAggregate };
  }

  it('AC #1: total is the sum of every Team Member outstandingAdvanceBalance, sourced from the materialized column', async () => {
    const teamMemberFindMany = vi.fn().mockResolvedValue([
      { id: 'tm1', name: 'Ravi Kumar', outstandingAdvanceBalance: '8000' },
      { id: 'tm2', name: 'Sanjay Pawar', outstandingAdvanceBalance: '0' },
      { id: 'tm3', name: 'Dinesh More', outstandingAdvanceBalance: '2500' },
    ]);
    const teamMemberAggregate = vi.fn().mockResolvedValue({
      _sum: { outstandingAdvanceBalance: { toNumber: () => 10500 } },
    });
    const { service } = makeService({
      teamMemberFindMany,
      teamMemberAggregate,
    });

    const result = await service.getOutstandingAdvances();

    expect(result.total).toBe(10500);
  });

  it('includes a Team Member with a ₹0 balance in byTeamMember, rather than silently dropping them', async () => {
    const teamMemberFindMany = vi
      .fn()
      .mockResolvedValue([
        { id: 'tm2', name: 'Sanjay Pawar', outstandingAdvanceBalance: '0' },
      ]);
    const { service } = makeService({ teamMemberFindMany });

    const result = await service.getOutstandingAdvances();

    expect(result.byTeamMember).toEqual([
      {
        teamMemberId: 'tm2',
        name: 'Sanjay Pawar',
        outstandingAdvanceBalance: '0',
      },
    ]);
  });

  it('AD-6: returns a genuine ₹0 total, not an error, when there are no Team Members at all', async () => {
    const { service } = makeService({});

    const result = await service.getOutstandingAdvances();

    expect(result).toEqual({ total: 0, byTeamMember: [] });
  });

  it('orders byTeamMember by outstandingAdvanceBalance descending', async () => {
    const teamMemberFindMany = vi.fn().mockResolvedValue([]);
    const { service, teamMemberFindMany: findMany } = makeService({
      teamMemberFindMany,
    });

    await service.getOutstandingAdvances();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { outstandingAdvanceBalance: 'desc' },
      }),
    );
  });
});
