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

  // A plain row click now opens the summary side panel in place (Vendor &
  // Subcontractor detail side panel feature) rather than navigating — the
  // full page ("Add Site Contract" and the rest of this flow) is still one
  // "View full details" click away.
  await page.getByRole("link", { name }).first().click();
  // The "Subcontractor added" success toast is also role="dialog" (Base
  // UI's Toast.Root) and can still be visible at this point — scope to the
  // panel's own title (the fetched Subcontractor's name) to avoid a
  // strict-mode ambiguity between the two.
  await expect(page.getByRole("dialog", { name })).toBeVisible();
  await page.getByRole("link", { name: /View full details/ }).click();
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

// Vendor & Subcontractor detail side panel: a plain row click opens the
// summary in place (URL gains ?subcontractorId=, no navigation away from
// the list) instead of the old hard-navigate-to-/subcontractors/[id]
// behavior.
test("clicking a Subcontractor row opens the detail panel in place, and Escape closes it", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/subcontractors/new");

  const name = `E2E Panel Subcontractor ${Date.now()}`;
  // A known upstream @base-ui-components/react (1.0.0-rc.0, latest
  // available) bug occasionally leaves an orphaned duplicate of a field in
  // the DOM — .first() consistently lands on the live, React-controlled
  // input in every confirmed repro so far.
  await page.getByLabel("Name").first().fill(name);
  await page.getByLabel("Contact person").fill("Meena Shah");
  await page.getByRole("button", { name: "Create Subcontractor" }).click();
  await expect(page).toHaveURL(/\/subcontractors$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — .first() avoids a
  // strict-mode ambiguity on the row link.
  await page.getByRole("link", { name }).first().click();

  // No navigation away from the list — the panel opens in place.
  await expect(page).toHaveURL(new RegExp(`/subcontractors\\?subcontractorId=`));
  // The "Subcontractor added" success toast is also role="dialog" (Base
  // UI's Toast.Root) and can still be visible at this point — scope to the
  // panel's own title (the fetched Subcontractor's name) to avoid a
  // strict-mode ambiguity between the two.
  const dialog = page.getByRole("dialog", { name });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Meena Shah")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/\/subcontractors$/);
});
