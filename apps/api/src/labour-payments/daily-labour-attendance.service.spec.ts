import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourAttendanceService } from './daily-labour-attendance.service';

function makeService(overrides: {
  attendanceCreate?: ReturnType<typeof vi.fn>;
  attendanceFindUnique?: ReturnType<typeof vi.fn>;
  advanceCreate?: ReturnType<typeof vi.fn>;
  labourerUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const attendanceCreate =
    overrides.attendanceCreate ?? vi.fn().mockResolvedValue({ id: 'att1' });
  const attendanceFindUnique = overrides.attendanceFindUnique ?? vi.fn();
  const advanceCreate =
    overrides.advanceCreate ?? vi.fn().mockResolvedValue({ id: 'adv1' });
  const labourerUpdateMany =
    overrides.labourerUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    dailyLabourAttendance: { create: attendanceCreate },
    dailyLabourAdvance: { create: advanceCreate },
    dailyLabourer: { updateMany: labourerUpdateMany },
  };

  const prisma = {
    dailyLabourAttendance: { findUnique: attendanceFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new DailyLabourAttendanceService(
    prisma as unknown as ConstructorParameters<
      typeof DailyLabourAttendanceService
    >[0],
  );

  return {
    service,
    prisma,
    attendanceCreate,
    advanceCreate,
    labourerUpdateMany,
  };
}

const createInput = {
  labourerId: 'l1',
  siteId: 's1',
  workDate: '2026-08-10',
  attended: true,
  perDayAmount: 800,
};

describe('DailyLabourAttendanceService.create', () => {
  it('creates the attendance row and does not touch the balance when no advance is embedded', async () => {
    const { service, attendanceCreate, advanceCreate, labourerUpdateMany } =
      makeService({});

    await service.create(createInput);

    expect(attendanceCreate).toHaveBeenCalledTimes(1);
    expect(advanceCreate).not.toHaveBeenCalled();
    expect(labourerUpdateMany).not.toHaveBeenCalled();
  });

  it('creates a linked Advance and increments the balance when the Advance checkbox is embedded', async () => {
    const { service, advanceCreate, labourerUpdateMany } = makeService({});

    await service.create({
      ...createInput,
      advance: { amount: 500, description: 'Medical' },
    });

    expect(advanceCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        labourerId: 'l1',
        amount: 500,
        description: 'Medical',
      }),
    });
    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: -500 } },
      data: { outstandingAdvanceBalance: { decrement: -500 } },
    });
  });

  it('rejects a correctsId that does not reference an existing Attendance row', async () => {
    const attendanceFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ attendanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'missing',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose labourerId doesn't match the original Attendance row", async () => {
    const attendanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'a-different-labourer' });
    const { service } = makeService({ attendanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'orig',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
