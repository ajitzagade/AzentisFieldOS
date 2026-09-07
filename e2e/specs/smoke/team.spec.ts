import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { visibleText } from "../../fixtures/ui";

test("Owner can add a Team Member and they appear in the roster", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/team/new");

  const name = `E2E Smoke Member ${Date.now()}`;
  // A known upstream @base-ui-components/react (1.0.0-rc.0, latest
  // available) bug occasionally leaves an orphaned duplicate of a field in
  // the DOM — .first() consistently lands on the live, React-controlled
  // input in every confirmed repro so far.
  await page.getByLabel("Name").first().fill(name);
  await page.getByLabel("Employment Type").selectOption({ label: "Daily Wage" });
  await page.getByRole("button", { name: "Create Team Member" }).click();

  await expect(page).toHaveURL(/\/team$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});
