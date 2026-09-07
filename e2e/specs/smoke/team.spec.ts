import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { visibleText } from "../../fixtures/ui";

test("Owner can add a Team Member and they appear in the roster", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/team/new");

  const name = `E2E Smoke Member ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Employment Type").selectOption({ label: "Daily Wage" });
  await page.getByRole("button", { name: "Create Team Member" }).click();

  await expect(page).toHaveURL(/\/team$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});
