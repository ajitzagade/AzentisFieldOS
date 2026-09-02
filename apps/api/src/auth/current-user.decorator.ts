import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Role } from '../generated/prisma/client';

// The authenticated caller, resolved by CustomAuthGuard from the verified
// session JWT and attached to the request. This is the real signed-in user
// that write endpoints attribute their rows to (submittedByUserId /
// uploadedByUserId). id/role are always populated; the rest are optional
// (not required) so every existing `{ id, role }` mock/test object still
// satisfies this type — they exist purely so GET /users/me can build its
// response from request.user without a second DB round-trip.
export interface AuthUser {
  id: string;
  role: Role;
  name?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Reads req.user (populated by CustomAuthGuard). Only meaningful on a
// protected route — a @Public() route never runs the guard, so req.user is
// undefined there. Controllers thread `user.id` down into the service layer
// explicitly.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user as AuthUser;
  },
);
