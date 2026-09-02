import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { SubcontractorsController } from './subcontractors.controller';
import { SubcontractorsService } from './subcontractors.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const prisma = {
    subcontractor: { findUnique, update, findMany: vi.fn(), create: vi.fn() },
  };
  const service = new SubcontractorsService(
    prisma as unknown as ConstructorParameters<typeof SubcontractorsService>[0],
    { list: vi.fn() } as unknown as ConstructorParameters<
      typeof SubcontractorsService
    >[1],
  );
  return { service, findUnique, update };
}

const DELETED_SUBCONTRACTOR = {
  id: 's-1',
  name: 'Old Works',
  deletedAt: new Date(),
};

describe('SubcontractorsService soft delete', () => {
  it('findOne() 404s on a soft-deleted Subcontractor', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_SUBCONTRACTOR),
    });

    await expect(service.findOne('s-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update() 404s on a soft-deleted Subcontractor — PATCH must not be a read/edit bypass', async () => {
    const { service, update } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_SUBCONTRACTOR),
    });

    await expect(
      service.update('s-1', { name: 'Renamed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('softDelete() stamps deletedAt (never hard-deletes) and 404s when already deleted', async () => {
    const live = { id: 's-1', deletedAt: null };
    const update = vi
      .fn()
      .mockResolvedValue({ ...live, deletedAt: new Date() });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(live),
      update,
    });

    await service.softDelete('s-1');
    expect(update).toHaveBeenCalledWith({
      where: { id: 's-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
      data: { deletedAt: expect.any(Date) },
    });

    const { service: again } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_SUBCONTRACTOR),
    });
    await expect(again.softDelete('s-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('DELETE /subcontractors/:id authorization wiring', () => {
  it('carries @Roles(OWNER_ADMIN) metadata — the rule RolesGuard enforces with a 403', () => {
    const reflector = new Reflector();
    const roles = reflector.get<string[]>(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method reference, never invoking it
      SubcontractorsController.prototype.remove,
    );
    expect(roles).toEqual(['OWNER_ADMIN']);
  });
});
