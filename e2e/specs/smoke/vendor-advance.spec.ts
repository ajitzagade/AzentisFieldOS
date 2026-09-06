import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox, visibleText } from "../../fixtures/ui";

// Feature 2026-09-06: recording a Waste Disposal for a hired Vendor can
// also record an advance paid to them for that trip — a separate
// VendorAdvance ledger row, written atomically with the disposal itself.
// Exercises the real create path end to end: the advance amount auto-fills
// from trips × rate, shows in words, and the row lands on the Vendor's own
// detail page.
test("recording a Waste Disposal with an advance to the hired Vendor shows it on the Vendor's page", async ({
  page,
}) => {
  await loginAsOwner(page);
  await page.goto("/waste-disposal/new");

  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel("Waste / material type").fill("Excavated earth");
  await page.getByLabel("Number of trips").fill("4");
  await pickCombobox(page, "Party / Vendor", VENDOR_NAME);
  await page.getByLabel("Rate per trip").fill("500");

  await expect(page.getByText("Two Thousand Rupees")).toBeVisible();

  await page.getByText("Give an advance to this Vendor for this trip").click();
  const advanceField = page.getByLabel("Advance amount");
  await expect(advanceField).toHaveValue("2000");
  // Distinct from the trip's own ₹2,000 Total so the two never collide in
  // an unscoped page-wide text assertion below.
  await advanceField.fill("1500");
  await page.getByLabel("Payment Method").fill("Cash");

  await page.getByRole("button", { name: "Record Disposal" }).click();
  await expect(page.getByText("Disposal recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/vendors");
  await page.getByRole("link", { name: VENDOR_NAME }).click();
  await expect(page).toHaveURL(/\/vendors\/.+/);

  await expect(visibleText(page, "Vendor Advances")).toBeVisible();
  await expect(visibleText(page, "₹1,500")).toBeVisible();
  // "Excavated earth" also appears in the Waste & Disposal History table
  // above (the disposal's own Waste type column) — Payment Method is the
  // detail unique to the Vendor Advances row.
  await expect(visibleText(page, "Cash")).toBeVisible();
});
