import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { WorkRecordsService } from './work-records.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findFirst?: ReturnType<typeof vi.fn>;
  executeRaw?: ReturnType<typeof vi.fn>;
}) {
  const create = overrides.create ?? vi.fn().mockResolvedValue({ id: 'wr1' });
  const findFirst = overrides.findFirst ?? vi.fn().mockResolvedValue(null);
  const executeRaw =
    overrides.executeRaw ?? vi.fn().mockResolvedValue(undefined);

  const tx = {
    workRecord: { create, findFirst },
    $executeRaw: executeRaw,
  };

  const prisma = {
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };
  const service = new WorkRecordsService(
    prisma as unknown as ConstructorParameters<typeof WorkRecordsService>[0],
  );

  return { service, prisma, create, findFirst, executeRaw };
}

const input = {
  teamMemberId: 'tm1',
  siteId: 'site1',
  workDate: '2026-08-13',
  attended: true,
};

describe('WorkRecordsService.create', () => {
  it('acquires the advisory lock before checking for an existing Work Record, inside a transaction', async () => {
    const { service, prisma, executeRaw, findFirst } = makeService({});

    await service.create(input);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(executeRaw).toHaveBeenCalled();
    expect(findFirst).toHaveBeenCalledWith({
      where: { teamMemberId: 'tm1', workDate: new Date('2026-08-13') },
      include: { teamMember: true },
    });
  });

  it('rejects with a 409 naming the Team Member, not a 500, when they already have a Work Record for that date (AC #1)', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'existing',
      teamMember: { name: 'Ravi Kumar' },
    });
    const { service } = makeService({ findFirst });

    await expect(service.create(input)).rejects.toThrow(
      /Ravi Kumar already has a Work Record/,
    );
  });

  it('translates a foreign-key violation (bad teamMemberId/siteId, P2003) into a clear 400', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2003', message: 'FK violation' });
    const create = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ create });

    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
});

describe('WorkRecordsService.createBatch', () => {
  it('processes crew members in teamMemberId-sorted order (deadlock-free lock ordering)', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ findFirst });

    await service.createBatch([
      { ...input, teamMemberId: 'zzz' },
      { ...input, teamMemberId: 'aaa' },
    ]);

    expect(findFirst.mock.calls[0]![0]).toMatchObject({
      where: { teamMemberId: 'aaa' },
    });
    expect(findFirst.mock.calls[1]![0]).toMatchObject({
      where: { teamMemberId: 'zzz' },
    });
  });

  it('rejects the whole batch with a 409 when any one member already has a Work Record for that date', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'existing',
      teamMember: { name: 'Ravi Kumar' },
    });
    const { service } = makeService({ findFirst });

    await expect(
      service.createBatch([input, { ...input, teamMemberId: 'tm2' }]),
    ).rejects.toThrow(ConflictException);
  });
});

describe('WorkRecordsService.list', () => {
  it('lists all Work Records, newest first, when no siteId is given', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { workRecord: { findMany } };
    const service = new WorkRecordsService(
      prisma as unknown as ConstructorParameters<typeof WorkRecordsService>[0],
    );

    await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      include: { teamMember: true, site: true },
      orderBy: { workDate: 'desc' },
    });
  });

  it('filters to a single Site when siteId is given (Story 6.3 AC #2)', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { workRecord: { findMany } };
    const service = new WorkRecordsService(
      prisma as unknown as ConstructorParameters<typeof WorkRecordsService>[0],
    );

    await service.list('site1');

    expect(findMany).toHaveBeenCalledWith({
      where: { siteId: 'site1' },
      include: { teamMember: true, site: true },
      orderBy: { workDate: 'desc' },
    });
  });
});

describe('WorkRecordsService.getDefaultCrew', () => {
  it("returns the prior date's crew — the most recent workDate before the given date, not literally date - 1", async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ workDate: new Date('2026-08-10') });
    const findMany = vi.fn().mockResolvedValue([
      {
        teamMemberId: 'tm1',
        attended: true,
        teamMember: { name: 'Ravi Kumar' },
      },
    ]);
    const prisma = { workRecord: { findFirst, findMany } };
    const service = new WorkRecordsService(
      prisma as unknown as ConstructorParameters<typeof WorkRecordsService>[0],
    );

    const result = await service.getDefaultCrew('site1', '2026-08-13');

    expect(findFirst).toHaveBeenCalledWith({
      where: { siteId: 'site1', workDate: { lt: new Date('2026-08-13') } },
      orderBy: { workDate: 'desc' },
      select: { workDate: true },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { siteId: 'site1', workDate: new Date('2026-08-10') },
      include: { teamMember: true },
    });
    expect(result).toEqual([
      { teamMemberId: 'tm1', name: 'Ravi Kumar', attended: true },
    ]);
  });

  it('returns an empty array when there is no prior Work Record for that Site', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const prisma = { workRecord: { findFirst, findMany: vi.fn() } };
    const service = new WorkRecordsService(
      prisma as unknown as ConstructorParameters<typeof WorkRecordsService>[0],
    );

    const result = await service.getDefaultCrew('site1', '2026-08-13');

    expect(result).toEqual([]);
  });
});
