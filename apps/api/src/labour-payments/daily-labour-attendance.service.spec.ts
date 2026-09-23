import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourAttendanceService } from './daily-labour-attendance.service';

function makeService(overrides: {
  attendanceCreate?: ReturnType<typeof vi.fn>;
  attendanceFindUnique?: ReturnType<typeof vi.fn>;
  attendanceFindMany?: ReturnType<typeof vi.fn>;
  attendanceFindFirst?: ReturnType<typeof vi.fn>;
  advanceCreate?: ReturnType<typeof vi.fn>;
  labourerUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const attendanceCreate =
    overrides.attendanceCreate ?? vi.fn().mockResolvedValue({ id: 'att1' });
  const attendanceFindUnique = overrides.attendanceFindUnique ?? vi.fn();
  const attendanceFindMany =
    overrides.attendanceFindMany ?? vi.fn().mockResolvedValue([]);
  const attendanceFindFirst =
    overrides.attendanceFindFirst ?? vi.fn().mockResolvedValue(null);
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
    dailyLabourAttendance: {
      findUnique: attendanceFindUnique,
      findMany: attendanceFindMany,
      findFirst: attendanceFindFirst,
    },
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
    attendanceFindFirst,
    advanceCreate,
    labourerUpdateMany,
  };
}

const createInput = {
  labourerId: 'l1',
  siteId: 's1',
  workDate: '2026-08-10',
  shift: 'DAY' as const,
  isHalfDay: false,
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
    const attendanceFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      labourerId: 'a-different-labourer',
      shift: 'DAY',
    });
    const { service } = makeService({ attendanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'orig',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose shift doesn't match the original Attendance row's shift", async () => {
    const attendanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'l1', shift: 'NIGHT' });
    const { service } = makeService({ attendanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        shift: 'DAY',
        correctsId: 'orig',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts a correction whose shift matches the original Attendance row', async () => {
    const attendanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'l1', shift: 'DAY' });
    const { service, attendanceCreate } = makeService({ attendanceFindUnique });

    await service.create({
      ...createInput,
      shift: 'DAY',
      correctsId: 'orig',
      correctionReason: 'x',
    });

    expect(attendanceCreate).toHaveBeenCalledTimes(1);
  });

  it('rejects a fresh (non-correcting) create when a current row already exists for the same labourer/date/shift', async () => {
    const attendanceFindFirst = vi.fn().mockResolvedValue({ id: 'existing' });
    const { service } = makeService({ attendanceFindFirst });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('allows a fresh Night create even when a Day row already exists for the same labourer/date (different shift)', async () => {
    // findFirst is scoped by shift in the where clause — simulate that by
    // only resolving a match when queried for the same shift as the input.
    const attendanceFindFirst = vi.fn().mockResolvedValue(null);
    const { service, attendanceCreate } = makeService({ attendanceFindFirst });

    await service.create({ ...createInput, shift: 'NIGHT' });

    expect(attendanceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ shift: 'NIGHT' }),
      }),
    );
    expect(attendanceCreate).toHaveBeenCalledTimes(1);
  });

  it('allows a fresh Day create for a DIFFERENT Site even when a Day row already exists for the same labourer/date/shift at another Site', async () => {
    // The model's doc comment says "One row per Labourer per Site per date
    // per shift" — the guard's findFirst must be scoped by siteId, so it
    // resolves null (no match) when queried for a different Site than the
    // one an existing row belongs to.
    const attendanceFindFirst = vi.fn().mockResolvedValue(null);
    const { service, attendanceCreate } = makeService({ attendanceFindFirst });

    await service.create({ ...createInput, siteId: 's2' });

    expect(attendanceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ siteId: 's2' }),
      }),
    );
    expect(attendanceCreate).toHaveBeenCalledTimes(1);
  });

  it('does not run the duplicate-shift guard for a correction', async () => {
    const attendanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'l1', shift: 'DAY' });
    const attendanceFindFirst = vi.fn();
    const { service } = makeService({
      attendanceFindUnique,
      attendanceFindFirst,
    });

    await service.create({
      ...createInput,
      correctsId: 'orig',
      correctionReason: 'x',
    });

    expect(attendanceFindFirst).not.toHaveBeenCalled();
  });
});
