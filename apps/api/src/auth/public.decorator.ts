import { SetMetadata } from '@nestjs/common';

// The escape hatch the global CustomAuthGuard reads via Reflector. A handler
// (or whole controller) marked @Public() is exempt from session verification
// — used for GET /health (unauthenticated deployment probe), POST
// /auth/login (there is no session yet), and the CRON_SECRET-gated cron
// routes, which authenticate via their own bearer-secret check, not a user
// token. This is an explicit allowlist, never an accidental gap: every other
// route is protected by construction because the guard is registered
// globally (APP_GUARD).
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
