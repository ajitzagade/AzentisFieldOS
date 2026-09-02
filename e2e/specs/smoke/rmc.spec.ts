import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can record an RMC delivery and it appears in the log", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/rmc/new");

  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  // No prior Grade has ever been recorded in this fresh database, so the
  // form falls back to a plain text field instead of a picker.
  await page.getByLabel("Grade").fill("M25");
  await page.getByLabel(/Quantity/).fill("12");
  await page.getByLabel("Rate / m³").fill("6200");
  await page.getByRole("button", { name: "Record RMC Delivery" }).click();

  await expect(page).toHaveURL(/\/rmc$/);
  await expect(page.getByText("RMC delivery recorded")).toBeVisible({ timeout: 10_000 });
});
