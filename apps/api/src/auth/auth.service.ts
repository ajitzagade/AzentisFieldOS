import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { LoginInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  role: string;
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
  async login({ email, password }: LoginInput): Promise<{ token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }
}
