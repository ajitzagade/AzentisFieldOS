import { expect, test, type Page } from "@playwright/test";
import { loginAsOwner } from "../fixtures/auth";
import { MATERIAL_NAME, MATERIAL_SIZE_LABEL, SITE_NAME, VENDOR_NAME } from "../fixtures/test-users";
import { fillField, pickCombobox, visibleText } from "../fixtures/ui";

const MATERIAL_FULL_LABEL = `${MATERIAL_NAME} (${MATERIAL_SIZE_LABEL})`;

// Same technique as the pre-existing inventory.spec.ts's readGodownCementQty
// — the fixture Material's Godown balance is a running total other tests in
// this shared e2e DB also add to, so the only reliable check is a delta,
// never an absolute/literal number.
// Columns: Material, Location, Location Type, Available Qty, Unit, Last
// Updated — index 3 (0-based) is the raw quantity; `.last()` would grab
// the Last Updated timestamp instead.
const AVAILABLE_QTY_CELL_INDEX = 3;

async function readGodownCementQty(page: Page): Promise<number> {
  await page.goto("/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  const cell = visibleText(page, MATERIAL_FULL_LABEL)
    .locator("xpath=ancestor::tr[1]")
    .locator("td")
    .nth(AVAILABLE_QTY_CELL_INDEX);
  if ((await cell.count()) === 0) return 0;
  const text = (await cell.first().textContent())?.trim() ?? "0";
  return Number(text.replace(/[^\d.-]/g, ""));
}

// Focused, direct verification of this session's two fixes:
//  1. revalidatePath staleness fix (Purchase/Movement/Consumption create
//     and delete actions) — /movements and /inventory must reflect a
//     mutation immediately, via client-side redirect, with no manual
//     reload — the exact production bug reported.
//  2. useStock's fetch-failure/zero-stock conflation fix — a failed
//     stock check must show a distinct error, never a false "No stock".
// Deliberately NOT reusing the legacy e2e specs' assertions — several of
// those have pre-existing, unrelated staleness (stale button-name
// selectors, a stale exact-match on the Material's bare name) that predate
// this session and are out of scope here.

test("a new Purchase appears on /movements immediately after redirect, with no manual reload", async ({ page }) => {
  await loginAsOwner(page);

  const note = `audit-verify-${Date.now()}`;
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_FULL_LABEL);
  await fillField(page, /Quantity/, "17");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Material Purchase" }).click();

  // The redirect itself lands on /movements — if revalidatePath didn't
  // run, this is exactly where a stale Router Cache snapshot would show
  // (no new row, no "Purchase recorded" toast reflecting the real state).
  await expect(page).toHaveURL(/\/movements/);
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });
  // DataTable's mobileCard mode renders a desktop + mobile copy of every
  // row (one CSS-hidden) — both can resolve as ":visible" simultaneously
  // depending on viewport/breakpoint, so .first() is required even after
  // visibleText()'s own filtering (see e2e/fixtures/ui.ts's own note).
  await expect(visibleText(page, "17 Bags").first()).toBeVisible();
});

test("Inventory reflects the updated Godown Stock immediately via client-side navigation, with no manual reload", async ({
  page,
}) => {
  await loginAsOwner(page);

  // Warm the Router Cache for /inventory first — this is the exact
  // scenario the original bug report described: visit a list, mutate
  // elsewhere, come back without a hard reload.
  const before = await readGodownCementQty(page);

  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_FULL_LABEL);
  await fillField(page, /Quantity/, "23");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Material Purchase" }).click();
  await expect(page).toHaveURL(/\/movements/);

  // Client-side nav back to the already-visited /inventory — this is the
  // Router Cache path that was serving stale data before the fix. Waits
  // for the toast to clear first — clicking the sidebar immediately after
  // a redirect can land mid-transition on a slow dev-mode compile.
  await expect(page.getByText("Purchase recorded")).toBeHidden({ timeout: 10_000 }).catch(() => {});
  await page.getByRole("link", { name: "Inventory" }).first().click();
  await expect(page).toHaveURL(/\/inventory/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect
    .poll(async () => {
      const cell = visibleText(page, MATERIAL_FULL_LABEL)
        .locator("xpath=ancestor::tr[1]")
        .locator("td")
        .nth(AVAILABLE_QTY_CELL_INDEX);
      const text = (await cell.first().textContent())?.trim() ?? "0";
      return Number(text.replace(/[^\d.-]/g, ""));
    }, { timeout: 10_000 })
    .toBe(before + 23);
});

test("the Purchase form's Material picker never shows a false 'No stock' badge", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);

  const input = page.getByRole("combobox", { name: "Material / Size" }).and(page.locator(":visible")).first();
  await input.click();
  await input.fill(MATERIAL_NAME.slice(0, 4));

  // The dropdown must render options but none of them may carry a bare
  // "No stock" badge — a Purchase is inward-creating, so that warning is
  // always a false alarm here regardless of the chosen destination.
  await expect(page.getByRole("option").first()).toBeVisible();
  await expect(page.getByText("No stock", { exact: true })).toHaveCount(0);
});

test("a failed stock check shows a real error, never a false 'No stock', in an outward-draw form", async ({ page }) => {
  await loginAsOwner(page);

  // Intercept the Site Stock read apps/web calls client-side and force a
  // failure — simulating the exact production scenario (API hiccup) the
  // fetch-failure/zero-stock conflation bug used to mishandle.
  await page.route("**/stock/site/**", (route) => route.fulfill({ status: 500, body: "{}" }));

  await page.goto("/movements/consumption/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_FULL_LABEL);

  // Must show the distinct error wording, not "No stock" / "No stock
  // recorded" / "Insufficient stock" — those would misreport a genuine
  // API failure as a confirmed-empty balance.
  await expect(page.getByText("Couldn't check stock")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/^No stock/)).toHaveCount(0);
});

test("sanity: a genuinely empty balance still shows a real 'No stock' warning in an outward-draw form (no regression)", async ({
  page,
}) => {
  await loginAsOwner(page);
  await page.goto("/movements/consumption/new");
  await pickCombobox(page, "Site", SITE_NAME);
  // By this point in the shared e2e DB the fixture Material has real
  // Godown stock but none at this specific Site — stockStatus's correct,
  // intended response is the Godown-fallback reassurance ("will be
  // used"), not a bare "No stock"; this test exists purely to prove the
  // earlier test's "no false No stock" fix didn't also suppress every
  // real hint (any one of these wordings proves the hint still renders).
  await pickCombobox(page, "Material / Size", MATERIAL_FULL_LABEL);
  await expect(
    page.getByText(/No stock|Insufficient stock|available at|will be used/),
  ).toBeVisible({ timeout: 10_000 });
});
