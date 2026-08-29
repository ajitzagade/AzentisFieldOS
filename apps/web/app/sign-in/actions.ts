"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@azentisfieldos/shared";
import { mapLoginError } from "./map-login-error";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matches apps/api's JWT expiry.

export async function loginAction(
  _previousError: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return "Enter a valid email and password.";
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return mapLoginError(null);
  }

  if (!response.ok) {
    return mapLoginError(response.status);
  }

  const { token } = (await response.json()) as { token: string };
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    // Not httpOnly: apps/web's client-side authed-fetch (lib/use-authed-fetch.ts)
    // reads this cookie directly to attach it as a Bearer token on direct
    // cross-origin calls to apps/api, mirroring how Clerk's own client
    // getToken() already handed a live, usable session token to browser JS.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  redirect("/");
}
