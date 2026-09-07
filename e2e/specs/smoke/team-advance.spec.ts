import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";

test("Owner can record a Team Advance and the Outstanding Balance updates", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/team/new");

  const memberName = `E2E Advance Member ${Date.now()}`;
  await page.getByLabel("Name").fill(memberName);
  await page.getByLabel("Employment Type").selectOption({ label: "Daily Wage" });
  await page.getByRole("button", { name: "Create Team Member" }).click();
  await expect(page).toHaveURL(/\/team$/);

  await page.getByRole("link", { name: memberName }).first().click();
  await expect(page).toHaveURL(/\/team\/.+/);
  await expect(page.getByText("₹0")).toBeVisible();

  await page.getByRole("link", { name: "Record Advance" }).click();
  await page.getByLabel("Amount").fill("2000");
  await page.getByRole("button", { name: "Record Advance" }).click();
  await expect(page.getByText("Record this Advance?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();

  await expect(page).toHaveURL(/\/team\/.+/);
  await expect(page.getByText("Advance recorded")).toBeVisible({ timeout: 10_000 });

  // Outstanding Balance updates immediately, and the new row lands in the
  // Advance Ledger.
  await expect(page.getByText("₹2,000").first()).toBeVisible();
  await expect(page.getByText("Advance Ledger")).toBeVisible();
});
