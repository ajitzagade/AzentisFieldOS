import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../../fixtures/auth";

test("Owner can open Reports", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports", exact: true })).toBeVisible();
});

test("Owner can open Settings", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});

test("Supervisor cannot reach Settings (Owner/Admin only)", async ({ page }) => {
  await loginAsSupervisor(page);
  await page.goto("/settings");
  // Story 14.2's server-side guard 404s a Supervisor here — never a
  // visible-but-blocked screen (State Patterns: "No permission").
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
