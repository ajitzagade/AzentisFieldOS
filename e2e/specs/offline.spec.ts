import { expect, test } from "@playwright/test";
import { loginAsSupervisor } from "../fixtures/auth";
import { SITE_NAME } from "../fixtures/test-users";
import { pickCombobox } from "../fixtures/ui";

// Phase 3 — real-world offline durability. The whole point of the Daily Report
// form on a field network is that a submission is never lost: when the POST
// fails (offline) it is queued to IndexedDB ("Saved on device"), and drained
// when connectivity returns ("Synced"). Driven with Playwright's network
// emulation. The service worker is blocked in this config, but the offline
// queue is app-level IndexedDB + fetch, independent of the SW.
test.describe("Offline Daily Report queue", () => {
  test("a Daily Report submitted offline is saved on device, then syncs when back online", async ({ page }) => {
    await loginAsSupervisor(page);
    // Load the form while still online — an offline navigation couldn't fetch
    // the page (the SW that would serve it from cache is blocked here).
    await page.goto("/dsr/new");
    await pickCombobox(page, "Site", SITE_NAME);

    // Go offline, then submit: the POST fails and the report is queued locally.
    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Submit Daily Report" }).click();
    // The playback ConfirmDialog guards submission (works offline — it's
    // client-side; only the confirmed POST hits the network).
    await page.getByRole("button", { name: "Confirm & Submit" }).click();
    await expect(page.getByText("Saved on device — will sync when back online")).toBeVisible({ timeout: 15_000 });

    // Reconnect and fire the 'online' event the form listens for; the queue
    // drains and the same form flips to "Synced".
    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(page.getByText("Synced")).toBeVisible({ timeout: 15_000 });
  });
});
