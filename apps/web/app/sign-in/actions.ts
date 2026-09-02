"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@azentisfieldos/shared";
import { mapLoginError } from "./map-login-error";
import { setAuthCookies } from "@/lib/auth-cookies";

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

  const tokens = (await response.json()) as { token: string; refreshToken: string };
  const cookieStore = await cookies();
  setAuthCookies(cookieStore, tokens);

  redirect("/");
}
