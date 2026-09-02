import { z } from "zod";

// POST /auth/login body, shared between apps/api (source of truth) and
// apps/web's sign-in form (AD-7). No password-strength rules here — that
// belongs at account-creation time (createUserSchema); login just needs a
// non-empty credential pair.
export const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

// POST /auth/refresh and POST /auth/logout bodies — both just carry the raw
// refresh token so apps/api can look up/rotate/revoke its hashed row.
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).max(500),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
