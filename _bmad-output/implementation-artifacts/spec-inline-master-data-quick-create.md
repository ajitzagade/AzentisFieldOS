---
title: 'Inline "+ Add" quick-create for master-data pickers'
type: 'feature'
created: '2026-09-03'
status: 'in-review'
review_loop_iteration: 0
context: []
baseline_commit: '41e5aa2e6e0f6b335ea7d01739a0d17a25ddda37'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every Vendor/Subcontractor/Material/Team-Member picker (`SelectField` or `ComboboxField`) forces the user to abandon the current form and navigate away to create a missing master-data record — there is no "add new" affordance anywhere.

**Approach:** Extend the shared `ComboboxField` primitive with an always-visible "+ Add {label}" row; build one generic `QuickCreateModal` shell (Dialog chrome + non-redirecting `useActionState` + preserved-on-error fields, modeled on `AdvanceQuickEntryModal`); wrap it for Vendor, Subcontractor, Material, and Team Member via new non-redirecting "quick" Server Actions returning `{id, name}`; wire every existing picker so a created record is prepended into its local options and auto-selected, with the parent form untouched. (Material's/Team Member's own required Category/Unit/Employment-Type stay as plain, non-creatable pickers inside their quick-create modal for now — see `deferred-work.md`.)

## Boundaries & Constraints

**Always:** Preserve every full-page create flow unchanged (`/vendors/new`, `/subcontractors/new`, `/materials/new`, `/team/new`) — new "quick" actions are additive siblings, never replacements, mirroring the existing `createAdvanceAction`/`createAdvanceQuickAction` split. Parent form's typed values must survive the modal opening/submitting — the modal never causes the parent `<form>` to re-render, reset, or submit. A quick-created record is selected into the originating field immediately and revalidates its entity's own master-list route plus every entry-form route that lists it (existing convention, e.g. `expenses/categories/actions.ts`'s `revalidateExpenseCategoryPaths`). Only required field(s) are exposed by default; optional fields (contactPerson/phone/email/address, designation/contact) fold behind `DetailsDisclosure`; array fields (`materialsSupplied`/`workCategories`) are omitted from the quick modal, defaulting to `[]`. Material's quick-create modal still requires picking an existing Category and Unit (plain `ComboboxField`, same as today's full form); Team Member's still requires an existing Employment Type — if either list is empty, show the same "create one first" guidance used today, scoped to the modal instead of blocking a whole page.

**Ask First:** None — mechanical extension of the `AdvanceQuickEntryModal` + `add-category-form.tsx` non-redirecting-action patterns, each new file follows an exact existing template.

**Never:** Don't modify `/vendors/new` etc.'s existing redirecting actions. Don't build a generic cross-entity "master data" management screen. Don't relax Subcontractor's `OWNER_ADMIN`-only creation gate — its quick-create modal surfaces the same server-side 403 as `formError`, same as the full form. Don't add "+ Add Category"/"+ Add Unit"/"+ Add Employment Type" affordances — deferred (see `deferred-work.md`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Picker dropdown open, wanted record missing | Any Vendor/Subcontractor/Material/Team-Member combobox | "+ Add {label}" row always visible as the last row | N/A |
| Quick-create submitted valid | Modal form valid | Record created, modal closes, prepended+selected in parent picker, parent form's other fields unchanged | N/A |
| Quick-create submitted invalid | Duplicate name / missing required field | Modal stays open, typed values preserved, inline errors shown | Same `{errors}`/`{formError}` shape as full form |
| Subcontractor quick-create by non-Owner/Admin | Non-privileged user submits | 403 surfaces as `formError` | Same as `/subcontractors/new`'s existing 403 handling |
| Material quick-create, no existing Category/Unit | Category or Unit list empty | Modal shows "create one first" guidance for that field, same as today's full form | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/combobox-field.tsx:39-193` -- add `onCreateNew?`, `createNewLabel?` props; render a persistent `<button>` row after `Combobox.List` inside `Combobox.Popup`, sibling to `Combobox.Empty` (not a `Combobox.Item` — never filtered/selectable as data)
- `packages/ui/src/components/advance-quick-entry-modal.tsx` (whole file) -- template: `Dialog.Root/Portal/Backdrop/Popup`, `useActionState` + key-remount + `announcedRef`-guarded `onSuccess`, `usePreventFormResetOnError` wiring
- `packages/ui/src/components/quick-create-modal.tsx` -- NEW generic shell (props: `open`, `onOpenChange`, `title`, `description?`, `action`, `onSuccess({id,name})`, `submitLabel`, `children` render prop receiving `errorFor`)
- `packages/ui/src/components/details-disclosure.tsx:10-29` -- reuse as-is for optional fields
- `apps/web/app/(app)/vendors/new/actions.ts,parse.ts` -- add sibling `createVendorQuickAction` (non-redirecting, `{success,id,name}`); revalidate `/vendors` + `/movements/purchases/new`, `/rmc/new`, `/waste-disposal/new`, `/daily-activity`, `/dsr/new`
- `apps/web/app/(app)/subcontractors/new/actions.ts,parse.ts` -- add `createSubcontractorQuickAction`, preserving the existing `OWNER_ADMIN` 403 branch; revalidate `/subcontractors` + `/sites/[id]/contracts` routes
- `apps/web/app/(app)/materials/new/actions.ts,parse.ts` -- add `createMaterialQuickAction`; revalidate `/materials` + every Material-combobox entry form
- `apps/web/app/(app)/team/new/actions.ts,parse.ts` -- add `createTeamMemberQuickAction`; revalidate `/team` + every Team-Member-combobox entry form
- Picker call sites to wire `onCreateNew` + prepend-and-select on success: **Vendor** -- `movements/purchases/purchase-form.tsx:211-221` (convert `SelectField`→`ComboboxField`, mirroring the controlled `materialSizeId` pattern at line 141/223-237), `rmc/rmc-form.tsx:168-180`, `waste-disposal/waste-disposal-form.tsx:242-254`, `daily-activity/_components/dsr-desktop-form.tsx`, `dsr/new/page.tsx`. **Subcontractor** -- `sites/[id]/contracts/site-contract-form.tsx:86-98` (convert `SelectField`→`ComboboxField`, add state + hidden input — none exist today). **Material** -- `purchase-form.tsx:223-237`, `movements/consumption/consumption-form.tsx:180-195`, `movements/godown-to-site/movement-form.tsx:195-209`, `movements/return-wastage/return-wastage-form.tsx:184+`, `dsr-desktop-form.tsx`, `dsr/new/page.tsx`. **Team Member** -- `payments/payment-form.tsx:123-134`, `dsr-desktop-form.tsx:387-397`, `daily-activity/work-records/new/work-record-form.tsx:202+`, `advance-quick-entry-modal.tsx:121-133`
- `materials/new/new-material-form.tsx:29-116`, `team/new/new-team-member-form.tsx` -- unchanged in this spec (their empty-Category/Unit/Employment-Type blocking `Card` stays; only the four named entities' pickers elsewhere in the app gain `onCreateNew`)
- `apps/api/src/{vendors,subcontractors,materials,team}/*.service.ts` -- confirmed all already return the full created row (`id`+`name` present) on `POST` — no API changes needed

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/components/combobox-field.tsx` -- add `onCreateNew`/`createNewLabel` + always-visible action row -- foundation every picker below depends on
- [x] `packages/ui/src/components/quick-create-modal.tsx` -- new generic modal shell -- single reusable implementation (AD-5), modeled on `advance-quick-entry-modal.tsx`
- [x] `vendors/new/actions.ts+parse.ts`, `subcontractors/new/actions.ts+parse.ts`, `materials/new/actions.ts+parse.ts`, `team/new/actions.ts+parse.ts` -- add each entity's `createXQuickAction` sibling (non-redirecting, returns `{success,id,name}`), existing redirecting actions untouched. Material's quick action additionally creates a first `MaterialSize` (see deferred-work.md) since every wired picker keys on `materialSizeId`, not a bare Material id.
- [x] `vendors/_components/vendor-quick-create-modal.tsx`, `subcontractors/_components/subcontractor-quick-create-modal.tsx`, `team/_components/team-member-quick-create-modal.tsx` -- thin `QuickCreateModal` wrappers; optional fields behind `DetailsDisclosure`
- [x] `materials/_components/material-quick-create-modal.tsx` -- wrapper with plain (non-creatable) Category/Unit `ComboboxField`s, matching `new-material-form.tsx`'s existing options/empty-state copy, plus a required Size field (see deferred-work.md)
- [x] Wire `onCreateNew` into every picker call site listed in Code Map -- converted the two native `SelectField` pickers (Vendor in `purchase-form.tsx`, Subcontractor in `site-contract-form.tsx`) to `ComboboxField` first; each modal's `onSuccess` prepends the record into the local options array/state and selects it
- [x] New tests: `combobox-field.test.tsx` (action row renders/fires), `quick-create-modal.test.tsx` (success calls `onSuccess({id,name})`, error preserves field values), plus a dedicated test file per wrapper modal. Round-trip integration tests (parent form's other fields survive a quick-create) were added to `purchase-form.test.tsx` (Vendor + Material), `site-contract-form.test.tsx` (Subcontractor), and `advance-quick-entry-trigger.test.tsx` (Team Member, nested-modal case) as representative coverage across all four entities and every wiring pattern used (plain form, row-indexed DSR form, nested-inside-another-modal) — not literally one per every wired form (12+ call sites); the shared primitives' own unit tests cover the mechanism itself.

**Acceptance Criteria:**
- Given any Vendor/Subcontractor/Material/Team-Member combobox anywhere in the app, when the desired record doesn't exist, then a "+ Add {label}" row is always visible last.
- Given a user has partially filled a parent form and the needed record is missing, when they create it via the modal, then every previously-typed parent-form value is unchanged and the new record is selected into the picker.
- Given a quick-created record, when the user next visits that entity's master list page, then the record appears there.
- Given the existing full-page `/vendors/new`, `/subcontractors/new`, `/materials/new`, `/team/new` flows used directly, then their behavior (redirect, validation, role gating) is unchanged.
- Given a Material quick-create modal with no existing Category or Unit, then the same "create one first" guidance shown today appears inside the modal (no worse than today, no nested creation yet).

## Design Notes

Non-redirecting "quick" actions mirror the existing `createAdvanceAction`/`createAdvanceQuickAction` split (`team/[id]/advances/actions.ts`) — never make a primary create action conditionally redirect. The "+ Add" row is a plain `<button type="button">` outside `Combobox.List`, so typing never filters it out and it's never treated as a selectable data option.

```tsx
<ComboboxField ... onCreateNew={() => setQuickCreateOpen(true)} createNewLabel="+ Add Vendor" />
<VendorQuickCreateModal open={quickCreateOpen} onOpenChange={setQuickCreateOpen}
  onSuccess={(v) => { setVendors((prev) => [v, ...prev]); setVendorId(v.id); }} />
```

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test` -- all existing + new tests pass
- `pnpm --filter @azentisfieldos/ui test` -- new `combobox-field`/`quick-create-modal` unit tests pass
- `pnpm --filter @azentisfieldos/web typecheck` -- no errors
- `pnpm --filter @azentisfieldos/web lint` -- no new errors

**Manual checks:**
- Dev server: open Record a Purchase, type several fields, add a brand-new Vendor via "+ Add Vendor" mid-form -- confirm typed fields survive and the new Vendor is selected; repeat for Record Consumption's Material picker and a Site Contract's Subcontractor picker.
