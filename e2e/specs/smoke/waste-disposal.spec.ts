import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can record a Waste Disposal entry and it appears in the log", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/waste-disposal/new");

  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel("Waste / material type").fill("Construction debris");
  // "Quantity" is optional/informational; "Number of trips" is the field
  // the total actually derives from (Hired is the default Own/Hired state).
  await page.getByLabel("Number of trips").fill("2");
  await pickCombobox(page, "Party / Vendor", VENDOR_NAME);
  await page.getByRole("button", { name: "Record Disposal" }).click();

  await expect(page).toHaveURL(/\/waste-disposal$/);
  await expect(page.getByText("Disposal recorded")).toBeVisible({ timeout: 10_000 });
});
