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
