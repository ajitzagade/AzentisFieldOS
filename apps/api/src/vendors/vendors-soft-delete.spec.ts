import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

// Story 15.3: the Vendor half of the soft-delete contract (the list filter
// itself is pinned in vendors.service.spec.ts).
function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const prisma = {
    vendor: { findUnique, update, findMany: vi.fn(), create: vi.fn() },
  };
  const service = new VendorsService(
    prisma as unknown as ConstructorParameters<typeof VendorsService>[0],
    {
      listByVendor: vi.fn(),
      summaryForVendor: vi.fn(),
    } as unknown as ConstructorParameters<typeof VendorsService>[1],
  );
  return { service, findUnique, update };
}

const DELETED_VENDOR = {
  id: 'v-1',
  name: 'Old Traders',
  deletedAt: new Date(),
};

describe('VendorsService soft delete', () => {
  it('findOne() 404s on a soft-deleted Vendor — which also gates purchases/purchase-summary', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_VENDOR),
    });

    await expect(service.findOne('v-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.purchases('v-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.purchaseSummary('v-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update() 404s on a soft-deleted Vendor — PATCH must not be a read/edit bypass', async () => {
    const { service, update } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_VENDOR),
    });

    await expect(
      service.update('v-1', { name: 'Renamed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('softDelete() stamps deletedAt (never hard-deletes) and 404s when already deleted', async () => {
    const live = { id: 'v-1', deletedAt: null };
    const update = vi
      .fn()
      .mockResolvedValue({ ...live, deletedAt: new Date() });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(live),
      update,
    });

    await service.softDelete('v-1');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'v-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
      data: { deletedAt: expect.any(Date) },
    });

    const { service: again } = makeService({
      findUnique: vi.fn().mockResolvedValue(DELETED_VENDOR),
    });
    await expect(again.softDelete('v-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('DELETE /vendors/:id authorization wiring', () => {
  it('carries @Roles(OWNER_ADMIN) metadata — the rule RolesGuard enforces with a 403', () => {
    const reflector = new Reflector();
    const roles = reflector.get<string[]>(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method reference, never invoking it
      VendorsController.prototype.remove,
    );
    expect(roles).toEqual(['OWNER_ADMIN']);
  });
});
