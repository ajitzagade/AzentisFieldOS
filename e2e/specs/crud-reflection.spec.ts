import { expect, test, type Page } from "@playwright/test";
import { loginAsOwner } from "../fixtures/auth";
import { SITE_NAME } from "../fixtures/test-users";
import { fillField, pickCombobox, selectField, visibleField, visibleText } from "../fixtures/ui";

// Real-browser proof that the currently-untested CRUD operations (mark-paid,
// master-data edit/delete, advance adjustments, lookup-table reflection,
// asset movements/service logs, DSR corrections) immediately reflect in the
// UI. Every created entity carries a Date.now() suffix so retries and the
// shared, accumulating e2e database never collide.

test.beforeEach(async ({ page }) => {
  await loginAsOwner(page);
});

// The app shell's sidebar has a global "Search" (⌘K) *button* whose
// accessible name collides with every list page's "Search" TextField —
// fillField's getByLabel(...).first() resolves to the button (it comes
// first in DOM order) and fails. Scope to the textbox role instead.
async function searchList(page: Page, value: string) {
  await page
    .getByRole("textbox", { name: "Search", exact: true })
    .and(page.locator(":visible"))
    .first()
    .fill(value);
}

// Shared helper: create a Team Member through the real /team/new form and
// land back on the roster.
async function createTeamMember(page: Page, name: string) {
  await page.goto("/team/new");
  await fillField(page, "Name", name);
  await selectField(page, "Employment Type", { label: "Daily Wage" });
  await page.getByRole("button", { name: "Create Team Member" }).click();
  await expect(page).toHaveURL(/\/team$/);
}

test("marking an Employee Payment paid flips the row to Paid in place", async ({ page }) => {
  const memberName = `E2E Paid Member ${Date.now()}`;
  await createTeamMember(page, memberName);

  await page.goto("/payments/new");
  await pickCombobox(page, "Team Member", memberName);
  await fillField(page, "Base Pay", "5000");
  // The form's Payment Status select defaults to "Paid" — the mark-paid
  // flow under test needs a payment that is actually born Pending.
  await selectField(page, "Payment Status", { label: "Pending" });
  await page.getByRole("button", { name: "Employee Payment" }).click();
  // FR-54: a Payment is money-bearing, held for re-verification.
  await expect(page.getByText("Record this Payment?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();
  await expect(page).toHaveURL(/\/payments$/);
  await expect(page.getByText("Payment recorded")).toBeVisible({ timeout: 10_000 });

  // Narrow the log to just this Payment's row (the suite's shared DB holds
  // Payments from other specs), then scope every assertion to the desktop
  // <tr> — the mobile card copy is a CSS-hidden div, not a role=row.
  await searchList(page, memberName);
  const row = page.getByRole("row").filter({ hasText: memberName });
  await expect(row).toBeVisible({ timeout: 10_000 });
  await expect(row.getByText("Pending", { exact: true })).toBeVisible();

  await row.getByRole("button", { name: "Mark Paid" }).click();
  // One-directional transition — confirmed first; the dialog's own confirm
  // button carries the same "Mark Paid" label, so scope to the alertdialog.
  await expect(page.getByText("Mark this Payment as paid?")).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Mark Paid" }).click();

  // No toast assertion here: revalidatePath("/payments") re-renders the
  // list and the now-paid row drops its MarkPaidButton — the component can
  // unmount before its state.done effect fires the success toast, so the
  // toast is not reliably observable. The row's own state flip below is
  // the real proof the transition reflected in the UI.
  // The row updates in place: Paid badge in, Mark Paid control gone.
  await expect(row.getByText("Paid", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(row.getByRole("button", { name: "Mark Paid" })).toHaveCount(0);
});

test("Vendor edit and delete reflect immediately in the list", async ({ page }) => {
  const stamp = Date.now();
  const name = `E2E CRUD Vendor ${stamp}`;
  const newName = `E2E Renamed Vendor ${stamp}`;

  await page.goto("/vendors/new");
  await fillField(page, "Name", name);
  await page.getByRole("button", { name: "Create Vendor" }).click();
  await expect(page).toHaveURL(/\/vendors$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // A row click opens the summary side panel in place — the full detail
  // page (Edit/Delete) is one "View full details" click away.
  await page.getByRole("link", { name }).first().click();
  const panel = page.getByRole("dialog", { name });
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: /View full details/ }).click();
  await expect(page).toHaveURL(/\/vendors\/[^/?]+$/);
  const detailUrl = page.url();

  await page.getByRole("link", { name: "Edit Vendor" }).click();
  await expect(page).toHaveURL(/\/vendors\/.+\/edit/);
  await fillField(page, "Name", newName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/vendors(\?|$)/);
  await expect(page.getByText("Vendor updated")).toBeVisible({ timeout: 10_000 });

  // Search by the shared stamp: the renamed row shows the NEW name, and the
  // old name has vanished from the list entirely.
  await searchList(page, String(stamp));
  await expect(visibleText(page, newName)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(name)).toHaveCount(0);

  await page.goto(detailUrl);
  await page.getByRole("button", { name: "Delete Vendor" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete Vendor" }).click();
  await expect(page).toHaveURL(/\/vendors(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Vendor deleted", { exact: false })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(newName)).toHaveCount(0);
});

test("Site edit and delete reflect immediately in the list", async ({ page }) => {
  const stamp = Date.now();
  const name = `E2E CRUD Site ${stamp}`;
  const newName = `E2E Renamed Site ${stamp}`;

  await page.goto("/sites/new");
  await fillField(page, "Name", name);
  await fillField(page, "Location", "Pune, Maharashtra");
  await page.getByRole("button", { name: /Create Site|Add Site/ }).click();
  await expect(page).toHaveURL(/\/sites$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // Sites navigate straight to the detail page (no side panel).
  await page.getByRole("link", { name }).first().click();
  await expect(page).toHaveURL(/\/sites\/[^/?]+$/);
  const detailUrl = page.url();

  await page.getByRole("link", { name: "Edit Site" }).click();
  await expect(page).toHaveURL(/\/sites\/.+\/edit/);
  await fillField(page, "Name", newName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/sites(\?|$)/);
  await expect(page.getByText("Site updated")).toBeVisible({ timeout: 10_000 });

  await searchList(page, String(stamp));
  await expect(visibleText(page, newName)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(name)).toHaveCount(0);

  await page.goto(detailUrl);
  await page.getByRole("button", { name: "Delete Site" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete Site" }).click();
  await expect(page).toHaveURL(/\/sites(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Site deleted", { exact: false })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(newName)).toHaveCount(0);
});

test("Subcontractor edit and delete reflect immediately in the list", async ({ page }) => {
  const stamp = Date.now();
  const name = `E2E CRUD Subcontractor ${stamp}`;
  const newName = `E2E Renamed Subcontractor ${stamp}`;

  await page.goto("/subcontractors/new");
  await fillField(page, "Name", name);
  await page.getByRole("button", { name: "Create Subcontractor" }).click();
  await expect(page).toHaveURL(/\/subcontractors$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // Same side-panel-then-full-details pattern as Vendors.
  await page.getByRole("link", { name }).first().click();
  const panel = page.getByRole("dialog", { name });
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: /View full details/ }).click();
  await expect(page).toHaveURL(/\/subcontractors\/[^/?]+$/);
  const detailUrl = page.url();

  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(/\/subcontractors\/.+\/edit/);
  await fillField(page, "Name", newName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/subcontractors(\?|$)/);
  await expect(page.getByText("Subcontractor updated")).toBeVisible({ timeout: 10_000 });

  await searchList(page, String(stamp));
  await expect(visibleText(page, newName)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(name)).toHaveCount(0);

  await page.goto(detailUrl);
  await page.getByRole("button", { name: "Delete Subcontractor" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete Subcontractor" }).click();
  await expect(page).toHaveURL(/\/subcontractors(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Subcontractor deleted", { exact: false })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(newName)).toHaveCount(0);
});

test("renaming a Team Member reflects immediately in the roster", async ({ page }) => {
  const stamp = Date.now();
  const name = `E2E CRUD Member ${stamp}`;
  const newName = `E2E Renamed Member ${stamp}`;
  await createTeamMember(page, name);

  await page.getByRole("link", { name }).first().click();
  await expect(page).toHaveURL(/\/team\/[^/?]+$/);

  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(/\/team\/.+\/edit/);
  await fillField(page, "Name", newName);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/team(\?|$)/);
  await expect(page.getByText("Team Member updated")).toBeVisible({ timeout: 10_000 });

  await searchList(page, String(stamp));
  await expect(visibleText(page, newName)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(name)).toHaveCount(0);
});

test("an Advance Adjustment immediately reduces the Outstanding Balance", async ({ page }) => {
  const memberName = `E2E Adjust Member ${Date.now()}`;
  await createTeamMember(page, memberName);

  await page.getByRole("link", { name: memberName }).first().click();
  await expect(page).toHaveURL(/\/team\/[^/?]+$/);
  await expect(page.getByText("₹0")).toBeVisible();

  await page.getByRole("link", { name: "Record Advance" }).click();
  await fillField(page, "Amount", "2000");
  await page.getByRole("button", { name: "Record Advance" }).click();
  await expect(page.getByText("Record this Advance?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();
  await expect(page).toHaveURL(/\/team\/.+/);
  await expect(page.getByText("Advance recorded")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("₹2,000").first()).toBeVisible();

  // The ledger's Advance row carries the Adjust action into the
  // adjustments page for that specific Advance. (Ledger renders both a
  // desktop and mobile copy — .first() targets the visible desktop one.)
  await page.getByRole("link", { name: "Adjust" }).first().click();
  await expect(page).toHaveURL(/\/team\/.+\/advances\/.+\/adjustments\/new/);

  await fillField(page, "Adjustment amount", "500");
  await page.getByRole("button", { name: "Record Adjustment" }).click();
  await expect(page.getByText("Record this Adjustment?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();

  await expect(page).toHaveURL(/\/team\/[^/?]+(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Advance Adjustment recorded")).toBeVisible({ timeout: 10_000 });
  // Outstanding Balance = ₹2,000 − ₹500, reflected immediately.
  await expect(page.getByText("₹1,500").first()).toBeVisible();
});

test("a new Expense Category appears in the expense form's Category picker", async ({ page }) => {
  const catName = `E2E Category ${Date.now()}`;

  await page.goto("/expenses/categories");
  await fillField(page, "Expense Category name", catName);
  await page.getByRole("button", { name: "Add Category" }).click();
  // The categories list on this same page revalidates — creation is done.
  await expect(visibleText(page, catName)).toBeVisible({ timeout: 10_000 });

  await page.goto("/expenses/new");
  const category = page.getByRole("combobox", { name: "Category" }).and(page.locator(":visible")).first();
  await category.click();
  await category.fill(catName.slice(0, 6));
  await expect(page.getByRole("option", { name: catName })).toBeVisible({ timeout: 10_000 });
});

test("a new Employment Type appears in the new-Team-Member select", async ({ page }) => {
  const etName = `E2E Type ${Date.now()}`;

  await page.goto("/team/employment-types");
  await fillField(page, "Employment Type name", etName);
  await page.getByRole("button", { name: "Add Employment Type" }).click();
  await expect(visibleText(page, etName)).toBeVisible({ timeout: 10_000 });

  await page.goto("/team/new");
  const select = visibleField(page, "Employment Type");
  // selectOption throws if no option carries this label — then confirm the
  // selection actually landed on the new Employment Type.
  await select.selectOption({ label: etName });
  await expect(select.locator("option:checked")).toHaveText(etName);
});

test("an asset movement and a service log reflect on the Machinery detail page", async ({ page }) => {
  const stamp = Date.now();
  const name = `E2E CRUD Excavator ${stamp}`;

  await page.goto("/machinery-vehicles/machinery/new");
  await fillField(page, "Name", name);
  await selectField(page, "Type", { label: "Excavator" });
  await fillField(page, "Asset / Registration Number", `CRUD-${stamp}`);
  await page.getByRole("button", { name: "Register Machine" }).click();
  await expect(page).toHaveURL(/\/machinery-vehicles$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // The row's chevron link carries the Machine's name as its aria-label.
  await page.getByRole("link", { name }).first().click();
  await expect(page).toHaveURL(/\/machinery-vehicles\/machinery\/[^/?]+$/);

  await page.getByRole("link", { name: "Record Movement" }).click();
  await expect(page).toHaveURL(/\/machinery-vehicles\/machinery\/.+\/move/);
  // "Move To" defaults to Site, so only the destination Site needs picking.
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByRole("button", { name: "Record Movement" }).click();

  await expect(page).toHaveURL(/\/machinery-vehicles\/machinery\/[^/?]+(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });
  // The movement timeline shows the new entry as the current location.
  await expect(page.getByText(`Recorded at ${SITE_NAME}`)).toBeVisible();
  await expect(page.getByText("Current", { exact: true })).toBeVisible();
  // The profile header's "Current Site" reflects it too (name appears in
  // both the header and the timeline entry asserted above).
  await expect(page.getByText(SITE_NAME).first()).toBeVisible();

  const note = `E2E service note ${stamp}`;
  await page.getByRole("link", { name: "Log Service" }).click();
  await expect(page).toHaveURL(/\/machinery-vehicles\/machinery\/.+\/service-log\/new/);
  await fillField(page, "Cost", "500");
  await fillField(page, "Notes", note);
  await page.getByRole("button", { name: "Log Entry" }).click();

  await expect(page).toHaveURL(/\/machinery-vehicles\/machinery\/[^/?]+(\?|$)/, { timeout: 10_000 });
  await expect(page.getByText("Service log recorded")).toBeVisible({ timeout: 10_000 });
  // The new service entry lands in Fuel, Maintenance & Repair History.
  await expect(visibleText(page, note)).toBeVisible();
});

// Regression pin for a bug this spec originally caught (2026-09-19): the
// correct page passed GET /dsr/:id's full-ISO reportDate
// ("…T00:00:00.000Z") into the form verbatim, but the date input and
// createDsrSchema's z.iso.date() need "YYYY-MM-DD" — the Date field
// rendered empty and every correction submit 400'd with only the generic
// error. Fixed by slicing to the date in
// apps/web/app/(app)/daily-activity/[id]/correct/page.tsx.
test("correcting a Daily Report lands on the corrected report with the correction visible", async ({ page }) => {
  const reason = `Work summary was wrong — e2e ${Date.now()}`;

  // Submit a minimal Daily Report for the seeded Site (re-submitting for a
  // Site/date that already has a report is treated as an edit, so this is
  // safe on the suite's shared database).
  await page.goto("/dsr/new");
  await pickCombobox(page, "Site", SITE_NAME);
  await page.getByRole("button", { name: /Submit Daily Report/ }).click();
  // The playback ConfirmDialog guards submission.
  await page.getByRole("button", { name: "Confirm & Submit" }).click();
  await expect(page.getByText("Synced")).toBeVisible({ timeout: 15_000 });

  await page.goto("/daily-activity");
  await page.getByRole("link", { name: SITE_NAME }).first().click();
  await expect(page).toHaveURL(/\/daily-activity\/[^/?]+$/);

  // A retried run may land on an already-superseded report (its Correct
  // action is hidden) — hop to the latest version first if offered.
  const latest = page.getByRole("link", { name: "view the latest version" });
  if (await latest.isVisible().catch(() => false)) {
    await latest.click();
    await expect(page).toHaveURL(/\/daily-activity\/[^/?]+$/);
  }

  await page.getByRole("link", { name: "Correct", exact: true }).click();
  await expect(page).toHaveURL(/\/daily-activity\/.+\/correct/);
  await expect(page.getByText("Filing a correction")).toBeVisible();

  await fillField(page, "Reason for this correction", reason);
  await page.getByRole("button", { name: "Submit Correction" }).click();
  // FR-54 re-verification: the confirm inside the alertdialog carries the
  // same "Submit Correction" label — scope to the dialog.
  await expect(page.getByText("Submit this correction?")).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Submit Correction" }).click();

  // The single navigation point after a successful correction: the NEW
  // (corrected) report's own detail page, marked as a correction (AD-9).
  await expect(page).toHaveURL(/\/daily-activity\/[^/?]+(\?|$)/, { timeout: 15_000 });
  await expect(page.getByText("This is a correction", { exact: false })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(reason)).toBeVisible();
});
