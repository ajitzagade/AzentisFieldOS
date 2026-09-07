import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox, visibleText } from "../../fixtures/ui";

test("Owner can see real Godown and Site Stock on the Inventory page", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Godown Stock (Purchase's Destination defaults to Godown).
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel(/Quantity/).fill("40");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  // Seed Site Stock at the fixture Site.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel("Destination").selectOption({ label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel(/Quantity/).fill("15");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();

  // Godown Stock table's Material cell is the bare name; the Site Stock
  // table's is "Material (Size)" — getByText does substring matching, so
  // an anchored regex is needed here or this would also match the longer
  // Site Stock cell below.
  await expect(visibleText(page, /^Cement$/)).toBeVisible();
  await expect(visibleText(page, "40")).toBeVisible();

  // Site Stock table row.
  await expect(visibleText(page, SITE_NAME)).toBeVisible();
  await expect(visibleText(page, "Cement (OPC 53 Grade)")).toBeVisible();
});
