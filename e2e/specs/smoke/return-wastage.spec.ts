import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { fillField, pickCombobox, selectField } from "../../fixtures/ui";

test("Owner can record a Return/Wastage entry against existing Site Stock", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Site Stock first — a fresh e2e DB has none to return/waste from.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await selectField(page, "Destination", { label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await fillField(page, /Quantity/, "100");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/return-wastage/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await fillField(page, "Quantity", "5");
  await page.getByRole("button", { name: "Record Entry" }).click();

  // Not asserting the URL's ?flash= query directly — the flash toast reads
  // and strips it from the URL client-side, racy to catch mid-transition;
  // the toast text itself is the reliable signal.
  await expect(page.getByText("Return/Wastage recorded")).toBeVisible({ timeout: 10_000 });
});
