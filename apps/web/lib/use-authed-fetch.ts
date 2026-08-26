"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { createAuthedFetch, type AuthedFetch } from "./authed-fetch-core";

export type { AuthedFetch } from "./authed-fetch-core";

// Story 1.8 (AC #4): the CLIENT variant of the shared authed-fetch helper, for
// client components (DSR forms, branding form, work-record form). It binds the
// token-attaching core to the browser Clerk context (`useAuth().getToken()`)
// and apps/api at `process.env.NEXT_PUBLIC_API_URL`. `getToken` from Clerk is
// stable across renders, so the returned `authedFetch` is memoized on it and
// safe to use as an effect dependency. Because the token is read fresh on each
// call, passing this fetcher into story 3.2's `syncQueuedDsrs` attaches a
// current token at drain time, not a stale one from when the DSR was queued.
export function useAuthedFetch(): AuthedFetch {
  const { getToken } = useAuth();
  return useMemo(
    () =>
      createAuthedFetch(process.env.NEXT_PUBLIC_API_URL ?? "", () =>
        getToken(),
      ),
    [getToken],
  );
}
