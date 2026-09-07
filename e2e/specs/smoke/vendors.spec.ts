import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { visibleText } from "../../fixtures/ui";

test("Owner can add a Vendor and it appears in the list", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/vendors/new");

  const name = `E2E Smoke Vendor ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create Vendor" }).click();

  await expect(page).toHaveURL(/\/vendors$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});
