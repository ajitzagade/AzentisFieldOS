import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { Role } from '../generated/prisma/client';
import { RolesGuard } from './roles.guard';

function makeContext(role: Role | undefined): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 'u1', clerkId: 'c1', role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

function makeGuard(required: Role[] | undefined) {
  const reflector = new Reflector();
  vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(required);
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows a handler with no @Roles metadata (open to any authenticated user — e.g. /users/me)', () => {
    const guard = makeGuard(undefined);
    expect(guard.canActivate(makeContext('SITE_SUPERVISOR'))).toBe(true);
  });

  it('allows an OWNER_ADMIN through an OWNER_ADMIN-only handler', () => {
    const guard = makeGuard(['OWNER_ADMIN']);
    expect(guard.canActivate(makeContext('OWNER_ADMIN'))).toBe(true);
  });

  it('rejects a SITE_SUPERVISOR from an OWNER_ADMIN-only handler with 403', () => {
    const guard = makeGuard(['OWNER_ADMIN']);
    expect(() => guard.canActivate(makeContext('SITE_SUPERVISOR'))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects when no user is resolved on the request', () => {
    const guard = makeGuard(['OWNER_ADMIN']);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
