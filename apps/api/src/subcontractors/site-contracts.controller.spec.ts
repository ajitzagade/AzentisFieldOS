import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { SiteContractsController } from './site-contracts.controller';
import { SiteContractsService } from './site-contracts.service';

describe('SiteContractsController', () => {
  let controller: SiteContractsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    outstandingSummary: ReturnType<typeof vi.fn>;
    countDraftPendingTerms: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      outstandingSummary: vi.fn(),
      countDraftPendingTerms: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteContractsController],
      providers: [{ provide: SiteContractsService, useValue: service }],
    }).compile();

    controller = module.get<SiteContractsController>(SiteContractsController);
  });

  it('create delegates to SiteContractsService.create with the validated body', async () => {
    const input = { siteId: 's1', subcontractorId: 'sc1' };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input as never);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list forwards siteId/subcontractorId/status filters to SiteContractsService.list as one object', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('s1', 'sc1', 'ACTIVE');

    expect(service.list).toHaveBeenCalledWith({
      siteId: 's1',
      subcontractorId: 'sc1',
      status: 'ACTIVE',
    });
  });

  it('findOne delegates to SiteContractsService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('update delegates to SiteContractsService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', status: 'ACTIVE' });

    const result = await controller.update('1', { status: 'ACTIVE' } as never);

    expect(service.update).toHaveBeenCalledWith('1', { status: 'ACTIVE' });
    expect(result).toEqual({ id: '1', status: 'ACTIVE' });
  });

  it('outstandingSummary delegates to SiteContractsService.outstandingSummary', async () => {
    service.outstandingSummary.mockResolvedValue({
      totalOutstanding: 62500,
      bySubcontractor: [],
    });

    const result = await controller.outstandingSummary();

    expect(service.outstandingSummary).toHaveBeenCalled();
    expect(result).toEqual({ totalOutstanding: 62500, bySubcontractor: [] });
  });

  it('countDraftPendingTerms delegates to SiteContractsService.countDraftPendingTerms', async () => {
    service.countDraftPendingTerms.mockResolvedValue(2);

    const result = await controller.countDraftPendingTerms();

    expect(service.countDraftPendingTerms).toHaveBeenCalled();
    expect(result).toBe(2);
  });
});

// Reading decorator metadata off a method reference (never invoking it) is
// safe and is the established pattern for these authorization-wiring tests
// (see subcontractors-soft-delete.spec.ts) — disabled file-wide rather than
// per-line, since eslint --fix's line-wrapping otherwise strands a
// disable-next-line comment on the wrong line and gets stripped as unused.
/* eslint-disable @typescript-eslint/unbound-method */
describe('SiteContractsController authorization wiring', () => {
  const reflector = new Reflector();

  it('create/update inherit the class-level OWNER_ADMIN restriction (no handler override)', () => {
    expect(reflector.get<string[]>(ROLES_KEY, SiteContractsController)).toEqual(
      ['OWNER_ADMIN'],
    );
    expect(
      reflector.get(ROLES_KEY, SiteContractsController.prototype.create),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, SiteContractsController.prototype.update),
    ).toBeUndefined();
  });

  it('list/findOne carry their own empty @Roles() override, opening them to both roles', () => {
    expect(
      reflector.get(ROLES_KEY, SiteContractsController.prototype.list),
    ).toEqual([]);
    expect(
      reflector.get(ROLES_KEY, SiteContractsController.prototype.findOne),
    ).toEqual([]);
  });

  it('outstandingSummary/countDraftPendingTerms also carry the empty @Roles() override', () => {
    expect(
      reflector.get(
        ROLES_KEY,
        SiteContractsController.prototype.outstandingSummary,
      ),
    ).toEqual([]);
    expect(
      reflector.get(
        ROLES_KEY,
        SiteContractsController.prototype.countDraftPendingTerms,
      ),
    ).toEqual([]);
  });
});
