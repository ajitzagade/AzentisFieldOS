import { expect, test, type Page } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, TEAM_MEMBER_NAME, VENDOR_NAME } from "../fixtures/test-users";
import { fillField, pickCombobox, selectField } from "../fixtures/ui";

// Phase 2 — the remaining "thin journey" gaps: a Supervisor's two everyday
// actions that existing specs stop short of actually completing. The
// supervisor-daily-flow Attendance test only checks the Save button is
// visible; here we submit it. The inventory spec seeds stock but never
// consumes it; here we prove a Consumption decrements Site Stock.

// Reads the fixture Site's Cement quantity from the Inventory Site Stock table
// (its Material cell is "Cement (OPC 53 Grade)"; the Godown table's is the bare
// name, so this can't collide). Qty renders as "<n> <unit>".
async function readSiteCementQty(page: Page): Promise<number> {
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  const cell = page.getByText("Cement (OPC 53 Grade)", { exact: true }).and(page.locator(":visible")).first();
  const row = cell.locator("xpath=ancestor::tr[1]");
  const qtyText = (await row.locator("td").last().textContent())?.trim() ?? "0";
  return Number(qtyText.replace(/[^0-9.]/g, ""));
}

test("a Supervisor records Attendance and it is saved (redirects to Team with a confirmation)", async ({ page }) => {
  await loginAsSupervisor(page);
  await page.goto("/daily-activity/work-records/new");
  await pickCombobox(page, "Site", SITE_NAME);
  // The default crew is fetched from the Site's prior attendance; let it settle,
  // then ensure the seeded member is on the roster (added members default to
  // Present). Conditional so a retry — which would already have this member on
  // the Site's crew — doesn't try to re-add an unavailable option.
  await page.waitForLoadState("networkidle");
  if ((await page.getByText(TEAM_MEMBER_NAME).count()) === 0) {
    // Pick the member in the "Add Team Member" combobox, then commit with the
    // "Add" button — the combobox alone only stages the selection.
    await pickCombobox(page, "Add Team Member", TEAM_MEMBER_NAME);
    await page.getByRole("button", { name: "Add", exact: true }).click();
  }
  await expect(page.getByText(TEAM_MEMBER_NAME).first()).toBeVisible();

  // The button enables only once the crew is non-empty.
  const save = page.getByRole("button", { name: "Save Attendance" });
  await expect(save).toBeEnabled();
  await save.click();
  // On success the form redirects to /team with an "Attendance recorded" flash.
  await expect(page).toHaveURL(/\/team/);
  await expect(page.getByText("Attendance recorded")).toBeVisible({ timeout: 10_000 });
});

test("recording a Consumption decrements the Site's stock by exactly the consumed quantity", async ({ page }) => {
  await loginAsOwner(page);

  // Guarantee the fixture Site has enough Cement to consume (Purchase straight
  // to the Site destination adds Site Stock immediately).
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await selectField(page, "Destination", { label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await fillField(page, /Quantity/, "30");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  const before = await readSiteCementQty(page);

  // Consume 10 at the same Site.
  await page.goto("/movements/consumption/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await fillField(page, /Quantity/, "10");
  await page.getByRole("button", { name: "Record Consumption" }).click();
  await expect(page.getByText(/Consumption recorded/)).toBeVisible({ timeout: 10_000 });

  const after = await readSiteCementQty(page);
  expect(after).toBe(before - 10);
});
