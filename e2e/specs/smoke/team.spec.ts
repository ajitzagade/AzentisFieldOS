import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";

test("Owner can add a Team Member and they appear in the roster", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/team/new");

  const name = `E2E Smoke Member ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Employment Type").selectOption({ label: "Daily Wage" });
  await page.getByRole("button", { name: "Create Team Member" }).click();

  await expect(page).toHaveURL(/\/team$/);
  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
});
