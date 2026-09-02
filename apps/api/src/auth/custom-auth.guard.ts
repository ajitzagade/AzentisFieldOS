import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { AuthUser } from './current-user.decorator';
import type { JwtPayload } from './auth.service';

// The single request-level authentication gate for apps/api, registered
// globally via APP_GUARD. Verifies the self-issued session JWT (signed at
// login by AuthService) rather than delegating to a third-party identity
// provider. On success it resolves the local User by id and attaches
// req.user; on any missing/malformed/invalid/expired token it throws
// UnauthorizedException (401), never falling back to a placeholder identity.
// Routes marked @Public() bypass it (health, login, cron).
@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthUser;
    }>();

    const header = request.headers?.authorization;
    const authorization = Array.isArray(header) ? header[0] : header;
    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException();
    }
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      // A malformed, tampered, or expired token — never leak the underlying
      // reason to the caller; a plain 401 is the whole contract.
      throw new UnauthorizedException();
    }

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException();
    }

    // Only id/role are ever read below (request.user is typed as AuthUser =
    // { id, role } everywhere it's consumed) — selecting the full row here
    // pulled passwordHash and every other column into memory on 100% of
    // authenticated traffic for no reason.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });
    // Unlike the old Clerk guard, there is no auto-provisioning here: login
    // already requires an existing User row, so a token whose subject no
    // longer resolves (deleted account) is simply unauthorized.
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = { id: user.id, role: user.role };
    return true;
  }
}
