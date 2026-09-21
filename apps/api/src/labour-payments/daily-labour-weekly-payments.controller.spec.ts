import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { DailyLabourWeeklyPaymentsController } from './daily-labour-weekly-payments.controller';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

describe('DailyLabourWeeklyPaymentsController', () => {
  let controller: DailyLabourWeeklyPaymentsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    listForLabourer: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), listForLabourer: vi.fn(), findOne: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLabourWeeklyPaymentsController],
      providers: [
        { provide: DailyLabourWeeklyPaymentsService, useValue: service },
      ],
    }).compile();
    controller = module.get<DailyLabourWeeklyPaymentsController>(
      DailyLabourWeeklyPaymentsController,
    );
  });

  // Money-movement settlement is the boundary this module's Owner-gating
  // depends on — pin the metadata so deleting the decorator fails a test,
  // same convention as purchases.controller.spec's completePricing check.
  it('create is restricted to OWNER_ADMIN via @Roles metadata', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      DailyLabourWeeklyPaymentsController.prototype.create,
    ) as string[] | undefined;
    expect(roles).toEqual(['OWNER_ADMIN']);
  });

  it('create delegates to the service', async () => {
    const input = {
      labourerId: 'l1',
      weekStartDate: '2026-08-10',
      amountPaid: 2400,
      status: 'PAID' as const,
    };
    service.create.mockResolvedValue({ id: 'pay1' });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 'pay1' });
  });

  it('list delegates labourerId to the service', async () => {
    service.listForLabourer.mockResolvedValue([{ id: 'pay1' }]);

    const result = await controller.list('l1');

    expect(service.listForLabourer).toHaveBeenCalledWith('l1');
    expect(result).toEqual([{ id: 'pay1' }]);
  });
});
