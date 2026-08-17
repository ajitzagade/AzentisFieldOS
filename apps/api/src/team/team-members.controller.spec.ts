import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';

describe('TeamMembersController', () => {
  let controller: TeamMembersController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getWorkHistory: ReturnType<typeof vi.fn>;
    getTeamSummary: ReturnType<typeof vi.fn>;
    getOutstandingAdvances: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      getWorkHistory: vi.fn(),
      getTeamSummary: vi.fn(),
      getOutstandingAdvances: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMembersController],
      providers: [{ provide: TeamMembersService, useValue: service }],
    }).compile();

    controller = module.get<TeamMembersController>(TeamMembersController);
  });

  it('create delegates to TeamMembersService.create with the validated body', async () => {
    const input = {
      name: 'Ravi Kumar',
      employmentTypeId: '11111111-1111-4111-8111-111111111111',
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to TeamMembersService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Ravi Kumar' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Ravi Kumar' }]);
  });

  it('findOne delegates to TeamMembersService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: '1', name: 'Ravi Kumar' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'Ravi Kumar' });
  });

  it('update delegates to TeamMembersService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
  });

  it('getWorkHistory delegates to TeamMembersService.getWorkHistory with the id', async () => {
    service.getWorkHistory.mockResolvedValue([{ id: 'wr1' }]);

    const result = await controller.getWorkHistory('1');

    expect(service.getWorkHistory).toHaveBeenCalledWith('1');
    expect(result).toEqual([{ id: 'wr1' }]);
  });

  it('getTeamSummary delegates to TeamMembersService.getTeamSummary', async () => {
    service.getTeamSummary.mockResolvedValue({ totalTeamMembers: 4 });

    const result = await controller.getTeamSummary();

    expect(service.getTeamSummary).toHaveBeenCalled();
    expect(result).toEqual({ totalTeamMembers: 4 });
  });

  it('getOutstandingAdvances delegates to TeamMembersService.getOutstandingAdvances', async () => {
    service.getOutstandingAdvances.mockResolvedValue({
      total: 10500,
      byTeamMember: [],
    });

    const result = await controller.getOutstandingAdvances();

    expect(service.getOutstandingAdvances).toHaveBeenCalled();
    expect(result).toEqual({ total: 10500, byTeamMember: [] });
  });
});

describe('ZodValidationPipe(createTeamMemberSchema)', () => {
  const pipe = new ZodValidationPipe(createTeamMemberSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body with only the required fields', () => {
    expect(() =>
      pipe.transform({
        name: 'Ravi Kumar',
        employmentTypeId: '11111111-1111-4111-8111-111111111111',
      }),
    ).not.toThrow();
  });

  it('accepts optional designation/contact', () => {
    expect(() =>
      pipe.transform({
        name: 'Ravi Kumar',
        designation: 'Mason',
        contact: '+91 98765 43210',
        employmentTypeId: '11111111-1111-4111-8111-111111111111',
      }),
    ).not.toThrow();
  });

  it('rejects a non-uuid employmentTypeId', () => {
    expect(() =>
      pipe.transform({ name: 'Ravi Kumar', employmentTypeId: 'not-a-uuid' }),
    ).toThrow(BadRequestException);
  });
});

describe('ZodValidationPipe(updateTeamMemberSchema)', () => {
  const pipe = new ZodValidationPipe(updateTeamMemberSchema);

  it('accepts an empty body as a true no-op — does not silently re-enable isActive', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a partial body with only isActive set', () => {
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });
});
