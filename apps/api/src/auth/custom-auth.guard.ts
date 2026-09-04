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
import { SAFE_USER_SELECT } from './safe-user-select';

// Perf review 2026-09-03: every navigation fans out several authedFetch
// calls, and each one used to cost its own `user.findUnique` — a page that
// fires 4 requests paid for 4 identical DB round-trips just to re-confirm
// the same caller. This TTL cache (registered singleton via APP_GUARD, one
// instance per warm server process — see app.module.ts, no Scope.REQUEST)
// collapses that to one DB hit per user per window. 5s deliberately trades
// a small revocation-latency window (a just-deactivated/role-changed user
// stays authorized for up to 5s more) for cutting the dominant per-request
// cost on every page load; product-accepted tradeoff, not an oversight.
const USER_CACHE_TTL_MS = 5_000;

interface CachedUser {
  user: AuthUser;
  expiresAt: number;
}

// The single request-level authentication gate for apps/api, registered
// globally via APP_GUARD. Verifies the self-issued session JWT (signed at
// login by AuthService) rather than delegating to a third-party identity
// provider. On success it resolves the local User by id and attaches
// req.user; on any missing/malformed/invalid/expired token it throws
// UnauthorizedException (401), never falling back to a placeholder identity.
// Routes marked @Public() bypass it (health, login, cron).
@Injectable()
export class CustomAuthGuard implements CanActivate {
  // Keyed by user id, not by token — every token for the same user shares
  // one cache entry. Unbounded but harmless: a single-tenant deployment's
  // total distinct user count (Owners + Supervisors) is small, and entries
  // naturally get overwritten (not accumulated) on every re-lookup.
  private readonly userCache = new Map<string, CachedUser>();
  // Code review 2026-09-04: a page firing several authedFetch calls at
  // once can land multiple requests for the SAME not-yet-cached user in
  // the same tick — without this, each one independently misses userCache
  // and fires its own findUnique before any of them finish populating the
  // cache, undercutting the very savings this guard exists to provide.
  // Concurrent lookups for the same subject now share one in-flight
  // promise instead.
  private readonly pendingLookups = new Map<string, Promise<AuthUser | null>>();

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

    const cached = this.userCache.get(payload.sub);
    const user =
      cached && cached.expiresAt > Date.now()
        ? cached.user
        : await this.lookupUser(payload.sub);
    // Unlike the old Clerk guard, there is no auto-provisioning here: login
    // already requires an existing User row, so a token whose subject no
    // longer resolves (deleted account) is simply unauthorized.
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;
    return true;
  }

  // id/role are the only fields every other route reads (request.user is
  // typed as AuthUser everywhere it's consumed downstream) — the rest of
  // SAFE_USER_SELECT exists solely so GET /users/me can return the
  // caller's own safe profile without a second DB round-trip; it's the
  // same single indexed PK lookup either way, never passwordHash.
  private lookupUser(sub: string): Promise<AuthUser | null> {
    const pending = this.pendingLookups.get(sub);
    if (pending) return pending;

    const lookup = this.prisma.user
      .findUnique({ where: { id: sub }, select: SAFE_USER_SELECT })
      .then((user) => {
        if (user) {
          this.userCache.set(sub, {
            user,
            expiresAt: Date.now() + USER_CACHE_TTL_MS,
          });
        } else {
          this.userCache.delete(sub);
        }
        return user;
      })
      .finally(() => {
        this.pendingLookups.delete(sub);
      });

    this.pendingLookups.set(sub, lookup);
    return lookup;
  }
}
