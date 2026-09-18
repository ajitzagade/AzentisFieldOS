import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { OWNER_EMAIL } from "../fixtures/test-users";
import { API_BASE_URL, WEB_BASE_URL } from "../fixtures/constants";
import { fillField } from "../fixtures/ui";

// Login-type / auth-boundary edge coverage (Phase 1). Complements auth.spec.ts
// (happy-path sign-in, wrong password, sign-out, one 403) with the failure
// modes a real deployment must get right: no user enumeration, rejected and
// tampered tokens, session persistence, and the Owner-only boundary enforced
// server-side (a 404 page + a 403 API), never merely hidden in the UI.
//
// The "token whose user was deleted -> 401" path is covered at the guard-unit
// level (apps/api's CustomAuthGuard spec): there is no DELETE-user endpoint to
// drive it through a real browser, and hard-deleting the seeded user mid-suite
// would break every later spec sharing this DB — so it is deliberately not
// re-tested here.
test.describe("Auth edges", () => {
  test("an unknown email is rejected with the exact same message as a wrong password (no user enumeration)", async ({
    page,
  }) => {
    const messages: string[] = [];
    for (const email of [OWNER_EMAIL, `nobody-${Date.now()}@e2e.test`]) {
      await page.goto("/sign-in");
      await fillField(page, "Email address", email);
      await fillField(page, "Password", "definitely-wrong-password");
      await page.getByRole("button", { name: "Sign in" }).click();
      // Scope to the populated alert: the Base UI hydration dup bug can leave a
      // second, empty role="alert" orphan in the DOM (see e2e/fixtures/ui.ts),
      // which would trip strict mode on a bare getByRole("alert").
      const alert = page.getByRole("alert").filter({ hasText: /\S/ }).first();
      await expect(alert).toContainText("doesn't match our records");
      messages.push(((await alert.textContent()) ?? "").trim());
      await expect(page).toHaveURL(/\/sign-in/);
    }
    // Byte-for-byte identical copy whether the email doesn't exist or the
    // password is wrong — the server never reveals which was wrong.
    expect(messages[0]).toBe(messages[1]);
    expect(messages[0]).toContain("doesn't match our records");
  });

  test("a protected API route rejects a missing or garbage bearer token with 401", async ({ page }) => {
    const noToken = await page.request.get(`${API_BASE_URL}/users/me`);
    expect(noToken.status()).toBe(401);

    const garbage = await page.request.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: "Bearer not.a.real.jwt" },
    });
    expect(garbage.status()).toBe(401);
  });

  test("an invalid refresh token cannot silently resurrect a cleared session — navigation lands on /sign-in", async ({
    page,
  }) => {
    await loginAsOwner(page);
    // Drop the real cookies, then plant only a garbage refresh token: the
    // proxy's silent-refresh path must fail closed rather than let the app in.
    await page.context().clearCookies();
    await page.context().addCookies([
      { name: "refresh_token", value: "invalid-refresh-token", url: WEB_BASE_URL, httpOnly: true },
    ]);
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("a signed-in session survives a full page reload", async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.reload();
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("an Owner-only page is not-found for a Supervisor but renders for the Owner (server boundary, not just a hidden nav item)", async ({
    page,
  }) => {
    // The Settings page server component calls notFound() for a non-Owner.
    // Next renders its not-found UI (a 200 document under streaming, so assert
    // on the rendered result, not the HTTP status): the Owner-only Settings
    // content must not appear, and the not-found copy must.
    await loginAsSupervisor(page);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeHidden();
    await expect(page.getByText(/could not be found/i)).toBeVisible();

    // Same URL under an Owner session resolves to the real Settings page.
    await page.context().clearCookies();
    await loginAsOwner(page);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("a Supervisor's direct call to an Owner-only API read is 403, while a shared route is 200", async ({ page }) => {
    await loginAsSupervisor(page);
    const token = await page.evaluate(() => document.cookie.match(/(?:^|; )session=([^;]*)/)?.[1] ?? null);
    expect(token).toBeTruthy();

    // GET /users is @Roles('OWNER_ADMIN') — forbidden for a Supervisor.
    const forbidden = await page.request.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(forbidden.status()).toBe(403);

    // GET /users/me is open to any authenticated user — 200.
    const me = await page.request.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.status()).toBe(200);
  });
});
