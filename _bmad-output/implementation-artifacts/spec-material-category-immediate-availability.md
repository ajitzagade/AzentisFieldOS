---
title: 'Material Category immediate availability'
type: 'bugfix'
created: '2026-09-23'
status: 'done'
route: 'one-shot'
---

# Material Category immediate availability

## Intent

**Problem:** A newly created Material Category took ~15+ seconds to appear in the Material form's category dropdown, requiring a hard refresh or wait — `createMaterialCategoryAction` (`apps/web/app/(app)/materials/categories/actions.ts`) only called `revalidatePath("/materials/categories")`, unlike its sibling `renameMaterialCategoryAction`/`toggleMaterialCategoryAction` in the same file, which already revalidated `/materials/categories`, `/materials/new`, and `/materials`. `/materials/new` fetches categories with `cache: "no-store"` but is still served stale from Next's client Router Cache until that cache entry naturally expires.

**Approach:** Added the two missing `revalidatePath` calls to `createMaterialCategoryAction`, matching the exact pattern its siblings already used. While fixing it, extracted the duplicated three-line block into a shared `revalidateCategoryPaths()` helper (mirroring the established `revalidateUnitPaths()` pattern in the sibling `units/actions.ts`) so the three actions can't drift out of sync again — that duplication was the root cause of the original bug. A review pass surfaced a real, unrelated pre-existing test-isolation bug (the `revalidatePath` mock's call history wasn't cleared between tests) which was fixed alongside adding exact-call-count assertions. Three related-but-broader staleness gaps (Edit Material form, Inventory filter, Settings summary card) were found but deliberately left out of this scoped fix and logged to `deferred-work.md`.

## Suggested Review Order

**The fix**

- Entry point: the three-line revalidation now shared by all three actions instead of duplicated per-action.
  [`actions.ts:13`](../../apps/web/app/(app)/materials/categories/actions.ts#L13)

- `createMaterialCategoryAction` now calls the shared helper — previously this was the only action missing `/materials/new` and `/materials`.
  [`actions.ts:49`](../../apps/web/app/(app)/materials/categories/actions.ts#L49)

- `renameMaterialCategoryAction` and `toggleMaterialCategoryAction` switched to the same shared helper for consistency (no behavior change — they already called all three paths).
  [`actions.ts:90`](../../apps/web/app/(app)/materials/categories/actions.ts#L90)
  [`actions.ts:125`](../../apps/web/app/(app)/materials/categories/actions.ts#L125)

**Regression tests (peripherals)**

- Proves the create action now revalidates all three paths exactly once each — the test that would have caught the original bug.
  [`actions.test.ts:66`](../../apps/web/app/(app)/materials/categories/actions.test.ts#L66)

- Symmetric coverage added to rename and toggle for the same assertion, and a `vi.clearAllMocks()` fix so call-count assertions don't leak across tests in the same file.
  [`actions.test.ts:93`](../../apps/web/app/(app)/materials/categories/actions.test.ts#L93)
  [`actions.test.ts:123`](../../apps/web/app/(app)/materials/categories/actions.test.ts#L123)
