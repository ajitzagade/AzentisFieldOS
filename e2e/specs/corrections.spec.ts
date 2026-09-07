import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, TEAM_MEMBER_NAME, VENDOR_NAME } from "../fixtures/test-users";
import { pickCombobox } from "../fixtures/ui";

// D4: a user types the corrected value, never a signed delta. Drives a real
// Expense correction end to end and confirms the readback + the append-only
// ledger effect (the original amount stays visible via the new linked
// correction, never edited in place).
test.describe("Forgiving corrections", () => {
  test("correcting an Expense asks for the corrected amount and shows the derived change", async ({ page }) => {
    await loginAsOwner(page);

    await page.goto("/expenses/new");
    await pickCombobox(page, "Site", SITE_NAME);
    await pickCombobox(page, "Category", "Fuel");
    await page.getByLabel("Amount").fill("1000");
    await page.getByLabel("Description").fill("Diesel for site generator — e2e");
    await page.getByRole("button", { name: "Record Expense" }).click();
    await expect(page).toHaveURL(/\/expenses/);
    await expect(page.getByText("Expense recorded")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Correct" }).first().click();
    await expect(page).toHaveURL(/\/expenses\/.+\/correct/);
    await expect(page.getByText("Filing a correction")).toBeVisible();

    // D4: the field asks for the corrected value, not a delta.
    await expect(page.getByLabel("Corrected amount")).toBeVisible();
    await expect(page.getByText(/Currently recorded: ₹1,000/)).toBeVisible();
    await page.getByLabel("Corrected amount").fill("800");
    await expect(page.getByText(/Was ₹1,000 → change of −₹200 will be recorded/)).toBeVisible();

    await page.getByLabel("Reason for this correction").fill("Diesel bill was actually ₹800 — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();

    // FR-54 re-verification before the correction lands.
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/expenses/);
    await expect(page.getByText("Expense correction recorded")).toBeVisible({ timeout: 10_000 });

    // AD-9: the original row is never edited — both the original ₹1,000 and
    // the new linked ₹800 entry are visible in the list, never a single row
    // silently changed to 800.
    // The DataTable renders both a desktop table row and a mobile card for
    // each entry (one hidden via CSS at any given viewport, both in the
    // DOM) — .first() is enough to confirm the amount is present.
    await expect(page.getByText("₹1,000").first()).toBeVisible();
    await expect(page.getByText("₹800").first()).toBeVisible();
  });

  test("correcting a Purchase asks for the corrected quantity", async ({ page }) => {
    await loginAsOwner(page);

    await page.goto("/movements/purchases/new");
    await pickCombobox(page, "Vendor", VENDOR_NAME);
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel(/Quantity/).fill("10");
    await page.getByLabel("Rate").fill("100");
    await page.getByRole("button", { name: "Record Purchase" }).click();
    await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

    // /movements is a combined list across every movement type — scope by
    // the Correct link's own href prefix so an unrelated type's row (from
    // an earlier test in this shared-DB suite) can never win instead.
    await page.locator('a[href*="/movements/purchases/"][aria-label="Correct"]').first().click();
    await expect(page).toHaveURL(/\/movements\/purchases\/.+\/correct/);
    await expect(page.getByText("Filing a correction")).toBeVisible();

    await page.getByLabel(/Corrected quantity/).fill("8");
    await page.getByLabel("Reason for this correction").fill("Two Bags were never delivered — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/movements/);
    await expect(page.getByText("Purchase correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Consumption entry asks for the corrected quantity", async ({ page }) => {
    await loginAsOwner(page);

    // Seed Site Stock first.
    await page.goto("/movements/purchases/new");
    await pickCombobox(page, "Vendor", VENDOR_NAME);
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel("Destination").selectOption({ label: "Site" });
    await pickCombobox(page, "Site", SITE_NAME);
    await page.getByLabel(/Quantity/).fill("100");
    await page.getByLabel("Rate").fill("100");
    await page.getByRole("button", { name: "Record Purchase" }).click();
    await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

    await page.goto("/movements/consumption/new");
    await pickCombobox(page, "Site", SITE_NAME);
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel(/Quantity/).fill("10");
    await page.getByRole("button", { name: "Record Consumption" }).click();
    await expect(page.getByText("Consumption recorded")).toBeVisible({ timeout: 10_000 });

    // /movements is a combined list across every movement type — scope by
    // the Correct link's own href prefix, not .first(), or a just-seeded
    // Purchase's row (also freshly created, above) can win instead.
    await page.locator('a[href*="/movements/consumption/"][aria-label="Correct"]').first().click();
    await expect(page).toHaveURL(/\/movements\/consumption\/.+\/correct/);

    await page.getByLabel(/Corrected quantity/).fill("6");
    await page.getByLabel("Reason for this correction").fill("Over-recorded consumption — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/movements/);
    await expect(page.getByText("Consumption correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Return/Wastage entry asks for the corrected quantity", async ({ page }) => {
    await loginAsOwner(page);

    // Seed Site Stock first.
    await page.goto("/movements/purchases/new");
    await pickCombobox(page, "Vendor", VENDOR_NAME);
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel("Destination").selectOption({ label: "Site" });
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
    await expect(page.getByText("Return/Wastage recorded")).toBeVisible({ timeout: 10_000 });

    // See the Consumption test above for why href-scoping (not .first())
    // is needed on this combined multi-type list.
    await page.locator('a[href*="/movements/return-wastage/"][aria-label="Correct"]').first().click();
    await expect(page).toHaveURL(/\/movements\/return-wastage\/.+\/correct/);

    await page.getByLabel(/Corrected quantity/).fill("3");
    await page.getByLabel("Reason for this correction").fill("Wastage was overstated — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/movements/);
    await expect(page.getByText("Return/Wastage correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Godown-to-Site Movement asks for the corrected sent quantity", async ({ page }) => {
    await loginAsOwner(page);

    // Seed Godown Stock first.
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
    await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });

    // See the Consumption test above for why href-scoping (not .first())
    // is needed on this combined multi-type list.
    await page.locator('a[href*="/movements/godown-to-site/"][aria-label="Correct"]').first().click();
    await expect(page).toHaveURL(/\/movements\/godown-to-site\/.+\/correct/);

    await page.getByLabel(/Corrected sent quantity/).fill("7");
    await page.getByLabel("Reason for this correction").fill("Fewer Bags were actually sent — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/movements/);
    await expect(page.getByText("Movement correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting an RMC delivery asks for the corrected quantity and total amount", async ({ page }) => {
    await loginAsOwner(page);

    await page.goto("/rmc/new");
    await pickCombobox(page, "Site", SITE_NAME);
    await pickCombobox(page, "Vendor", VENDOR_NAME);
    await page.getByLabel("Grade").fill("M25");
    await page.getByLabel(/Quantity/).fill("12");
    await page.getByLabel("Rate / m³").fill("6200");
    await page.getByRole("button", { name: "Record RMC Delivery" }).click();
    await expect(page.getByText("RMC delivery recorded")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Correct" }).first().click();
    await expect(page).toHaveURL(/\/rmc\/.+\/correct/);

    await page.getByLabel(/Corrected quantity/).fill("10");
    await page.getByLabel(/Corrected total amount/).fill("62000");
    await page.getByLabel("Reason for this correction").fill("Delivery slip understated volume — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/rmc/);
    await expect(page.getByText("RMC correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Waste Disposal entry asks for the corrected trips and other charges", async ({ page }) => {
    await loginAsOwner(page);

    await page.goto("/waste-disposal/new");
    await pickCombobox(page, "Site", SITE_NAME);
    await page.getByLabel("Waste / material type").fill("Construction debris");
    await page.getByLabel("Number of trips").fill("4");
    await pickCombobox(page, "Party / Vendor", VENDOR_NAME);
    await page.getByLabel("Rate per trip").fill("500");
    await page.getByRole("button", { name: "Record Disposal" }).click();
    await expect(page.getByText("Disposal recorded")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Correct" }).first().click();
    await expect(page).toHaveURL(/\/waste-disposal\/.+\/correct/);

    await page.getByLabel(/Corrected number of trips/).fill("3");
    await page.getByLabel("Reason for this correction").fill("One trip was double-counted — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Submit Correction" }).last().click();

    await expect(page).toHaveURL(/\/waste-disposal/);
    await expect(page.getByText("Disposal correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Payment re-enters the complete, correct set of values", async ({ page }) => {
    await loginAsOwner(page);

    await page.goto("/payments/new");
    await pickCombobox(page, "Team Member", TEAM_MEMBER_NAME);
    await page.getByLabel("Base Pay").fill("5000");
    await page.getByRole("button", { name: "Employee Payment" }).click();
    await expect(page.getByText("Record this Payment?")).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();
    await expect(page.getByText("Payment recorded")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Correct" }).first().click();
    await expect(page).toHaveURL(/\/payments\/.+\/correct/);

    // Unlike the delta-based corrections above, every field re-enters the
    // original's complete value — not a signed change.
    await expect(page.getByLabel("Base Pay")).toHaveValue("5000");
    await page.getByLabel("Base Pay").fill("5500");
    await page.getByLabel("Reason for this correction").fill("Base pay was understated — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();

    await expect(page).toHaveURL(/\/payments/);
    await expect(page.getByText("Payment correction recorded")).toBeVisible({ timeout: 10_000 });
  });

  test("correcting a Team Advance asks for the corrected amount", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/team/new");

    const memberName = `E2E Correction Member ${Date.now()}`;
    await page.getByLabel("Name").fill(memberName);
    await page.getByLabel("Employment Type").selectOption({ label: "Daily Wage" });
    await page.getByRole("button", { name: "Create Team Member" }).click();
    await expect(page).toHaveURL(/\/team$/);

    await page.getByRole("link", { name: memberName }).first().click();
    await expect(page).toHaveURL(/\/team\/.+/);

    await page.getByRole("link", { name: "Record Advance" }).click();
    await page.getByLabel("Amount").fill("2000");
    await page.getByRole("button", { name: "Record Advance" }).click();
    await expect(page.getByText("Record this Advance?")).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();
    await expect(page.getByText("Advance recorded")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: "Correct" }).first().click();
    await expect(page).toHaveURL(/\/team\/.+\/advances\/.+\/correct/);

    await page.getByLabel(/Corrected amount/).fill("1500");
    await page.getByLabel("Reason for this correction").fill("Amount was overstated — e2e");
    await page.getByRole("button", { name: "Submit Correction" }).click();
    await expect(page.getByText(/re-verify/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Submit" }).click();

    await expect(page).toHaveURL(/\/team\/.+/);
    await expect(page.getByText("Advance correction recorded")).toBeVisible({ timeout: 10_000 });
  });
});
