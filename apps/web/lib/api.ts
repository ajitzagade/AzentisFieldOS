import { cookies } from "next/headers";
import { createAuthedFetch, type AuthedFetch } from "./authed-fetch-core";

export type { AuthedFetch } from "./authed-fetch-core";

// The SERVER variant of the shared authed-fetch helper, for Server
// Components / Server Actions / RSC. It reads the session token directly
// from the httpOnly `session` cookie (set by app/sign-in/actions.ts) and
// calls apps/api at `process.env.API_URL`. Client components use
// `useAuthedFetch()` instead (use-authed-fetch.ts) — same token-attaching
// core, different token source.
//
// `authedFetch(path, init)` is a drop-in for a plain
// `fetch(\`${process.env.API_URL}${path}\`, init)` — same Response contract,
// only the base URL and Authorization header are now handled here once.
export async function authedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const fetcher: AuthedFetch = createAuthedFetch(
    process.env.API_URL ?? "",
    async () => {
      const cookieStore = await cookies();
      return cookieStore.get("session")?.value ?? null;
    },
  );
  return fetcher(path, init);
}
