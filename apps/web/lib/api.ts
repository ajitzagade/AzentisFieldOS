import { auth } from "@clerk/nextjs/server";
import { createAuthedFetch, type AuthedFetch } from "./authed-fetch-core";

export type { AuthedFetch } from "./authed-fetch-core";

// Story 1.8 (AC #4): the SERVER variant of the shared authed-fetch helper, for
// Server Components / Server Actions / RSC. It reads the current session token
// via `auth().getToken()` from @clerk/nextjs/server and calls apps/api at
// `process.env.API_URL`. Client components use `useAuthedFetch()` instead
// (use-authed-fetch.ts) — same token-attaching core, different Clerk context.
//
// `authedFetch(path, init)` is a drop-in for the previous
// `fetch(\`${process.env.API_URL}${path}\`, init)` — same Response contract,
// only the base URL and Authorization header are now handled here once.
export async function authedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const { getToken } = await auth();
  const fetcher: AuthedFetch = createAuthedFetch(
    process.env.API_URL ?? "",
    () => getToken(),
  );
  return fetcher(path, init);
}
