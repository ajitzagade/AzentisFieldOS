import { expect, test, type Page } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox, visibleText } from "../../fixtures/ui";

// MATERIAL_NAME ("Cement") is a shared fixture that other specs in the
// suite also purchase into the Godown — the "Qty on Hand" cell is a
// running total, not this test's own 40. Read it before seeding so the
// assertion below checks the real delta instead of an absolute figure
// that only happened to be right when this spec ran in isolation.
async function readGodownCementQty(page: Page): Promise<number> {
  await page.goto("/inventory");
  // Confirms the navigation actually landed on the real, authenticated
  // page before treating an absent row as "no stock yet" — .count() takes
  // an instant snapshot with no auto-retry, so without this a login-cookie
  // race that briefly bounces the request back to /sign-in would silently
  // read as 0 stock instead of surfacing as a navigation failure.
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  const cementCell = page.getByText(/^Cement$/, { exact: true }).and(page.locator(":visible"));
  if ((await cementCell.count()) === 0) return 0;
  const row = cementCell.locator("xpath=ancestor::tr[1]");
  const text = (await row.locator("td").last().textContent())?.trim() ?? "0";
  return Number(text);
}

test("Owner can see real Godown and Site Stock on the Inventory page", async ({ page }) => {
  await loginAsOwner(page);

  const godownQtyBefore = await readGodownCementQty(page);

  // Seed Godown Stock (Purchase's Destination defaults to Godown).
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel(/Quantity/).fill("40");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  // Seed Site Stock at the fixture Site.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await page.getByLabel("Destination").selectOption({ label: "Site" });
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByLabel(/Quantity/).fill("15");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();

  // Godown Stock table's Material cell is the bare name; the Site Stock
  // table's is "Material (Size)" — getByText does substring matching, so
  // an anchored regex is needed here or this would also match the longer
  // Site Stock cell below.
  const godownRow = page.getByText(/^Cement$/, { exact: true }).and(page.locator(":visible")).locator("xpath=ancestor::tr[1]");
  await expect(godownRow.locator("td").last()).toHaveText(String(godownQtyBefore + 40));

  // Site Stock table row.
  await expect(visibleText(page, SITE_NAME)).toBeVisible();
  await expect(visibleText(page, "Cement (OPC 53 Grade)")).toBeVisible();
});
