import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../generated/prisma/client';
import { ROLES_KEY } from './roles.decorator';
import type { AuthUser } from './current-user.decorator';

// Story 14.2 (FR-48): the authZ half. Guards run global-first, so the global
// ClerkAuthGuard (Story 1.8) has already authenticated the caller and attached
// req.user by the time this controller-scoped guard runs. A handler with no
// @Roles() metadata is unrestricted (any authenticated user) — that is how
// GET /users/me stays open to everyone while the Users-admin endpoints, marked
// @Roles('OWNER_ADMIN'), reject a Site Supervisor with 403. The check reads
// the real resolved role, never a UI hint — a direct API call is blocked too.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser }>();
    const role = request.user?.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
