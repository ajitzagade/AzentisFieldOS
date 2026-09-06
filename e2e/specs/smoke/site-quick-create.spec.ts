import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

// Regression for a real production bug (2026-09-06): "Add site is not
// visible in the site drop downs if site is not available." Site was the
// one master-data entity missing the inline "+ Add" quick-create every
// other picker (Vendor/Material/Team Member/Subcontractor) already had.
// Exercises a real SiteField picker (Waste Disposal's) end to end: open the
// combobox, quick-create a brand-new Site, and confirm it lands selected
// and the whole entry still saves.
test("a brand-new Site can be added inline from a Site picker and is selected immediately", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/waste-disposal/new");

  const siteName = `E2E Quick-Create Site ${Date.now()}`;
  await page.getByRole("combobox", { name: "Site" }).click();
  await page.getByText("+ Add Site").click();

  const dialog = page.getByRole("dialog", { name: "Add Site" });
  await dialog.getByLabel("Name").fill(siteName);
  await dialog.getByLabel("Location").fill("Nashik, Maharashtra");
  await dialog.getByRole("button", { name: "Create Site" }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });

  await expect(page.getByRole("combobox", { name: "Site" })).toHaveValue(siteName);

  await page.getByLabel("Waste / material type").fill("Excavated earth");
  await page.getByLabel("Number of trips").fill("1");
  // Ownership defaults to "Hired", which requires a Party/Vendor.
  await pickCombobox(page, "Party / Vendor", VENDOR_NAME);
  await page.getByRole("button", { name: "Record Disposal" }).click();

  await expect(page).toHaveURL(/\/waste-disposal$/);
  await expect(page.getByText("Disposal recorded")).toBeVisible({ timeout: 10_000 });
});
