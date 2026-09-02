import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { SITE_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

// Deep coverage of the Expense correction flow lives in corrections.spec.ts —
// this is the plain create-and-list smoke matching every other module.
test("Owner can record an Expense and it appears in the log", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/expenses/new");

  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Category", "Fuel");
  await page.getByLabel("Amount").fill("500");
  await page.getByRole("button", { name: "Record Expense" }).click();

  await expect(page).toHaveURL(/\/expenses$/);
  await expect(page.getByText("Expense recorded")).toBeVisible({ timeout: 10_000 });
});
