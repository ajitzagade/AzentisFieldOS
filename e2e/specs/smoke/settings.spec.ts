import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";

// Story 14.4: the In-App channel is the simplest row to toggle (it never
// reveals a recipient picker). This setting is shared, seeded-once state —
// not a fresh row this test owns — so it flips the value and flips it back,
// rather than asserting a hardcoded absolute state.
test("Owner can change a Notification Channel setting and it persists", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  // GET /notification-settings orders channels alphabetically (Email,
  // In-App, WhatsApp) — In-App is the middle row, not the last. Scope to
  // its own row div (className distinguishes it from the outer section
  // wrapper, which also contains the text "In-App" via this same row).
  const inAppRow = page.locator("div.flex.flex-col.gap-3", { hasText: "In-App" });
  const toggleButton = inAppRow.getByRole("button", { name: /^(Enable|Disable)$/ });
  const statusBadge = inAppRow.getByText(/^(Enabled|Disabled)$/);
  const saveButton = inAppRow.getByRole("button", { name: "Save" });

  const wasEnabled = (await statusBadge.textContent())?.trim() === "Enabled";

  await toggleButton.click();
  await saveButton.click();
  await expect(inAppRow.getByText("Saved.")).toBeVisible({ timeout: 10_000 });

  // router.refresh() re-fetches the Server Component — reload to prove the
  // change actually persisted server-side, not just in local state.
  await page.reload();
  await expect(statusBadge).toHaveText(wasEnabled ? "Disabled" : "Enabled");

  // Flip it back so a re-run of this same test (or another dev) finds the
  // setting unchanged.
  await toggleButton.click();
  await saveButton.click();
  await expect(inAppRow.getByText("Saved.")).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(statusBadge).toHaveText(wasEnabled ? "Enabled" : "Disabled");
});
