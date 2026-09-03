import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { OWNER_EMAIL } from "../fixtures/test-users";
import { API_BASE_URL } from "../fixtures/constants";

test.describe("Sign in", () => {
  test("Owner/Admin signs in and lands on the cross-Site Dashboard", async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    // Full sidebar, not the Supervisor's trim — scope to the nav rail since
    // "Vendors" also appears as a "View Vendors" card action on the page.
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByRole("link", { name: "Vendors", exact: true })).toBeVisible();
  });

  test("Site Supervisor signs in and lands on the task-first Home", async ({ page }) => {
    await loginAsSupervisor(page);
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    // The hero card's exact-match link (the per-Site gap-flag also renders
    // its own "Start Daily Report" action deep-linking that Site — correct
    // behavior, just a second element with overlapping accessible text).
    await expect(page.getByRole("link", { name: "Start Daily Report", exact: true })).toBeVisible();
    // Owner-only surfaces are not in the Supervisor's nav.
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByRole("link", { name: "Vendors" })).toHaveCount(0);
  });

  test("wrong password shows an error and does not sign in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email address").fill(OWNER_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("signing out returns to /sign-in and blocks the app again", async ({ page }) => {
    await loginAsOwner(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  // The Search/Action palette's `ownerOnly` filter (Story 19.2) only hides
  // an entry from a Supervisor's UI — it is documented as a convenience,
  // with the real boundary asserted to be apps/api's own @Roles('OWNER_ADMIN')
  // guards. This proves that assertion directly against a real running API,
  // bypassing the UI entirely, rather than trusting the code comment.
  test("a Site Supervisor's direct POST /payments call is rejected with 403, not just hidden from the UI", async ({ page }) => {
    await loginAsSupervisor(page);
    const cookie = await page.evaluate(() => document.cookie);
    const token = cookie.match(/(?:^|; )session=([^;]*)/)?.[1];
    expect(token).toBeTruthy();

    const response = await page.request.post(`${API_BASE_URL}/payments`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    expect(response.status()).toBe(403);
  });
});
