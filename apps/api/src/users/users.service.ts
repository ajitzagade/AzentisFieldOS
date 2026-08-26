import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ClerkClient, UserJSON } from '@clerk/backend';
import { ROLES } from '@azentisfieldos/shared';
import type {
  InviteUserInput,
  UpdateUserRoleInput,
} from '@azentisfieldos/shared';
import { Prisma, type Role, type User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CLERK_CLIENT } from './clerk-client.provider';

// A row in the merged Users list (AC #1): a real local User is "Active"; a
// non-revoked Clerk invitation that has not been accepted yet is "Pending".
export interface UserListRow {
  id: string;
  name: string | null;
  email: string;
  role: Role | null;
  status: 'Active' | 'Pending';
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

// Story 14.2 (FR-48, AD-10, AD-11). Owns the local User table's read/write for
// the admin surface plus the Clerk-webhook sync that actually makes User rows
// exist. Clerk owns identity/invitations; this service is the validation + sync
// layer AD-10 always specified.
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLERK_CLIENT) private readonly clerk: ClerkClient,
  ) {}

  // GET /users/me — the full local row for the authenticated caller. req.user
  // only carries id/clerkId/role (Story 1.8), so name/email come from here.
  async getMe(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: Role;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // The guard resolved this id from a verified token moments ago; a miss
      // here means the row was deleted mid-request — a clean 404, not a 500.
      throw new NotFoundException('Current user not found');
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  // GET /users — every local User (Active) merged with every pending Clerk
  // invitation (Pending). Invitation state lives in Clerk, never a Postgres
  // table (AD-10); accepted invitations leave the `pending` set on Clerk's side
  // and reappear here as a real User once the webhook provisions them.
  async list(): Promise<UserListRow[]> {
    const [users, invitations] = await Promise.all([
      this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
      this.clerk.invitations.getInvitationList({ status: 'pending' }),
    ]);

    const activeEmails = new Set(users.map((u) => u.email.toLowerCase()));

    const activeRows: UserListRow[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'Active',
    }));

    const pendingRows: UserListRow[] = invitations.data
      // Guard against a race where an invitation was just accepted (User row
      // already exists) but Clerk hasn't dropped it from `pending` yet.
      .filter((inv) => !activeEmails.has(inv.emailAddress.toLowerCase()))
      .map((inv) => {
        const metaRole = (inv.publicMetadata as { role?: unknown } | null)
          ?.role;
        return {
          id: inv.id,
          name: null,
          email: inv.emailAddress,
          role: isRole(metaRole) ? metaRole : null,
          status: 'Pending' as const,
        };
      });

    return [...activeRows, ...pendingRows];
  }

  // POST /users/invite — creates a Clerk invitation carrying the intended role
  // in publicMetadata, which the webhook (handleUserCreated) reads on
  // acceptance. AC #1's two-role guarantee is enforced by the Zod schema before
  // we ever reach here; `role` is already narrowed to the two schema values.
  async invite(input: InviteUserInput) {
    const invitation = await this.clerk.invitations.createInvitation({
      emailAddress: input.email,
      publicMetadata: { role: input.role },
    });
    return {
      id: invitation.id,
      email: invitation.emailAddress,
      role: input.role,
      status: 'Pending' as const,
    };
  }

  // PATCH /users/:id/role — a plain in-place role change (master data, not
  // AD-9 append-only).
  async updateRole(id: string, input: UpdateUserRoleInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role: input.role },
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

  // --- Clerk webhook sync (the authoritative user-creator) ---

  // user.created: upsert the local User by clerkId. Role: the very FIRST User
  // in the DB is the Owner/Admin who provisioned the tenant; everyone else
  // takes the role their invitation carried in publicMetadata (default Site
  // Supervisor if absent). "First" is computed as "no OTHER user exists yet",
  // so it stays correct even when Story 1.8's guard already provisioned this
  // same clerkId as a fallback before the webhook fired — the webhook is
  // authoritative and overwrites the guard's default with the invited role.
  async handleUserCreated(data: UserJSON): Promise<User> {
    const clerkId = data.id;
    const name = fullName(data);
    const email = primaryEmail(data) ?? `${clerkId}@users.noreply.local`;

    const otherUsers = await this.prisma.user.count({
      where: { NOT: { clerkId } },
    });
    let role: Role;
    if (otherUsers === 0) {
      role = 'OWNER_ADMIN';
    } else {
      const metaRole = data.public_metadata?.role;
      role = isRole(metaRole) ? metaRole : 'SITE_SUPERVISOR';
    }

    return this.prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, name, email, role },
      update: { name, email, role },
    });
  }

  // user.updated: sync name/email only. Deliberately does NOT touch role — an
  // Owner/Admin may have changed it via PATCH /users/:id/role, and a plain
  // Clerk profile edit must not clobber that authorization decision.
  async handleUserUpdated(data: UserJSON): Promise<User> {
    const clerkId = data.id;
    const existing = await this.prisma.user.findUnique({ where: { clerkId } });
    // An update for a user we've never seen (events arriving out of order):
    // fall back to the create path so the row exists rather than 404.
    if (!existing) {
      return this.handleUserCreated(data);
    }
    return this.prisma.user.update({
      where: { clerkId },
      data: { name: fullName(data), email: primaryEmail(data) ?? existing.email },
    });
  }

  // user.deleted: intentionally a no-op on the User row. Deleting it would
  // break every submittedByUserId / recordedByUserId FK pointing at the
  // departed user's historical records; whether to preserve or reassign those
  // is a real product decision this story's AC doesn't ask for. Full
  // deprovisioning is flagged as follow-up.
  handleUserDeleted(): void {
    // no-op by design — see comment above.
  }
}

function primaryEmail(data: UserJSON): string | undefined {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  );
  const chosen = primary ?? data.email_addresses[0];
  const value = chosen?.email_address;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function fullName(data: UserJSON): string {
  const composed = [data.first_name, data.last_name]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
    .trim();
  if (composed.length > 0) return composed;
  if (typeof data.username === 'string' && data.username.length > 0) {
    return data.username;
  }
  return 'User';
}
