import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

// Story 5.3: this entry point reuses the plain Purchase form with
// destination pre-set to "Site" and the toggle skipped entirely — a UX
// convenience, not a different data path.
test("Owner can record a direct Vendor-to-Site Purchase", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/movements/vendor-to-site/new");

  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel(/Quantity/).fill("20");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();

  // Not asserting the URL's ?flash= query directly — the flash toast reads
  // and strips it from the URL client-side, racy to catch mid-transition;
  // the toast text itself is the reliable signal.
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });
});
