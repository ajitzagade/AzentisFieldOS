import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../fixtures/auth";
import { SITE_NAME } from "../fixtures/test-users";
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
});
