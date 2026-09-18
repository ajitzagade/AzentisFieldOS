import { devices, expect, test } from "@playwright/test";
import { loginAsSupervisor } from "../fixtures/auth";

// Phase 3 — mobile viewport. supervisor-daily-flow already runs its whole flow
// under the mobile-chromium (Pixel 7) project; this adds a genuinely mobile-only
// interaction that the desktop layout has no equivalent of: the fixed bottom
// quick-bar, and that tapping it actually navigates (the existing mobile test
// only asserts the link's href attribute, not a real tap → route change).
test.use({ ...devices["Pixel 7"] });

test.describe("Mobile supervisor navigation", () => {
  test("the fixed bottom quick-bar navigates a Supervisor to the Daily Report form on tap", async ({ page }) => {
    await loginAsSupervisor(page);
    const quickBar = page.getByRole("navigation", { name: "Quick actions" });
    await expect(quickBar).toBeVisible();
    await quickBar.getByRole("link", { name: "Report" }).click();
    await expect(page).toHaveURL(/\/dsr\/new/);
  });
});
