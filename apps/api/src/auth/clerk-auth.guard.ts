import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { Prisma, type Role, type User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { AuthUser } from './current-user.decorator';

type VerifiedClaims = Awaited<ReturnType<typeof verifyToken>>;

// Story 1.8 (AC #1, #2, #5): the single request-level authentication gate for
// apps/api, registered globally via APP_GUARD. It NEVER hand-rolls JWT/crypto
// (AD-10) — verification is delegated entirely to Clerk's backend SDK
// (`verifyToken`). On success it resolves (or provisions) the local User by
// clerkId and attaches req.user; on any missing/malformed/invalid/expired
// token it throws UnauthorizedException (401), never falling back to a
// placeholder identity. Routes marked @Public() bypass it (health + cron).
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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

    let claims: VerifiedClaims;
    try {
      claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch {
      // A malformed, tampered, or expired token — never leak the underlying
      // reason to the caller; a plain 401 is the whole contract (AC #2).
      throw new UnauthorizedException();
    }

    const user = await this.resolveUser(claims);
    request.user = { id: user.id, clerkId: user.clerkId, role: user.role };
    return true;
  }

  // AC #1: resolve the local User by clerkId, provisioning one on first sight
  // with name/email from the verified claims. Story 14.2 will own the Clerk
  // webhook that becomes the primary user-creator (carrying an
  // invitation-metadata role); until then this upsert is the provisioner, and
  // afterwards it degrades to a safe resolver/fallback for any user the
  // webhook has not created yet.
  private async resolveUser(claims: VerifiedClaims): Promise<User> {
    // A verified session token always carries a non-empty `sub` (the Clerk
    // user id); if it somehow doesn't (a non-session token type, a malformed
    // claim), refuse rather than key User rows off an `undefined` clerkId —
    // a bad token is a clean 401 (AC #2), never a corrupt row or opaque 500.
    const clerkId = claims.sub;
    if (typeof clerkId !== 'string' || clerkId.length === 0) {
      throw new UnauthorizedException();
    }
    const existing = await this.prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;

    // Default role for a never-seen user (AD-11 — only the two schema roles
    // exist, never invent a third): the very first User in the database is the
    // Owner/Admin who sets the tenant up; everyone provisioned after them
    // defaults to Site Supervisor. This aligns with Epic 14 Story 14.2's
    // invitation intent, which will later assign roles explicitly.
    const isFirstUser = (await this.prisma.user.count()) === 0;
    const role: Role = isFirstUser ? 'OWNER_ADMIN' : 'SITE_SUPERVISOR';

    try {
      return await this.prisma.user.create({
        data: {
          clerkId,
          name: claimName(claims) ?? 'User',
          email: claimEmail(claims) ?? `${clerkId}@users.noreply.local`,
          role,
        },
      });
    } catch (error) {
      // Two concurrent first-requests for the SAME new user can both miss the
      // findUnique above; the loser's create() throws P2002 on the unique
      // `clerkId` — re-fetch the winner's row by clerkId rather than 500.
      // (Clerk guarantees one email per user, so a cross-clerkId email
      // collision is not an expected path here.)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.user.findUniqueOrThrow({ where: { clerkId } });
      }
      throw error;
    }
  }
}

function claimString(claims: VerifiedClaims, key: string): string | undefined {
  const value = (claims as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function claimEmail(claims: VerifiedClaims): string | undefined {
  return (
    claimString(claims, 'email') ??
    claimString(claims, 'email_address') ??
    claimString(claims, 'primary_email_address')
  );
}

function claimName(claims: VerifiedClaims): string | undefined {
  const full = claimString(claims, 'name') ?? claimString(claims, 'full_name');
  if (full) return full;
  const first =
    claimString(claims, 'first_name') ?? claimString(claims, 'firstName');
  const last =
    claimString(claims, 'last_name') ?? claimString(claims, 'lastName');
  const composed = [first, last].filter(Boolean).join(' ').trim();
  return composed.length > 0 ? composed : undefined;
}
