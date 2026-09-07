import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { pickCombobox, visibleText } from "../../fixtures/ui";

test("Owner can create a Material and it appears in the catalog", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/materials/new");

  const name = `E2E Smoke Material ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await pickCombobox(page, "Category", "Cement & Binders");
  await pickCombobox(page, "Unit", "Bags");
  await page.getByRole("button", { name: "Create Material" }).click();

  await expect(page).toHaveURL(/\/materials$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});
