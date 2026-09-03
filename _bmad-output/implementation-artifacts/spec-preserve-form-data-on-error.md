---
title: 'Stop wiping form data when a Server Action returns a validation error'
type: 'bugfix'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '41e5aa2e6e0f6b335ea7d01739a0d17a25ddda37'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** When a Server Action returns `{ errors }`/`{ formError }` (duplicate value, FK not found, stock floor, etc.), React 19's `<form action={formAction}>` (from `useActionState`) unconditionally native-`form.reset()`s during commit — success or failure alike. Invisible on success (those actions `redirect()` away); on failure the form is wiped and the user retypes everything. Empirically confirmed via a throwaway Vitest+RTL probe (deleted after use) against this repo's React 19.2.8/jsdom: fires for every field type, and a plain JSX `onReset={preventDefault}` does NOT intercept it — only a native `addEventListener('reset', …)` via ref does.

**Approach:** One shared hook, `usePreventFormResetOnError(formRef, hasError)`, attaches a native `reset` listener and cancels it only while `hasError` is true. Applied to every Server Action form. When `hasError` is false, native reset (and the 8 forms' own `formRef.current?.reset()` success-clear calls) proceed unchanged.

## Boundaries & Constraints

**Always:** Preserve all 8 existing `formRef.current?.reset()`-on-success sites unchanged (add-category-form.tsx, add-unit-form.tsx, sizes-section.tsx, add-expense-category-form.tsx, add-employment-type-form.tsx, add-vehicle-type-form.tsx, add-machinery-type-form.tsx, report-schedules-manager.tsx). `hasError` = `!!(state.errors || state.formError)`, confirmed identical across ~30 `actions.ts` files.

**Ask First:** None — mechanical, uniform, low-risk per file.

**Never:** Don't touch client-side validation (`useClientValidation`/`parse.ts`) — it already `preventDefault()`s the submit before the action runs, unaffected/out of scope. No new "Reset" button or UI. Don't restructure forms away from `useActionState`/`action={formAction}`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Server-side validation fails | User fills fields, submits, action returns `{ errors }` or `{ formError }` | All typed field values remain exactly as entered; error messages render | N/A |
| Submission succeeds | Action returns success / redirects | Existing behavior unchanged (redirect, or the 8 forms' own `formRef.reset()` still clears) | N/A |
| Client-side validation fails (pre-submit) | `useClientValidation.guard` blocks submit | Unaffected — action never runs, already preserves values today | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/lib/use-prevent-form-reset-on-error.ts` -- NEW shared hook (sibling of `apps/web/lib/use-client-validation.ts`). See code sample in Design Notes below for exact implementation.
- 45 form files under `apps/web/app/**`, full list = `grep -rln 'action={.*Action}' apps/web/app --include="*.tsx" | grep -v '\.test\.'` -- each gets: (a) `useRef<HTMLFormElement>(null)` if missing, (b) `ref={formRef}` on `<form>` if missing, (c) `usePreventFormResetOnError(formRef, !!(state.errors || state.formError))`. The 8 files under Boundaries already have `formRef` -- add only the hook call.
- Confirm each file's actual action-state field names before applying rather than assuming; `sign-in/page.tsx`, `global-search.tsx`, `mark-paid-button.tsx`, `category-row-actions.tsx`, `advance-quick-entry-trigger.tsx` weren't individually read during planning and may differ slightly.
- Root cause: `apps/web/node_modules/react-dom/cjs/react-dom-client.development.js:8944-8958,14900-14901,15147-15152` (`requestFormReset$1` / `recursivelyResetForms` → `fiber.stateNode.reset()`). Example call site: `apps/web/app/(app)/materials/categories/add-category-form.tsx:22-28`.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/use-prevent-form-reset-on-error.ts` -- create the hook -- single reusable fix point
- [x] `apps/web/lib/use-prevent-form-reset-on-error.test.ts` -- unit test: error state cancels reset (field survives); non-error state does not cancel (reset proceeds) -- this exact behavior was previously unverified/untested anywhere in the repo
- [x] All 45 form files enumerated above -- wire the hook in -- fixes the reported bug everywhere it occurs (42 wired directly; 3 — `_components/advance-quick-entry-trigger.tsx`, `_components/global-search.tsx`, `sites/[id]/contracts/new/page.tsx` — verified as grep false-positives with no `<form>`/`useActionState` of their own, documented as no-ops in the final report)
- [x] One existing form test (`purchase-form.test.tsx`) -- extended with a case asserting a field value survives a server-returned `formError`/`errors` -- regression coverage for the actual user-facing bug
- [x] Scope extension (human-approved, see Spec Change Log): moved the hook's canonical implementation to `packages/ui/src/lib/use-prevent-form-reset-on-error.ts`, made `apps/web/lib/use-prevent-form-reset-on-error.ts` a re-export, wired `packages/ui/src/components/advance-quick-entry-modal.tsx` (Dashboard/global-search Advance quick-entry, portal-rendered, has the identical bug, wasn't in the original 45-file grep since it's outside `apps/web/app/**`), and hardened the hook against portal DOM-attach timing (see Spec Change Log)

**Acceptance Criteria:**
- Given a user has typed values into any Server Action form and submits, when the action returns `{ errors }` or `{ formError }`, then every field the user typed still shows its typed value after the response renders.
- Given a quick-add form (the 8 with existing `formRef.current?.reset()`) succeeds, when the success state renders, then the form still clears exactly as it does today.

## Spec Change Log

- **Scope extension (human-approved, 2026-09-03):** After the initial 45-file implementation passed, the user was told `packages/ui/src/components/advance-quick-entry-modal.tsx` has the identical bug but was out of scope (the Code Map's file list was scoped to `apps/web/app/**`). The user asked to fix it in this same pass. Change: moved the hook's canonical source to `packages/ui/src/lib/use-prevent-form-reset-on-error.ts` (exported via `packages/ui`'s index), made `apps/web/lib/use-prevent-form-reset-on-error.ts` a thin re-export (zero changes needed to the 42 already-wired `apps/web` files), and wired the modal.
- **Bug found + fixed during the extension:** wiring the modal exposed a real gap in the original hook design — it used `useEffect(..., [formRef])`, a stable dependency that only runs the attach-listener effect once, on mount. That's correct for a plain in-tree `<form>` (the ref is already populated by then, confirmed by the 42 apps/web forms all passing), but the modal renders its `<form>` inside a Base UI `Dialog.Portal`, which attaches that DOM in a *later* commit — the effect ran once, found `formRef.current` still `null`, and never retried, silently leaving the modal's fields unprotected (empirically caught by a regression test asserting the Amount field's value survives a submit error, added as part of this extension). Fixed by dropping the dependency array (so the attach effect retries on every render) with a same-node guard so it's a no-op once actually attached, and an unregister-on-cleanup guard. All existing tests (packages/ui: 183, apps/web: 926) still pass with this change — the retry is not an observable behavior change for the 42 non-portal forms, only closes the gap for portal-rendered ones.

## Design Notes

Not `onReset={preventDefault}` as a JSX prop: verified it never fires for React's internally-triggered reset here — only a ref-attached native listener intercepts it. Gated on `hasError` (not an unconditional block) because the 8 quick-add forms call `formRef.current?.reset()` themselves on success.

```ts
// packages/ui/src/lib/use-prevent-form-reset-on-error.ts (canonical;
// apps/web/lib/use-prevent-form-reset-on-error.ts re-exports it)
export function usePreventFormResetOnError(
  formRef: RefObject<HTMLFormElement | null>,
  hasError: boolean,
) {
  const hasErrorRef = useRef(hasError);
  hasErrorRef.current = hasError;
  // No dependency array — see Spec Change Log "Bug found + fixed during
  // the extension" for why a stable `[formRef]` dep misses portal-mounted
  // forms. Guarded so it's a no-op once already attached to a given node.
  const attachedFormRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form || form === attachedFormRef.current) return;
    attachedFormRef.current = form;
    const handler = (e: Event) => { if (hasErrorRef.current) e.preventDefault(); };
    form.addEventListener("reset", handler);
    return () => {
      form.removeEventListener("reset", handler);
      if (attachedFormRef.current === form) attachedFormRef.current = null;
    };
  });
}
```

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test` -- expected: all existing + new tests pass, including the new hook test and the extended purchase-form (or equivalent) test
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: no errors
- `pnpm --filter @azentisfieldos/web lint` -- expected: no new errors

**Manual checks (if no CLI):**
- Pick 2-3 forms across different areas (e.g. Record a Purchase, Add Team Member, Add Material Category) in a running dev server, submit with a value that triggers a server-side-only error (not caught by client validation), confirm fields keep their typed values.

## Suggested Review Order

**The fix itself**

- Entry point — cancels React 19's automatic `form.reset()` only while an error state is present.
  [`use-prevent-form-reset-on-error.ts:15`](../../packages/ui/src/lib/use-prevent-form-reset-on-error.ts#L15)

- Why no dependency array: a stable-dep effect misses forms that attach their DOM in a later commit (e.g. portals).
  [`use-prevent-form-reset-on-error.ts:30`](../../packages/ui/src/lib/use-prevent-form-reset-on-error.ts#L30)

- `apps/web` re-exports this instead of duplicating it, so none of the 42 already-wired apps/web files needed an import change.
  [`use-prevent-form-reset-on-error.ts:5`](../../apps/web/lib/use-prevent-form-reset-on-error.ts#L5)
  [`index.ts:27`](../../packages/ui/src/index.ts#L27)

**Trickiest consumer — portal-rendered form**

- The Dashboard/global-search Advance quick-entry modal renders inside a Base UI `Dialog.Portal` — the case the no-dep-array design exists for.
  [`advance-quick-entry-modal.tsx:94`](../../packages/ui/src/components/advance-quick-entry-modal.tsx#L94)

- Regression test proving the portal case actually works, not just the hook in isolation.
  [`advance-quick-entry-modal.test.tsx:118`](../../packages/ui/src/components/advance-quick-entry-modal.test.tsx#L118)

**Representative plain-form wiring**

- Standard 3-line wiring pattern repeated (with per-file `hasError` expressions) across 40 more form components.
  [`purchase-form.tsx:131`](../../apps/web/app/(app)/movements/purchases/purchase-form.tsx#L131)

- End-to-end regression test: fills the real form, mocks a server `formError`, asserts every field survives.
  [`purchase-form.test.tsx:135`](../../apps/web/app/(app)/movements/purchases/purchase-form.test.tsx#L135)

- Two-form case in one component (rename + toggle), each with its own ref and `hasError` expression.
  [`category-row-actions.tsx:79`](../../apps/web/app/(app)/_components/category-row-actions.tsx#L79)

**Peripherals**

- Hook's own unit tests: cancels-on-error, proceeds-on-no-error, re-checks at reset time, and the portal-timing regression.
  [`use-prevent-form-reset-on-error.test.ts`](../../packages/ui/src/lib/use-prevent-form-reset-on-error.test.ts#L1)

- Thin re-export identity test — the real behavior is covered once, at the canonical source above.
  [`use-prevent-form-reset-on-error.test.ts`](../../apps/web/lib/use-prevent-form-reset-on-error.test.ts#L1)
