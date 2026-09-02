import type { Page } from "@playwright/test";
import { OWNER_EMAIL, OWNER_PASSWORD, SUPERVISOR_EMAIL, SUPERVISOR_PASSWORD } from "./test-users";

// Drives the real /sign-in form — the same path an actual user takes — so
// every spec exercises the real Server Action, cookie, and role resolution,
// never a shortcut that injects a session directly.
async function signIn(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Both landing surfaces (Supervisor Home / Owner Dashboard) render the
  // "Today" or "Dashboard" heading once signed in — wait for navigation off
  // /sign-in rather than a specific heading, since the two roles differ.
  // Generous timeout: Next dev (Turbopack) compiles each route on first
  // visit, and a long smoke-test run hitting many never-before-compiled
  // routes back to back can occasionally push a single compile past 15s.
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 30_000 });
}

export async function loginAsOwner(page: Page) {
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);
}

export async function loginAsSupervisor(page: Page) {
  await signIn(page, SUPERVISOR_EMAIL, SUPERVISOR_PASSWORD);
}
