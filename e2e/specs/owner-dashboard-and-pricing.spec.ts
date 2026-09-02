import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../fixtures/test-users";
import { pickCombobox } from "../fixtures/ui";

// D7's full loop: a Supervisor records an inward entry with no pricing, the
// Owner sees it flagged and completes it. Self-contained (creates its own
// unpriced Purchase as a Supervisor first) so it doesn't depend on spec
// execution order.
test.describe("Owner Dashboard & D7 pricing queue", () => {
  test("Dashboard renders the cross-Site rollup", async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByText(SITE_NAME).first()).toBeVisible();
  });

  test("a Supervisor's unpriced Purchase surfaces on the Dashboard and can be priced by the Owner", async ({
    page,
  }) => {
    // 1. Supervisor records Material Received with no pricing.
    await loginAsSupervisor(page);
    await page.goto("/movements/purchases/new");
    await page.getByLabel("Vendor").selectOption({ label: VENDOR_NAME });
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel(/Quantity/).fill("80");
    await page.getByRole("button", { name: "Record Purchase" }).click();
    await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

    // Switching roles mid-test: clear the session directly rather than
    // clicking "Sign out" — Next's dev-mode overlay portal can transiently
    // intercept pointer events right after a first-visit route compiles
    // (Turbopack dev-only artifact), making that click unreliable. Clearing
    // the cookie exercises the same unauthenticated state the real sign-out
    // produces, without depending on that click.
    await page.context().clearCookies();

    // 2. Owner sees the pending-pricing flag on the Dashboard.
    await loginAsOwner(page);
    await expect(page.getByText(/inward .* waiting for pricing/)).toBeVisible();
    await page.getByRole("link", { name: "Add Pricing" }).first().click();
    await expect(page).toHaveURL(/\/movements\?type=PURCHASE/);

    // 3. Owner opens the pending row and completes pricing.
    await page.getByRole("link", { name: "Add Pricing" }).first().click();
    await expect(page).toHaveURL(/\/movements\/purchases\/.+\/pricing/);
    await expect(page.getByText(/80 Bags/)).toBeVisible();

    await page.getByLabel("Rate").fill("390");
    await expect(page.getByLabel("Total Amount")).not.toHaveValue("");
    await page.getByLabel("Payment Status").selectOption({ label: "Unpaid" });
    await page.getByRole("button", { name: "Save Pricing" }).click();

    // FR-54 confirmation before the money write actually lands.
    await expect(page.getByText("Save this pricing?")).toBeVisible();
    await page.getByRole("button", { name: "Save Pricing" }).last().click();

    await expect(page).toHaveURL(/\/movements/);
    await expect(page.getByText("Pricing saved")).toBeVisible({ timeout: 10_000 });

    // 4. The Vendor's page shows the real computed amount (80 × ₹390) in
    // multiple places (year total, outstanding, the row itself) — never
    // the ₹0 this fix banned.
    await page.goto("/vendors");
    await page.getByText(VENDOR_NAME).click();
    await expect(page.getByText("₹31,200").first()).toBeVisible();
    await expect(page.getByText("₹0", { exact: true })).not.toBeVisible();
  });
});
