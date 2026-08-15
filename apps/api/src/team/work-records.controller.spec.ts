import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createWorkRecordBatchSchema,
  createWorkRecordSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { WorkRecordsController } from './work-records.controller';
import { WorkRecordsService } from './work-records.service';

describe('WorkRecordsController', () => {
  let controller: WorkRecordsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    createBatch: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    getDefaultCrew: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      createBatch: vi.fn(),
      list: vi.fn(),
      getDefaultCrew: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkRecordsController],
      providers: [{ provide: WorkRecordsService, useValue: service }],
    }).compile();

    controller = module.get<WorkRecordsController>(WorkRecordsController);
  });

  it('create delegates to WorkRecordsService.create with the validated body', async () => {
    const input = {
      teamMemberId: '11111111-1111-4111-8111-111111111111',
      siteId: '22222222-2222-4222-8222-222222222222',
      workDate: '2026-08-13',
      attended: true,
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('createBatch delegates to WorkRecordsService.createBatch with the validated body', async () => {
    const input = [
      {
        teamMemberId: '11111111-1111-4111-8111-111111111111',
        siteId: '22222222-2222-4222-8222-222222222222',
        workDate: '2026-08-13',
        attended: true,
      },
    ];
    service.createBatch.mockResolvedValue([{ id: '1' }]);

    const result = await controller.createBatch(input);

    expect(service.createBatch).toHaveBeenCalledWith(input);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list delegates to WorkRecordsService.list with no siteId when none is given', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalledWith(undefined);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list delegates to WorkRecordsService.list with the siteId query param when given', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list('site1');

    expect(service.list).toHaveBeenCalledWith('site1');
    expect(result).toEqual([{ id: '1' }]);
  });

  it('getDefaultCrew delegates to WorkRecordsService.getDefaultCrew with the query params', async () => {
    service.getDefaultCrew.mockResolvedValue([
      { teamMemberId: 'tm1', name: 'Ravi Kumar', attended: true },
    ]);

    const result = await controller.getDefaultCrew('site1', '2026-08-13');

    expect(service.getDefaultCrew).toHaveBeenCalledWith('site1', '2026-08-13');
    expect(result).toEqual([
      { teamMemberId: 'tm1', name: 'Ravi Kumar', attended: true },
    ]);
  });
});

describe('ZodValidationPipe(createWorkRecordSchema)', () => {
  const pipe = new ZodValidationPipe(createWorkRecordSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body, defaulting attended to true', () => {
    expect(
      pipe.transform({
        teamMemberId: '11111111-1111-4111-8111-111111111111',
        siteId: '22222222-2222-4222-8222-222222222222',
        workDate: '2026-08-13',
      }),
    ).toMatchObject({
      attended: true,
    });
  });

  it('rejects negative hours/overtimeHours', () => {
    expect(() =>
      pipe.transform({
        teamMemberId: '11111111-1111-4111-8111-111111111111',
        siteId: '22222222-2222-4222-8222-222222222222',
        workDate: '2026-08-13',
        hours: -1,
      }),
    ).toThrow(BadRequestException);
  });
});

describe('ZodValidationPipe(createWorkRecordBatchSchema)', () => {
  const pipe = new ZodValidationPipe(createWorkRecordBatchSchema);
  const record = {
    teamMemberId: '11111111-1111-4111-8111-111111111111',
    siteId: '22222222-2222-4222-8222-222222222222',
    workDate: '2026-08-13',
  };

  it('rejects an empty array', () => {
    expect(() => pipe.transform([])).toThrow(BadRequestException);
  });

  it('accepts a single-item array', () => {
    expect(() => pipe.transform([record])).not.toThrow();
  });

  it('accepts a multi-item batch when every record shares the same Site and date', () => {
    expect(() =>
      pipe.transform([
        record,
        { ...record, teamMemberId: '33333333-3333-4333-8333-333333333333' },
      ]),
    ).not.toThrow();
  });

  it('rejects a batch mixing Sites', () => {
    expect(() =>
      pipe.transform([
        record,
        {
          ...record,
          teamMemberId: '33333333-3333-4333-8333-333333333333',
          siteId: '44444444-4444-4444-8444-444444444444',
        },
      ]),
    ).toThrow(BadRequestException);
  });

  it('rejects a batch mixing dates', () => {
    expect(() =>
      pipe.transform([
        record,
        {
          ...record,
          teamMemberId: '33333333-3333-4333-8333-333333333333',
          workDate: '2026-08-14',
        },
      ]),
    ).toThrow(BadRequestException);
  });
});
