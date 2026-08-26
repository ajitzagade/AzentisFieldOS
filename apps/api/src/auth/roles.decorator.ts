import { SetMetadata } from '@nestjs/common';
import type { Role } from '../generated/prisma/client';

// Story 14.2: authZ metadata read by RolesGuard. Story 1.8 built authN (the
// global ClerkAuthGuard proves WHO you are); this adds WHAT you may do. A
// handler (or whole controller) marked @Roles('OWNER_ADMIN') requires the
// resolved req.user.role to be in the allowed set — a Site Supervisor calling
// a Users-admin endpoint directly gets 403, not a silent success. Only the two
// schema roles ever appear here (AD-11); there is no third tier to grant.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
