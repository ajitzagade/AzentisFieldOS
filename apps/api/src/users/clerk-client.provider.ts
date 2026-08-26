import { createClerkClient, type ClerkClient } from '@clerk/backend';
import type { Provider } from '@nestjs/common';

// Story 14.2: identity lives in Clerk (AD-10), so the Users-admin surface reads
// pending invitations and creates new ones through Clerk's Backend API, never a
// parallel Postgres Invitation table. This wraps `createClerkClient` behind a
// Nest DI token so UsersService takes it as a constructor dependency and unit
// specs can inject a mock instead of a live SDK. The secret key is the same
// CLERK_SECRET_KEY the auth guard already uses for token verification.
export const CLERK_CLIENT = 'CLERK_CLIENT';

export const clerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  useFactory: (): ClerkClient =>
    createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY ?? '' }),
};
