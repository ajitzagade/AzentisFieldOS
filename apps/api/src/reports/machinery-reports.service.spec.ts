import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MachineryVehicleReportsService } from './machinery-reports.service';

function makeService() {
  const machinery = {
    list: vi.fn().mockResolvedValue([]),
    findOne: vi.fn(),
  };
  const vehicle = {
    list: vi.fn().mockResolvedValue([]),
    findOne: vi.fn(),
  };
  const assetMovements = { list: vi.fn().mockResolvedValue([]) };
  const assetServiceLogs = { list: vi.fn().mockResolvedValue([]) };
  const service = new MachineryVehicleReportsService(
    machinery as never,
    vehicle as never,
    assetMovements as never,
    assetServiceLogs as never,
  );
  return { service, machinery, vehicle, assetMovements, assetServiceLogs };
}

describe('MachineryVehicleReportsService.getMachineryReport (FR-45)', () => {
  it('composes the register only when no asset is selected — movement/service history stay empty (no per-asset read)', async () => {
    const ctx = makeService();
    ctx.machinery.list.mockResolvedValue([{ id: 'm1' }]);
    ctx.vehicle.list.mockResolvedValue([{ id: 'v1' }]);

    const result = await ctx.service.getMachineryReport({
      from: '2026-08-01',
      to: '2026-08-31',
    });

    expect(ctx.machinery.findOne).not.toHaveBeenCalled();
    expect(ctx.vehicle.findOne).not.toHaveBeenCalled();
    expect(ctx.assetMovements.list).not.toHaveBeenCalled();
    expect(ctx.assetServiceLogs.list).not.toHaveBeenCalled();
    expect(result).toEqual({
      machinery: [{ id: 'm1' }],
      vehicles: [{ id: 'v1' }],
      asset: null,
      movements: [],
      serviceLogs: [],
    });
  });

  it('drills into a selected Machine — findOne + movement/service history threaded with the window', async () => {
    const ctx = makeService();
    ctx.machinery.findOne.mockResolvedValue({ id: 'm1', name: 'Excavator' });
    ctx.assetMovements.list.mockResolvedValue([{ id: 'mov1' }]);
    ctx.assetServiceLogs.list.mockResolvedValue([{ id: 'svc1' }]);

    const result = await ctx.service.getMachineryReport({
      assetType: 'MACHINERY',
      assetId: 'm1',
      from: '2026-08-01',
      to: '2026-08-31',
    });

    expect(ctx.machinery.findOne).toHaveBeenCalledWith('m1');
    expect(ctx.vehicle.findOne).not.toHaveBeenCalled();
    expect(ctx.assetMovements.list).toHaveBeenCalledWith('MACHINERY', 'm1', {
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(ctx.assetServiceLogs.list).toHaveBeenCalledWith('MACHINERY', 'm1', {
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(result.asset).toEqual({ id: 'm1', name: 'Excavator' });
    expect(result.movements).toEqual([{ id: 'mov1' }]);
    expect(result.serviceLogs).toEqual([{ id: 'svc1' }]);
  });

  it('drills into a selected Vehicle via the VEHICLE delegate', async () => {
    const ctx = makeService();
    ctx.vehicle.findOne.mockResolvedValue({
      id: 'v1',
      number: 'MH-12-AB-1234',
    });

    const result = await ctx.service.getMachineryReport({
      assetType: 'VEHICLE',
      assetId: 'v1',
    });

    expect(ctx.vehicle.findOne).toHaveBeenCalledWith('v1');
    expect(ctx.machinery.findOne).not.toHaveBeenCalled();
    expect(ctx.assetMovements.list).toHaveBeenCalledWith('VEHICLE', 'v1', {
      from: undefined,
      to: undefined,
    });
    expect(ctx.assetServiceLogs.list).toHaveBeenCalledWith('VEHICLE', 'v1', {
      from: undefined,
      to: undefined,
    });
    expect(result.asset).toEqual({ id: 'v1', number: 'MH-12-AB-1234' });
  });

  it('404s when the selected asset does not exist (same as the Site report)', async () => {
    const ctx = makeService();
    ctx.machinery.findOne.mockRejectedValue(
      new NotFoundException('Machinery ghost not found'),
    );

    await expect(
      ctx.service.getMachineryReport({
        assetType: 'MACHINERY',
        assetId: 'ghost',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
