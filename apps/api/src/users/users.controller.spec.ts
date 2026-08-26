import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../auth/current-user.decorator';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController (delegation)', () => {
  let controller: UsersController;
  let service: {
    getMe: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    invite: ReturnType<typeof vi.fn>;
    updateRole: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getMe: vi.fn(),
      list: vi.fn(),
      invite: vi.fn(),
      updateRole: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('me delegates to UsersService.getMe with the current user id', async () => {
    service.getMe.mockResolvedValue({ id: 'u1', name: 'A', email: 'a@x.in', role: 'OWNER_ADMIN' });
    const user: AuthUser = { id: 'u1', clerkId: 'c1', role: 'OWNER_ADMIN' };

    const result = await controller.me(user);

    expect(service.getMe).toHaveBeenCalledWith('u1');
    expect(result).toMatchObject({ id: 'u1', role: 'OWNER_ADMIN' });
  });

  it('list delegates to UsersService.list', async () => {
    service.list.mockResolvedValue([]);
    await controller.list();
    expect(service.list).toHaveBeenCalled();
  });

  it('invite delegates to UsersService.invite with the validated body', async () => {
    service.invite.mockResolvedValue({ id: 'inv1' });
    await controller.invite({ email: 'new@x.in', role: 'SITE_SUPERVISOR' });
    expect(service.invite).toHaveBeenCalledWith({ email: 'new@x.in', role: 'SITE_SUPERVISOR' });
  });

  it('updateRole delegates to UsersService.updateRole with the id and validated body', async () => {
    service.updateRole.mockResolvedValue({ id: 'u1', role: 'OWNER_ADMIN' });
    await controller.updateRole('u1', { role: 'OWNER_ADMIN' });
    expect(service.updateRole).toHaveBeenCalledWith('u1', { role: 'OWNER_ADMIN' });
  });
});
