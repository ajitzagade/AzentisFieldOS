import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type {
  CreateUserInput,
  UpdateUserRoleInput,
} from '@azentisfieldos/shared';
import { Prisma, type Role } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Every User-returning method below selects exactly this shape — passwordHash
// must NEVER be serialized into an HTTP response, even hashed.
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// FR-48, AD-11: owns the local User table's read/write for the admin
// surface. There is no invitation/pending state — an OWNER_ADMIN sets a
// new user's password directly and the account is active immediately.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /users/me — the safe row for the authenticated caller.
  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });
    if (!user) {
      // The guard resolved this id from a verified token moments ago; a miss
      // here means the row was deleted mid-request — a clean 404, not a 500.
      throw new NotFoundException('Current user not found');
    }
    return user;
  }

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
}
