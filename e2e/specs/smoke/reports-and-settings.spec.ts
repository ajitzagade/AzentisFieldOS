import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../../fixtures/auth";

test("Owner can open Reports", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports", exact: true })).toBeVisible();
});

// Story 13.2/13.3/13.4: every report type is its own URL-driven tab
// (?tab=), never a client-only toggle — the previous test only ever
// touched the default Site tab. Confirms each of the other 4 actually
// renders its own real content section, not just that /reports loads.
test("Owner can view every Report tab's real content", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Daily Report History" })).toBeVisible();

  await page.getByRole("tab", { name: "Inventory Reports" }).click();
  await expect(page).toHaveURL(/tab=inventory/);
  await expect(page.getByRole("heading", { name: "Current Stock" })).toBeVisible();

  await page.getByRole("tab", { name: "Labour Reports" }).click();
  await expect(page).toHaveURL(/tab=labour/);
  await expect(page.getByRole("heading", { name: "Attendance & Work History" })).toBeVisible();

  await page.getByRole("tab", { name: "Machinery/Vehicle Reports" }).click();
  await expect(page).toHaveURL(/tab=machinery/);
  // "Movement History" only renders once a specific Asset filter is
  // picked — the default (unfiltered) view is the register itself.
  await expect(page.getByRole("heading", { name: "Machinery — Current Status" })).toBeVisible();

  await page.getByRole("tab", { name: "Financial Reports" }).click();
  await expect(page).toHaveURL(/tab=financial/);
  await expect(page.getByRole("heading", { name: "Per-Site Breakdown" })).toBeVisible();
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
