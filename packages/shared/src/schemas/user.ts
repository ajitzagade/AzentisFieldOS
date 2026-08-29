import { z } from "zod";
import { ROLES } from "../roles";

// FR-48 / AD-11: the schemas the Users admin surface (Story 14.2) shares
// between apps/api (source of truth) and apps/web (AD-7). Both reuse the
// existing ROLES constant — the single source of truth for the in-app Role set
// (Owner/Admin, Site Supervisor) — rather than redeclaring the two strings, so
// a "Platform Operator" or any third tier is structurally impossible to submit
// (AD-1, AD-11). `z.enum(ROLES)` narrows to exactly those two values.
//
// An OWNER_ADMIN sets the new user's password directly (no Clerk-style
// email-verified self-signup) — the account is active immediately and the
// admin hands the password to the person out-of-band.
export const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email().max(200),
  role: z.enum(ROLES),
  password: z.string().min(8).max(200),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// PATCH /users/:id/role body — a plain role change on an existing User. Role is
// master data (a normal in-place update), not one of AD-9's append-only
// transaction-history tables, so this is the whole payload.
export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
