import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can create a Material and it appears in the catalog", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/materials/new");

  const name = `E2E Smoke Material ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await pickCombobox(page, "Category", "Cement & Binders");
  await pickCombobox(page, "Unit", "Bags");
  await page.getByRole("button", { name: "Create Material" }).click();

  await expect(page).toHaveURL(/\/materials$/);
  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
});
