import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { SITE_NAME } from "../../fixtures/test-users";
import { pickCombobox, visibleText } from "../../fixtures/ui";

test("Owner can add a Subcontractor and it appears in the list", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/subcontractors/new");

  const name = `E2E Smoke Subcontractor ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create Subcontractor" }).click();

  await expect(page).toHaveURL(/\/subcontractors$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});

// The Subcontractor's real money flow: a Site Contract, Work logged
// against it, and a Payment recorded — none of which the create-only
// smoke test above ever touches.
test("Owner can add a Site Contract, log Work, and record a Payment for a Subcontractor", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/subcontractors/new");

  const name = `E2E Contract Subcontractor ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create Subcontractor" }).click();
  await expect(page).toHaveURL(/\/subcontractors$/);

  await page.getByRole("link", { name }).first().click();
  await expect(page).toHaveURL(/\/subcontractors\/.+/);

  await page.getByRole("link", { name: "Add Site Contract" }).click();
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel("Work category").fill("Excavation");
  await page.getByLabel("Rate type").selectOption({ label: "Per Trip" });
  await page.getByLabel(/Rate per trip/).fill("500");
  await page.getByLabel("Status").selectOption({ label: "Active — engagement is live and billable" });
  await page.getByRole("button", { name: "Save Site Contract" }).click();

  await expect(page).toHaveURL(/\/sites\/.+/);
  await expect(page.getByText("Site Contract added")).toBeVisible({ timeout: 10_000 });
  await expect(visibleText(page, "Excavation")).toBeVisible();

  await page.getByRole("link", { name: "Excavation" }).first().click();
  await expect(page).toHaveURL(/\/sites\/.+\/contracts\/.+/);

  await page.getByRole("link", { name: "Log Work" }).click();
  await page.getByLabel(/Quantity/).fill("4");
  await page.getByRole("button", { name: "Log Work" }).click();

  await expect(page).toHaveURL(/\/sites\/.+\/contracts\/.+/);
  await expect(page.getByText("Work Entry recorded")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("link", { name: "Record Payment" }).click();
  await page.getByLabel("Amount").fill("1500");
  await page.getByRole("button", { name: "Record Payment" }).click();

  await expect(page).toHaveURL(/\/sites\/.+\/contracts\/.+/);
  await expect(page.getByText("Payment recorded")).toBeVisible({ timeout: 10_000 });
});
