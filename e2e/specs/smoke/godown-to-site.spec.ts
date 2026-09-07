import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

test("Owner can move Material from the Godown to a Site", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Godown Stock first — a fresh e2e DB has none to move out. Purchase's
  // Destination defaults to Godown, so this needs no extra field.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel(/Quantity/).fill("100");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/godown-to-site/new");
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await pickCombobox(page, "Destination Site", SITE_NAME);
  await page.getByLabel(/Sent Quantity/).fill("10");
  await page.getByRole("button", { name: "Record Movement" }).click();

  // Not asserting the URL's ?flash= query directly — the flash toast reads
  // and strips it from the URL client-side, racy to catch mid-transition;
  // the toast text itself is the reliable signal.
  await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });
});
