import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Role } from '../generated/prisma/client';

// Story 1.8 (AC #1): the authenticated caller, resolved by ClerkAuthGuard from
// the verified session token and attached to the request. This is the real
// signed-in user that write endpoints attribute their rows to
// (submittedByUserId / uploadedByUserId), replacing the deleted
// getPlaceholderUserId shim.
export interface AuthUser {
  id: string;
  clerkId: string;
  role: Role;
}

// Reads req.user (populated by ClerkAuthGuard). Only meaningful on a protected
// route — a @Public() route never runs the guard, so req.user is undefined
// there. Controllers thread `user.id` down into the service layer explicitly.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user as AuthUser;
  },
);
