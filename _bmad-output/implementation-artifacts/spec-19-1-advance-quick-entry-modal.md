---
title: 'Advance Quick-Entry Modal (Story 19.1)'
type: 'feature'
created: '2026-09-02'
status: 'done'
baseline_commit: '990af78341ca798112e2c97fc3e093e107b39e58'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.1-advance-quick-entry-modal.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Recording an Advance requires navigating to a specific Team Member's profile first (Dashboard → Team & Labour → find member → Record Advance) — 3 clicks even though the Dashboard already shows the Outstanding Advances figure.

**Approach:** Add a "Record Advance" button to the Dashboard's Outstanding Advances card that opens a lightweight modal (searchable Team Member combobox + amount + reason), reusing the existing `Advance` schema and write path — no new backend flow.

## Boundaries & Constraints

**Always:** Reuse `createAdvanceSchema`/`parseCreateAdvanceForm` unchanged; POST to the existing `/advances` endpoint; build the modal on Base UI's `Dialog` (not `AlertDialog`) matching `SearchPalette`/`ConfirmDialog`'s existing chrome (`rounded-lg`, `bg-surface-1`, `shadow-3`, `bg-ink-900/50` backdrop); fetch the Team Member list client-side via `useAuthedFetch()` only when the modal opens (not added to `OwnerDashboard`'s server-side parallel fetch — it's a server component today and must stay one); on success, call `toast.success(...)` and close the modal, staying on the Dashboard.

**Ask First:** None — scope is fixed to one trigger point (Outstanding Advances card); Stories 19.3/19.4 add more triggers later.

**Never:** No new Prisma model/migration. No parallel Zod schema. No change to the existing full Advance form's (`advance-form.tsx`) behavior or its redirect-on-success. No `?flash=` query-param toast — that pattern exists only because a redirect unmounts the form; this modal never redirects, so call `toast.success()` directly.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Valid Team Member + amount + optional reason | `POST /advances` succeeds; modal closes; `toast.success("Advance recorded")`; Dashboard unchanged otherwise | N/A |
| Validation error | Missing/zero amount | Inline per-field error under the field, modal stays open | Mirrors `createAdvanceSchema`'s existing messages |
| Server error | API returns non-2xx | `formError` message shown inside the modal | Modal stays open, no navigation |
| Team Member fetch fails on open | `GET /team-members` errors | Combobox shows an inline "Couldn't load Team Members" state | Modal still opens; retry by reopening |
| Cancel | User clicks Cancel/backdrop | Modal closes, no record created, no fetch side effects linger | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/owner-dashboard.tsx:410-418` -- Outstanding Advances `OverallCard`; add a client trigger component here alongside the existing "View Payments" link. Server component — do not add client state here.
- `apps/web/app/(app)/team/[id]/advances/actions.ts` -- `createAdvanceAction` always `redirect()`s on success. Extract its parse+POST+error-mapping into an internal helper; add `createAdvanceQuickAction` that returns `{ success: true }` instead of redirecting. Reuses the same schema/endpoint — only the Next.js navigation outcome differs per caller.
- `apps/web/app/(app)/team/[id]/advances/parse.ts` -- `parseCreateAdvanceForm`, reused unchanged.
- `packages/shared/src/schemas/advance.ts` -- `createAdvanceSchema`, reused unchanged.
- `apps/web/app/(app)/team/[id]/advances/advance-form.tsx` -- field markup (Amount/Date/Reason/Payment Method) to mirror for the modal's `mode="new"` fields; do not fork the correction-mode logic.
- `apps/web/app/(app)/payments/payment-form.tsx:120-132` -- `ComboboxField` Team Member picker pattern to mirror (`TeamMemberOption[]` prop, `value`/`onValueChange`, hidden input).
- `apps/web/lib/use-authed-fetch.ts` -- `useAuthedFetch()` client hook for the on-open `GET /team-members` fetch.
- `apps/web/app/(app)/_components/flash-toast.tsx` -- read the comment on why redirects use `?flash=`; this story's modal must call `useToast()`'s `toast.success()` directly instead (no redirect to unmount).
- `packages/ui/src/components/search-palette.tsx:109-114`, `packages/ui/src/components/confirm-dialog.tsx:37-40` -- Base UI `Dialog`/`AlertDialog` chrome convention to match exactly.
- `apps/api/src/team/team-members.controller.ts:30-37` -- `GET /team-members` (`q`, `page`, `pageSize` supported); call it for a full-ish list, same precedent as `PaymentForm`'s pre-fetched `teamMembers` prop.
- `packages/ui/src/index.ts` (or equivalent barrel) -- export the new modal component.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/app/(app)/team/[id]/advances/actions.ts` -- extract shared parse+POST+error-mapping into an internal helper; add `createAdvanceQuickAction(prevState, formData)` returning `{ success: true }` on success instead of redirecting -- keeps one write path, lets the modal avoid navigation
- [x] `packages/ui/src/components/advance-quick-entry-modal.tsx` -- new client component: Base UI `Dialog` shell + Team Member `ComboboxField` (list passed as a prop) + Amount/Date/Reason fields mirroring `AdvanceForm`'s `mode="new"` Card -- new shared primitive per AD-5, not a fork of `AdvanceForm`
- [x] `apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx` -- new client component: "Record Advance" button, modal open state, on-open `GET /team-members` via `useAuthedFetch`, calls `createAdvanceQuickAction`, `toast.success()` on success -- isolates all client-only behavior so `owner-dashboard.tsx` stays a server component
- [x] `apps/web/app/(app)/_components/owner-dashboard.tsx` -- render `<AdvanceQuickEntryTrigger />` inside the Outstanding Advances `OverallCard` -- this story's one entry point
- [x] Unit tests for the modal (validation errors, cancel, success-without-redirect) and for `createAdvanceQuickAction`'s non-redirecting success path -- covers the I/O matrix above

**Acceptance Criteria:**
- Given I click "Record Advance" on the Outstanding Advances card, when the modal opens, then I see a searchable Team Member combobox, amount field, and reason field
- Given I select a Team Member, enter an amount and reason, and submit, when the save succeeds, then the same `Advance` record is created via the existing `/advances` endpoint
- Given the save succeeds, when the modal closes, then I remain on the Dashboard with a success toast — never a full-page redirect
- Given validation fails, when I submit, then inline per-field errors appear, mirroring the shared Zod schema (AD-7)
- Given I click Cancel, when it activates, then the modal closes with no record created

## Design Notes

Every existing form in this codebase confirms success via `redirect(...?flash=...)` because a redirect unmounts the form (see `flash-toast.tsx`'s own comment). This modal is the first success path that does *not* redirect — because it doesn't navigate away, it can call `useToast()`'s `toast.success("Advance recorded")` directly in the client component after `createAdvanceQuickAction` returns `{ success: true }`, then close the dialog. Don't reach for the `?flash=` pattern here; it solves a problem this component doesn't have.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/ui typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/ui test` -- expected: new modal tests pass, no regressions
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: `advance-form`/`actions`/`owner-dashboard` tests pass, new trigger/action tests pass

**Manual checks (if no CLI):**
- Sign in as Owner, open Dashboard, click "Record Advance" on the Outstanding Advances card, select a Team Member, submit a valid amount, confirm the modal closes with a success toast and the Dashboard's Outstanding Advances figure/that Team Member's ledger reflect the new entry — no navigation occurred.

## Suggested Review Order

**The new shared modal (packages/ui)**

- The modal itself — Base UI `Dialog`, matching `SearchPalette`'s chrome, not `ConfirmDialog`'s `AlertDialog` (no extra confirm step, per the "lightweight" framing).
  [`advance-quick-entry-modal.tsx:79`](../../packages/ui/src/components/advance-quick-entry-modal.tsx#L79)

**One write path, two navigation outcomes (Server Action)**

- `submitAdvance` — the extracted parse+POST+error-mapping shared by both callers below; this is where to check nothing diverged from the original behavior.
  [`actions.ts:25`](../../apps/web/app/\(app\)/team/\[id\]/advances/actions.ts#L25)
- `createAdvanceAction` — unchanged redirect-on-success caller, now just a thin wrapper around `submitAdvance`.
  [`actions.ts:91`](../../apps/web/app/\(app\)/team/\[id\]/advances/actions.ts#L91)
- `createAdvanceQuickAction` — the new non-redirecting caller the modal binds to.
  [`actions.ts:111`](../../apps/web/app/\(app\)/team/\[id\]/advances/actions.ts#L111)

**Dashboard integration (why the KPI actually updates)**

- On-open Team Member fetch with a defensive shape check, added in the review pass.
  [`advance-quick-entry-trigger.tsx:54`](../../apps/web/app/\(app\)/_components/advance-quick-entry-trigger.tsx#L54)
- `router.refresh()` on success — re-fetches `OwnerDashboard`'s server-rendered Outstanding Advances figure, added in the review pass.
  [`advance-quick-entry-trigger.tsx:109`](../../apps/web/app/\(app\)/_components/advance-quick-entry-trigger.tsx#L109)
- Where the trigger is wired into the Outstanding Advances card.
  [`owner-dashboard.tsx:419`](../../apps/web/app/\(app\)/_components/owner-dashboard.tsx#L419)
- `OverallCard`'s new `actions` slot, rendered alongside the existing drill-down link.
  [`owner-dashboard.tsx:490`](../../apps/web/app/\(app\)/_components/owner-dashboard.tsx#L490)

**Peripherals (exports, tests)**

- Barrel export for the new component.
  [`index.ts:21`](../../packages/ui/src/index.ts#L21)
- `createAdvanceQuickAction`'s non-redirecting test coverage.
  [`actions.test.ts:170`](../../apps/web/app/\(app\)/team/\[id\]/advances/actions.test.ts#L170)
- Regression guard added in the review pass — asserts the trigger actually renders on the Dashboard.
  [`page.test.tsx:167`](../../apps/web/app/\(app\)/page.test.tsx#L167)
