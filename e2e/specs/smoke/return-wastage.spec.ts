import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can record a Return/Wastage entry against existing Site Stock", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Site Stock first — a fresh e2e DB has none to return/waste from.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  // A known upstream @base-ui-components/react (1.0.0-rc.0, latest
  // available) bug occasionally leaves an orphaned duplicate of a field in
  // the DOM — .first() consistently lands on the live, React-controlled
  // input in every confirmed repro so far.
  await page.getByLabel("Destination").first().selectOption({ label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel(/Quantity/).fill("100");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/return-wastage/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel("Quantity").fill("5");
  await page.getByRole("button", { name: "Record Entry" }).click();

  // Not asserting the URL's ?flash= query directly — the flash toast reads
  // and strips it from the URL client-side, racy to catch mid-transition;
  // the toast text itself is the reliable signal.
  await expect(page.getByText("Return/Wastage recorded")).toBeVisible({ timeout: 10_000 });
});
