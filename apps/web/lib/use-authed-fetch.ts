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

// Module-level (not per-hook-instance) so concurrent 401s from several
// client components near the access token's 1h expiry collapse into one
// refresh call instead of a stampede — every caller awaits the same
// in-flight promise.
let refreshInFlight: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

// The CLIENT variant of the shared authed-fetch helper, for client
// components (DSR forms, branding form, work-record form). It binds the
// token-attaching core to the session cookie and apps/api at
// `process.env.NEXT_PUBLIC_API_URL`, retrying once via a same-origin silent
// refresh on a 401 (the access token is short-lived by design — see
// apps/api/src/auth/auth.module.ts — so this keeps that invisible to the
// user instead of surfacing as a spurious error every hour).
export function useAuthedFetch(): AuthedFetch {
  return useMemo(
    () =>
      createAuthedFetch(
        process.env.NEXT_PUBLIC_API_URL ?? "",
        getToken,
        refreshSession,
      ),
    [],
  );
}
