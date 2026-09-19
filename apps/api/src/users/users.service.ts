import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type {
  CreateUserInput,
  ResetUserPasswordInput,
  UpdateUserActiveInput,
  UpdateUserRoleInput,
} from '@azentisfieldos/shared';
import { Prisma, type Role } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SAFE_USER_SELECT } from '../auth/safe-user-select';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// FR-48, AD-11: owns the local User table's read/write for the admin
// surface. There is no invitation/pending state — an OWNER_ADMIN sets a
// new user's password directly and the account is active immediately.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /users — every local User. No "Pending" state since account
  // creation no longer round-trips through a third-party invitation flow.
  async list(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: SAFE_USER_SELECT,
    });
  }

  // POST /users — an OWNER_ADMIN creates the account directly, password
  // included; the admin hands the password to the person out-of-band.
  // AC #1's two-role guarantee is enforced by the Zod schema before we ever
  // reach here; `role` is already narrowed to the two schema values.
  async createUser(input: CreateUserInput): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      return await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          passwordHash,
        },
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with that email already exists.');
      }
      throw error;
    }
  }

  // PATCH /users/:id/role — a plain in-place role change (master data, not
  // AD-9 append-only).
  async updateRole(id: string, input: UpdateUserRoleInput): Promise<SafeUser> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role: input.role },
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User ${id} not found`);
      }
      throw error;
    }
  }

  // PATCH /users/:id/password — an OWNER_ADMIN sets a new password directly
  // (same out-of-band handoff model as createUser; there is no self-service
  // email-reset flow). Outstanding refresh tokens are revoked in the same
  // transaction so the old sign-in can't keep silently minting access
  // tokens for up to 30 more days; the user's still-live access token (≤1h)
  // expires on its own.
  async resetPassword(
    id: string,
    input: ResetUserPasswordInput,
  ): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const [user] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id },
          data: { passwordHash },
          select: SAFE_USER_SELECT,
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User ${id} not found`);
      }
      throw error;
    }
  }

  // PATCH /users/:id/active — deactivate or reactivate an account.
  // Deactivation, not deletion: User rows are referenced by
  // DailySiteReports/Photos/AuditLogs, so removing one would destroy
  // attribution history. Deactivating also revokes outstanding refresh
  // tokens (same rationale as resetPassword); the auth guard and refresh
  // flow both refuse inactive accounts from then on.
  async setActive(
    id: string,
    input: UpdateUserActiveInput,
    actorId: string,
  ): Promise<SafeUser> {
    if (id === actorId && !input.isActive) {
      throw new BadRequestException(
        'You cannot deactivate your own account.',
      );
    }
    try {
      // Tokens are revoked only when DEACTIVATING. A redundant
      // `isActive: true` against an already-active account must be a true
      // no-op — an unconditional revoke would silently sign that user out
      // within the hour for an update that changed nothing.
      const userUpdate = this.prisma.user.update({
        where: { id },
        data: { isActive: input.isActive },
        select: SAFE_USER_SELECT,
      });
      const [user] = input.isActive
        ? await this.prisma.$transaction([userUpdate])
        : await this.prisma.$transaction([
            userUpdate,
            this.prisma.refreshToken.updateMany({
              where: { userId: id, revokedAt: null },
              data: { revokedAt: new Date() },
            }),
          ]);
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User ${id} not found`);
      }
      throw error;
    }
  }
}
