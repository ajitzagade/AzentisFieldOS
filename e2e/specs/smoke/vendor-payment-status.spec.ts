import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox, visibleText } from "../../fixtures/ui";

// Regression for a real production bug (2026-09-06): a Vendor with a
// fully-paid Purchase but an unpaid/partial Waste Disposal trip showed as
// "Fully Paid" on its own detail page, because summaryForVendor only ever
// summed Purchase rows — the money owed for the disposal trip was silently
// excluded. Reproduces both halves of the report: the payment status must
// reflect the unpaid trip, and the trip itself must be visible at all (the
// page previously had no Waste & Disposal section whatsoever).
test("a Vendor with a paid Purchase and an unpaid Waste Disposal trip is never shown as Fully Paid", async ({
  page,
}) => {
  await loginAsOwner(page);

  // 1. A fully paid Purchase for this Vendor (Owner-recorded purchases
  // default Payment Status to Paid — left untouched below).
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel(/Quantity/).fill("10");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  // 2. An unpaid Waste Disposal trip for the same Vendor (form defaults
  // Payment Status to Unpaid — left untouched below).
  //
  // "Construction debris" is also used verbatim by corrections.spec.ts and
  // waste-disposal.spec.ts against this same shared fixture Vendor — this
  // is the only spec that later searches the Vendor's page for it, so a
  // full-suite run can accumulate 3 matching rows there. Unique per run so
  // this test's own assertion below is unambiguous.
  const wasteType = `Construction debris ${Date.now()}`;
  await page.goto("/waste-disposal/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel("Waste / material type").fill(wasteType);
  await page.getByLabel("Number of trips").fill("2");
  await pickCombobox(page, "Party / Vendor", VENDOR_NAME);
  // A ₹0 trip would leave notFullyPaidTotal honestly at 0 regardless of
  // paymentStatus — Rate per trip must be nonzero for this to actually
  // reproduce "money owed" the way a real Unpaid disposal trip would.
  await page.getByLabel("Rate per trip").fill("500");
  await page.getByRole("button", { name: "Record Disposal" }).click();
  await expect(page.getByText("Disposal recorded")).toBeVisible({ timeout: 10_000 });

  // 3. The Vendor's own detail page must show the trip and must not read
  // as fully settled. A plain row click now opens the summary side panel
  // in place (Vendor & Subcontractor detail side panel feature) rather
  // than navigating — the full page (with its Waste & Disposal History
  // section, asserted below) is still one "View full details" click away.
  await page.goto("/vendors");
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — .first() avoids a
  // strict-mode ambiguity on the row link.
  await page.getByRole("link", { name: VENDOR_NAME }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: /View full details/ }).click();
  await expect(page).toHaveURL(/\/vendors\/.+/);

  await expect(visibleText(page, "Waste & Disposal History")).toBeVisible();
  await expect(visibleText(page, wasteType)).toBeVisible();
  await expect(visibleText(page, "Unpaid").first()).toBeVisible();
  await expect(page.getByText(/^Fully Paid$/)).toHaveCount(0);
});
