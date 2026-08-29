import { describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController.login', () => {
  it('delegates the already-validated body straight to AuthService.login', async () => {
    const login = vi.fn().mockResolvedValue({ token: 'signed-jwt' });
    const controller = new AuthController({ login } as unknown as AuthService);

    const result = await controller.login({
      email: 'owner@example.com',
      password: 'correct-password',
    });

    expect(login).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'correct-password',
    });
    expect(result).toEqual({ token: 'signed-jwt' });
  });
});
