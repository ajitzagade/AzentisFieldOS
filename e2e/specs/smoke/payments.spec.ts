import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { TEAM_MEMBER_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can record a Payment and it appears in the log", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/payments/new");

  await pickCombobox(page, "Team Member", TEAM_MEMBER_NAME);
  await page.getByLabel("Base Pay").fill("5000");
  await page.getByRole("button", { name: "Record Payment" }).click();

  // FR-54: a Payment is money-bearing, held for re-verification.
  await expect(page.getByText("Record this Payment?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();

  await expect(page).toHaveURL(/\/payments$/);
  await expect(page.getByText("Payment recorded")).toBeVisible({ timeout: 10_000 });
});
