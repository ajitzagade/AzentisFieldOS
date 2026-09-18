import type { Locator, Page } from "@playwright/test";

// THE duplicate-field bug, root-caused (2026-09-18):
// On ~1/3 of loads, any form containing a Base UI `Combobox.Portal`
// (1.0.0-rc.0) hits a SILENT React hydration bailout: React client-renders
// a fresh copy of the form subtree but leaves the entire server-rendered
// form connected in the live DOM (both an SSR `_R_…` useId node and a client
// `_r_…` node coexist, no console warning at all). The orphaned SSR copy is
// a SEPARATE <form> with stale/empty values, collapsed to a zero-size box —
// so it is NOT submitted (the real form serialises the correct single value,
// verified) and the impact is limited to (a) a mild WCAG concern — duplicate
// labelled controls intermittently in the DOM — and (b) THIS: any locator
// matching by accessible name (getByLabel / getByRole) matches BOTH nodes and
// trips Playwright strict mode, or `.fill()`s the invisible stale copy.
// The real fix is upstream (Base UI past rc.0); see the tracked product bug.
// Test-side, ALWAYS drive the copy a real user sees: the visible one. The
// zero-size orphan is never `:visible`, so intersecting with `:visible`
// disambiguates deterministically (same trick as `visibleText`, below).

/** A label-matched control scoped to the one the user can actually see. */
export function visibleField(page: Page, label: string | RegExp, scope?: Locator) {
  return (scope ?? page)
    .getByLabel(label)
    .and(page.locator(":visible"))
    .first();
}

/** Fill the visible labelled input (never the hydration-orphan copy). */
export async function fillField(page: Page, label: string | RegExp, value: string, scope?: Locator) {
  await visibleField(page, label, scope).fill(value);
}

/** Check/uncheck the visible labelled checkbox or radio. */
export async function checkField(page: Page, label: string | RegExp, scope?: Locator) {
  await visibleField(page, label, scope).check();
}

/** Select an option in the visible labelled native <select>. Accepts the same
 * argument as Playwright's own `selectOption` (a value string or `{ label }`). */
export async function selectField(
  page: Page,
  label: string | RegExp,
  option: Parameters<Locator["selectOption"]>[0],
  scope?: Locator,
) {
  await visibleField(page, label, scope).selectOption(option);
}

// Every searchable picker in the product (SiteField, and every
// ComboboxField — Material/Size, Category, etc.) is the same interaction:
// type into the labelled combobox, click the matching option. Never a
// native <select> for these — see packages/ui/src/components/combobox-field.tsx
// and apps/web/app/(app)/_components/site-field.tsx.
export async function pickCombobox(page: Page, label: string, optionText: string) {
  // `:visible` + `.first()` lands on the live, React-controlled input rather
  // than the zero-size hydration-orphan copy (see the note above).
  const input = page.getByRole("combobox", { name: label }).and(page.locator(":visible")).first();
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
