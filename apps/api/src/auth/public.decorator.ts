import { SetMetadata } from '@nestjs/common';

// Story 1.8 (AC #3, #5): the escape hatch the global ClerkAuthGuard reads via
// Reflector. A handler (or whole controller) marked @Public() is exempt from
// Clerk session verification — used for GET /health (unauthenticated
// deployment probe) and the CRON_SECRET-gated cron routes, which authenticate
// via their own bearer-secret check, not a Clerk user token. This is an
// explicit allowlist, never an accidental gap: every other route is protected
// by construction because the guard is registered globally (APP_GUARD).
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
