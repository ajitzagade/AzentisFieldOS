import { describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController.login', () => {
  it('delegates the already-validated body straight to AuthService.login', async () => {
    const login = vi
      .fn()
      .mockResolvedValue({ token: 'signed-jwt', refreshToken: 'raw-refresh' });
    const controller = new AuthController({ login } as unknown as AuthService);

    const result = await controller.login({
      email: 'owner@example.com',
      password: 'correct-password',
    });

    expect(login).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'correct-password',
    });
    expect(result).toEqual({
      token: 'signed-jwt',
      refreshToken: 'raw-refresh',
    });
  });
});

describe('AuthController.refresh', () => {
  it('delegates the raw refresh token straight to AuthService.refresh', async () => {
    const refresh = vi
      .fn()
      .mockResolvedValue({ token: 'new-jwt', refreshToken: 'new-refresh' });
    const controller = new AuthController({
      refresh,
    } as unknown as AuthService);

    const result = await controller.refresh({ refreshToken: 'old-refresh' });

    expect(refresh).toHaveBeenCalledWith('old-refresh');
    expect(result).toEqual({ token: 'new-jwt', refreshToken: 'new-refresh' });
  });
});

describe('AuthController.logout', () => {
  it('delegates the raw refresh token straight to AuthService.logout', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const controller = new AuthController({ logout } as unknown as AuthService);

    await controller.logout({ refreshToken: 'old-refresh' });

    expect(logout).toHaveBeenCalledWith('old-refresh');
  });
});
