import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth-cookies";

// Same-origin refresh endpoint for the CLIENT-side authed-fetch retry path
// (use-authed-fetch.ts): a client component calls this after a 401 instead
// of talking to apps/api's /auth/refresh directly, because only a
// same-origin request automatically carries the httpOnly refresh_token
// cookie — browser JS can't read it itself. proxy.ts covers the equivalent
// case for full page navigations; this route covers client-side fetch calls
// that bypass the Next.js page-render path entirely.
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json({ error: "apps/api unreachable" }, { status: 502 });
  }

  if (!apiRes.ok) {
    clearAuthCookies(cookieStore);
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const tokens = (await apiRes.json()) as AuthTokens;
  setAuthCookies(cookieStore, tokens);
  return NextResponse.json({ ok: true });
}
