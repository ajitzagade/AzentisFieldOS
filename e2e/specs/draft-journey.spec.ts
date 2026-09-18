import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { fillField, pickCombobox } from "../fixtures/ui";

// Phase 2 — the new Daily Report draft lifecycle, driven end to end as real
// users across roles: a Supervisor saves a draft (which must NOT surface as a
// submitted report anywhere), then finalizes it (which must). Uses a freshly
// created, uniquely-named Site so it can never collide with the seeded Site
// other specs submit against — a submitted report for the same (site,date)
// would block the draft per the "already submitted → use Correct" rule.
test.describe("Daily Report draft lifecycle", () => {
  test("a Supervisor's draft stays private until Finalize, then appears in the activity log", async ({ page }) => {
    const siteName = `E2E Draft Site ${Date.now()}`;

    // Owner creates the isolated Site.
    await loginAsOwner(page);
    await page.goto("/sites/new");
    await fillField(page, "Name", siteName);
    await fillField(page, "Location", "Pune, Maharashtra");
    await page.getByRole("button", { name: "Create Site" }).click();
    await expect(page).toHaveURL(/\/sites/);

    // Hand off to the Supervisor.
    await page.context().clearCookies();
    await loginAsSupervisor(page);

    // Save a draft for the new Site (a Site alone is enough to draft).
    await page.goto("/dsr/new");
    await pickCombobox(page, "Site", siteName);
    await page.getByRole("button", { name: "Save Draft" }).click();
    await expect(page.getByText(/Draft saved/)).toBeVisible({ timeout: 10_000 });

    // Deferred visibility: the log lists every Site with a report-status
    // badge. A draft is not a submitted report, so the new Site's row must
    // read "Not submitted" (a submitted DSR would flip it to "Submitted").
    await page.goto("/daily-activity");
    await expect(page.getByRole("heading", { name: "Daily Reports" })).toBeVisible();
    const draftRow = page.getByRole("row").filter({ hasText: siteName });
    await expect(draftRow).toContainText("Not submitted");

    // Resume the draft for that Site and finalize it.
    await page.goto("/dsr/new");
    await pickCombobox(page, "Site", siteName);
    await expect(page.getByText(/Continuing your saved draft/)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Finalize Report" }).click();
    // Finalize is async and shows "Synced" on success (no redirect) — wait for
    // it before navigating, or the /daily-activity read races the write.
    await expect(page.getByText("Synced")).toBeVisible({ timeout: 15_000 });

    // Now it IS a submitted report — the same Site's row flips to "Submitted".
    await page.goto("/daily-activity");
    await expect(page.getByRole("heading", { name: "Daily Reports" })).toBeVisible();
    const finalizedRow = page.getByRole("row").filter({ hasText: siteName });
    await expect(finalizedRow).not.toContainText("Not submitted");
    await expect(finalizedRow).toContainText("Submitted");
  });
});
