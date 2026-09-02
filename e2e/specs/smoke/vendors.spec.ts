import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";

test("Owner can add a Vendor and it appears in the list", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/vendors/new");

  const name = `E2E Smoke Vendor ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create Vendor" }).click();

  await expect(page).toHaveURL(/\/vendors$/);
  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
});
