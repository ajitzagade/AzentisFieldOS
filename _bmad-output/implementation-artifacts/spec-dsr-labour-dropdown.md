---
title: 'DSR Labour section: searchable dropdown backed by DailyLabourer'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '2e8a0405aab2bb20d47366158ae9195e3ad66fe0'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** DSR's Labour section is a free-text category + headcount tally (`{category, men, women}`), disconnected from the Labour Payment module's named `DailyLabourer` registry — no sync, no reuse, re-typing the same names/categories every day.

**Approach:** Each DSR Labour row becomes "pick one named Labourer" — a searchable `ComboboxField` sourced from `GET /daily-labourers` (added to the existing `useDsrReferenceData` hook, exact same shape as Subcontractor/Vendor/Team Member), with inline "+ Add Labour" opening a new `DailyLabourerQuickCreateModal` (thin wrapper over the existing `QuickCreateModal` shell, mirroring `SubcontractorQuickCreateModal` almost verbatim). `dsrLabourEntrySchema` becomes a union: a new `{labourerId}` shape for entries going forward, plus the legacy `{category, men, women}` shape kept valid for historical rows only (same additive-backward-compat approach the Subcontractor goal used for `siteContractId`/`quantity`) — never rewritten, per AD-9.

## Boundaries & Constraints

**Always:**
- Mirror the Subcontractor picker pattern in `dsr-desktop-form.tsx`/`dsr/new/page.tsx` exactly: `ComboboxField` + `onCreateNew`/`createNewLabel` + a `xQuickCreateRow: number | null` state + a quick-create modal rendered once, keyed to that row.
- `useDsrReferenceData` gains `labourerOptions`/`addLabourerOption`, fetched via `fetchList<DailyLabourerListItem>("/daily-labourers?isActive=true")` alongside the existing 8 parallel fetches — same `Promise.all` call.
- `DailyLabourersService.list()` gains `isActive` filtering (currently absent — a real, separately-flagged gap) so inactive Labourers don't appear as pickable options.
- `dsrLabourEntrySchema` is a `z.union` of the new `{labourerId, clientGeneratedId?}` shape and the existing legacy `{category, men, women, clientGeneratedId?}` shape — historical JSON rows keep validating and rendering exactly as before; only new writes use the new shape.
- `DailyLabourerQuickCreateModal` + `createDailyLabourerQuickAction` mirror `SubcontractorQuickCreateModal`/`createSubcontractorQuickAction` exactly (name required, category as a `SelectField` using `DAILY_LABOURER_CATEGORIES`, `defaultPerDayAmount` optional behind `DetailsDisclosure`).
- The DSR display layer (detail page, compiled/emailed report) must render BOTH old-shape and new-shape labour entries — a type guard (`"labourerId" in entry`), not a hard cutover.

**Ask First:** None identified — this was pre-anticipated by the codebase's own recent work (`DAILY_LABOURER_CATEGORIES`'s export comment explicitly names this goal as its consumer).

**Never:**
- No headcount/quantity field on the new row shape — each row is exactly one named person (per the confirmed design decision); to log multiple people, add multiple rows.
- Don't touch `dsrSubcontractorEntrySchema`/the Subcontractor picker — unrelated, already-shipped precedent, reference-only.
- Don't remove or migrate legacy `{category, men, women}` rows — they stay exactly as stored (AD-9).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pick existing Labourer | Search "Ramesh", select | Row shows `labourerId`, category visible via the option's description | N/A |
| Inline add | "+ Add Labour" → name+category submitted | New Labourer created, prepended to `labourerOptions`, immediately selected on the row that triggered it | N/A |
| Inactive Labourer | A Labourer with `isActive: false` | Does not appear in the dropdown | N/A |
| Submit with no rows / empty selection | A row with no `labourerId` chosen | Rejected (row incomplete) | Existing per-row validation pattern |
| Render a historical report | Old JSON `{category, men, women}` | Displays exactly as before (old UI shape) | N/A |
| Render a new report | New JSON `{labourerId}` | Displays the Labourer's name + category | N/A |

</frozen-after-approval>

## Code Map

- `daily-site-report.ts:93-106` -- `dsrLabourEntrySchema` becomes `z.union([newShape, legacyShape.refine(...)])`.
- `daily-labourers.service.ts:42-78` + `.controller.ts:30-39` -- add `isActive` to `DailyLabourersListQuery`/`@Query`, filter when requested (mirrors `TeamMembersService`'s existing `isActive: true` precedent).
- `apps/web/lib/use-dsr-reference-data.ts` -- add `LabourerListItem`, `labourerOptions`, `addLabourerOption`; add `fetchList<LabourerListItem>("/daily-labourers?isActive=true")` to the existing `Promise.all` (L132-141) + `setData` (L142-189) — mirrors `subcontractorOptions`/`addSubcontractorOption` exactly (L41,59,110,139,185,213-215,234).
- New `apps/web/app/(app)/labour-payments/_components/daily-labourer-quick-create-modal.tsx` -- mirrors `subcontractors/_components/subcontractor-quick-create-modal.tsx` verbatim: Name (required), Category (`SelectField`, `DAILY_LABOURER_CATEGORIES`, required), `defaultPerDayAmount` (optional, behind `DetailsDisclosure`).
- `labour-payments/new/actions.ts` -- shared `submitLabourer()` (mirrors `submitSubcontractor()`) + existing `createDailyLabourerAction` (redirects) + new `createDailyLabourerQuickAction` (non-redirecting).
- `dsr-desktop-form.tsx:1307-1365` -- Category/Men/Women trio → `ComboboxField` (`reference.labourerOptions`, `onCreateNew`/`createNewLabel`) + `labourerQuickCreateRow` state + modal render (mirrors L1206-1219 + L1544-1558 exactly).
- `dsr/new/page.tsx:1988-2043` (mobile) -- identical treatment.
- Display sites (detail page, compiled/emailed report) -- type-guard both entry shapes.
- Tests: schema union tests, `use-dsr-reference-data.test.ts`, new modal test, both DSR form tests, `daily-labourers.service.spec.ts`/`.controller.spec.ts` (isActive).

## Tasks & Acceptance

**Execution:**
- [x] `daily-site-report.ts` -- union schema (new + legacy labour entry shapes)
- [x] `daily-labourers.service.ts` + `.controller.ts` -- `isActive` filter
- [x] `use-dsr-reference-data.ts` -- `labourerOptions`/`addLabourerOption`, new fetch
- [x] `daily-labourer-quick-create-modal.tsx` (new) -- mirrors SubcontractorQuickCreateModal
- [x] `labour-payments/new/actions.ts` -- `createDailyLabourerQuickAction`
- [x] `dsr-desktop-form.tsx` + `dsr/new/page.tsx` -- Labour row → ComboboxField + quick-create wiring
- [x] DSR display sites -- type-guard both entry shapes
- [x] Extend/add the test files in Code Map
- [x] `daily-activity/[id]/correct/page.tsx` (review patch) -- warning banner when legacy Labour rows can't be carried into an edit, so the user is told before silently losing that data from the edited version

**Acceptance Criteria:**
- Given the DSR Labour section, when a Site Engineer searches and selects an existing Labourer, then the row records that Labourer's id.
- Given no matching Labourer exists, when "+ Add Labour" is used, then the new Labourer is created, immediately selectable, and auto-selected on the triggering row.
- Given a Labourer marked inactive, when the dropdown is opened, then it does not appear.
- Given a historical DSR with old-shape labour entries, when its detail page or compiled report renders, then it displays exactly as before, unaffected by this change.

## Spec Change Log

**Patch (2026-09-24, post-review):** the correction/edit page silently dropped legacy-shape Labour rows from the edited version with no indication to the user — found via direct manual review, not the automated pass. Fixed: a warning banner ("N Labour entries use an older format and can't be carried into this form — re-add them below if still relevant") now shows on the Edit page whenever this applies, with a test proving it renders. A single blind-hunter review pass on the full diff afterward surfaced several other points; most matched existing, already-accepted precedent (live name resolution, silent-fallback-to-empty-map, duplicate-pick no-op — all identical to the already-shipped Subcontractor picker) or were false alarms verified directly against the code (Prisma's default `.create()` does return `name`; the compiled/emailed report's "labour" field is the separate Team/WorkRecord attendance system, not `DailyLabourer`; `GET /daily-labourers` with no page params confirmed to return a flat array). Three real, lower-priority items were logged to `deferred-work.md`: the mobile draft-resume path has the same silent-drop gap without a warning, a deactivated Labourer referenced by an existing row renders as a confusing blank (not actual data loss) in the picker, and the warning banners lack `aria-live`/`role="alert"` (matching a pre-existing pattern across this app, not unique to this change).

## Design Notes

The union-schema approach (new `{labourerId}` shape + legacy `{category,men,women}` shape kept valid) mirrors exactly how `dsrSubcontractorEntrySchema` evolved from pure free text to `subcontractorId`-backed in an earlier pass — additive, historical rows untouched, AD-9-compliant. No new architectural pattern is introduced; every piece (searchable dropdown, inline quick-create, reference-data hook, quick-action) already exists at least once elsewhere in this exact module and is being mirrored, not invented.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass

**Run (2026-09-24):**
- `pnpm typecheck` -- 4/4 packages passed.
- `pnpm --filter @azentisfieldos/api test` against `azentisfieldos_test` -- 132 files / 1455 tests passed.
- `pnpm --filter @azentisfieldos/web test` -- 214 files / 1250 tests passed (includes the post-review warning-banner test).

**Manual checks (if no CLI):**
- Open a DSR form (desktop and mobile), add a Labour row, search for an existing Labourer, confirm selection works; use "+ Add Labour" for a new name, confirm it's immediately selected; submit and confirm the detail page renders it correctly. Open an old, already-submitted DSR predating this change and confirm its Labour section still renders.

## Suggested Review Order

**Schema: the backward-compatible union**

- Entry point: new + legacy shapes, mirroring how `dsrSubcontractorEntrySchema` evolved before this.
  [`daily-site-report.ts:132`](../../packages/shared/src/schemas/daily-site-report.ts#L132)

**Backend: isActive filter**

- The DSR picker's own fetch (`?isActive=true`) — mirrors `TeamMembersService`'s precedent.
  [`daily-labourers.service.ts:65`](../../apps/api/src/labour-payments/daily-labourers.service.ts#L65)

**Client wiring (mirrors the Subcontractor picker verbatim)**

- The new reference-data fetch and option list.
  [`use-dsr-reference-data.ts:208`](../../apps/web/lib/use-dsr-reference-data.ts#L208)

**Post-review patch: the data-loss warning**

- Computing how many legacy rows can't be carried into the edit form.
  [`correct/page.tsx:166`](../../apps/web/app/(app)/daily-activity/[id]/correct/page.tsx#L166)

**Peripherals**

- `daily-labourer-quick-create-modal.tsx` (new), both DSR forms' Labour row UI, and the extensive test coverage — all mirror existing, already-shipped patterns; see the Spec Change Log for what the review pass checked and ruled out.
