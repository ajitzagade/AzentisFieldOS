"use client";

import { useMemo } from "react";
import { createAuthedFetch, type AuthedFetch } from "./authed-fetch-core";

export type { AuthedFetch } from "./authed-fetch-core";

// The `session` cookie is intentionally not httpOnly (see app/sign-in/actions.ts)
// so it can be read straight out of document.cookie here — no extra network
// hop, and it mirrors how Clerk's own client getToken() already handed a
// live, usable session token to browser JS.
function getToken(): Promise<string | null> {
  const match = document.cookie.match(/(?:^|; )session=([^;]*)/);
  return Promise.resolve(match ? decodeURIComponent(match[1]!) : null);
}

// The CLIENT variant of the shared authed-fetch helper, for client
// components (DSR forms, branding form, work-record form). It binds the
// token-attaching core to the session cookie and apps/api at
// `process.env.NEXT_PUBLIC_API_URL`.
export function useAuthedFetch(): AuthedFetch {
  return useMemo(
    () => createAuthedFetch(process.env.NEXT_PUBLIC_API_URL ?? "", getToken),
    [],
  );
}
