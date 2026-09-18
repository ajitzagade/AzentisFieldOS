import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { fillField, pickCombobox, selectField } from "../../fixtures/ui";

test("Owner can transfer Material from one Site to another", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Site Stock at the source Site first — a fresh e2e DB has none to
  // transfer out. Only one Site exists in seed data, so the destination is
  // created inline via the Site picker's own "+ Add Site" quick-create.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await selectField(page, "Destination", { label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await fillField(page, /Quantity/, "100");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/site-to-site/new");
  await pickCombobox(page, "Source Site", SITE_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);

  const destinationSiteName = `E2E Transfer Destination ${Date.now()}`;
  // getByLabel("Destination Site") is ambiguous — ComboboxField's "Clear
  // Destination Site" and "Open Destination Site options" buttons both
  // contain the label text too. The combobox role scopes to the input.
  const destinationSiteField = page.getByRole("combobox", { name: "Destination Site" });
  await destinationSiteField.click();
  await page.getByText("+ Add Site").click();
  const dialog = page.getByRole("dialog", { name: "Add Site" });
  await fillField(page, "Name", destinationSiteName, dialog);
  await fillField(page, "Location", "Nashik, Maharashtra", dialog);
  await dialog.getByRole("button", { name: "Create Site" }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  await expect(destinationSiteField).toHaveValue(destinationSiteName);

  await fillField(page, /Sent Quantity/, "10");
  await page.getByRole("button", { name: "Record Transfer" }).click();

  // Not asserting the URL's ?flash= query directly — the flash toast reads
  // and strips it from the URL client-side, racy to catch mid-transition;
  // the toast text itself is the reliable signal.
  await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });
});
