import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

// Story 15.3: the soft-delete contract — hidden from lists, direct reads
// AND writes 404, deletedAt stamped (never a hard DELETE), Owner-only.
function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const prisma = { site: { findUnique, update, findMany, create: vi.fn() } };
  const service = new SitesService(
    prisma as unknown as ConstructorParameters<typeof SitesService>[0],
    {} as unknown as ConstructorParameters<typeof SitesService>[1],
  );
  return { service, findUnique, update, findMany };
}

const DELETED_SITE = {
  id: 's-1',
  name: 'Old Site',
  deletedAt: new Date('2026-08-30'),
};

describe('SitesService soft delete', () => {
  it('list() hides soft-deleted Sites (the filter every picker depends on)', async () => {
    const { service, findMany } = makeService({});

    await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('list(status) keeps the deletedAt filter alongside the status filter', async () => {
    const { service, findMany } = makeService({});

    await service.list('ACTIVE');

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findOne() 404s on a soft-deleted Site (direct-read contract)', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_SITE),
    });

    await expect(service.findOne('s-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update() 404s on a soft-deleted Site — PATCH must not be a read/edit bypass', async () => {
    const { service, update } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_SITE),
    });

    await expect(
      service.update('s-1', { name: 'Renamed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('softDelete() stamps deletedAt — never a hard delete — and 404s when already deleted', async () => {
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
      findUnique: vi.fn().mockResolvedValue(DELETED_SITE),
    });
    await expect(again.softDelete('s-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('DELETE /sites/:id authorization wiring', () => {
  it('carries @Roles(OWNER_ADMIN) metadata — the rule RolesGuard enforces with a 403', () => {
    const reflector = new Reflector();
    const roles = reflector.get<string[]>(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method reference, never invoking it
      SitesController.prototype.remove,
    );
    expect(roles).toEqual(['OWNER_ADMIN']);
  });
});
