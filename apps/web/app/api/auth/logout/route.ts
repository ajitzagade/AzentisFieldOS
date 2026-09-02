import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

// Clears both auth cookies and revokes the refresh token server-side, so a
// captured refresh token can't silently mint new access tokens after
// sign-out. A plain POST (not a Server Action) so it can be triggered from a
// simple <form method="post"> sign-out button without pulling in client JS.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (refreshToken) {
    try {
      await fetch(`${process.env.API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort: even if apps/api is unreachable, still clear the local
      // cookies below — the user must be able to sign out locally either way.
    }
  }
  clearAuthCookies(cookieStore);
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
