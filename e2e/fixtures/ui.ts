import type { Page } from "@playwright/test";

// Every searchable picker in the product (SiteField, and every
// ComboboxField — Material/Size, Category, etc.) is the same interaction:
// type into the labelled combobox, click the matching option. Never a
// native <select> for these — see packages/ui/src/components/combobox-field.tsx
// and apps/web/app/(app)/_components/site-field.tsx.
export async function pickCombobox(page: Page, label: string, optionText: string) {
  const input = page.getByRole("combobox", { name: label });
  await input.click();
  await input.fill(optionText.slice(0, Math.min(6, optionText.length)));
  await page.getByRole("option", { name: optionText, exact: false }).first().click();
}

// packages/ui's DataTable renders BOTH a desktop <table> row and a mobile
// card for every entry (mobileCard mode) — one hidden via CSS at any given
// viewport, both present in the DOM. Plain `.first()` picks by DOM order,
// which is the desktop table first — wrong on a mobile viewport, where
// that copy is `display:none`. This filters to whichever copy is actually
// visible at the current viewport, so the same assertion works under both
// the desktop and mobile-chromium projects.
export function visibleText(page: Page, text: string | RegExp) {
  return page.getByText(text).and(page.locator(":visible"));
}
