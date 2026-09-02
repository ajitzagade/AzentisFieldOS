import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { LoginInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  role: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Always returns the same generic failure for "no such email" and "wrong
  // password" — never lets a caller distinguish which one was wrong
  // (enumeration-safe, the same principle the old Clerk-error mapping on the
  // frontend already established).
  async login({ email, password }: LoginInput): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = await this.signAccessToken(user.id, user.role);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { token, refreshToken };
  }

  private async signAccessToken(userId: string, role: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, role };
    return this.jwtService.signAsync(payload);
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
    return raw;
  }

  // Exchanges a valid, unexpired, unrevoked refresh token for a new access
  // token AND a new refresh token (rotation) — the presented token is
  // revoked in the same call, so it can never be replayed again. A second
  // attempt to use an already-rotated token (theft indicator) fails closed,
  // same as any other invalid token; this service has no separate "detected
  // reuse, revoke the whole family" escalation, since a single-token rotation
  // already prevents replay.
  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const token = await this.signAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = await this.issueRefreshToken(stored.user.id);
    return { token, refreshToken: newRefreshToken };
  }

  // Logout: revoke the presented refresh token so it can't silently mint new
  // access tokens after sign-out, even though the access token itself keeps
  // working until its short (1h) natural expiry. Idempotent and silent on an
  // already-invalid/unknown token — logging out is never itself an error.
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
