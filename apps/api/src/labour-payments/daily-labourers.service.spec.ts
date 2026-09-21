import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourersService } from './daily-labourers.service';

function makeService(
  overrides: {
    create?: ReturnType<typeof vi.fn>;
    findMany?: ReturnType<typeof vi.fn>;
    findUnique?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const prisma = {
    dailyLabourer: {
      create: overrides.create ?? vi.fn().mockResolvedValue({ id: 'l1' }),
      findMany: overrides.findMany ?? vi.fn().mockResolvedValue([]),
      findUnique: overrides.findUnique ?? vi.fn(),
    },
  };
  return {
    service: new DailyLabourersService(
      prisma as unknown as ConstructorParameters<
        typeof DailyLabourersService
      >[0],
    ),
    prisma,
  };
}

describe('DailyLabourersService', () => {
  it('create passes the input straight through to dailyLabourer.create', async () => {
    const { service, prisma } = makeService();
    const input = { name: 'Ramesh', category: 'Mason', isActive: true };

    await service.create(input);

    expect(prisma.dailyLabourer.create).toHaveBeenCalledWith({ data: input });
  });

  it('list orders by name ascending', async () => {
    const { service, prisma } = makeService();

    await service.list();

    expect(prisma.dailyLabourer.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('findOne throws NotFoundException when no Labourer matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
