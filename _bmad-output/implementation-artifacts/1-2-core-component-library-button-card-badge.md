# Story 1.2: Core Component Library — Button, Card, Badge

Status: ready-for-dev

## Story

As a developer building any future screen,
I want the Button (primary/secondary/ghost), Card (resting + interactive-hover), and Badge (5 semantic variants) components implemented once in `packages/ui`,
so that every screen reuses the same primitive instead of re-implementing it (AD-5).

## Acceptance Criteria

1. **Given** the `DESIGN.md` Components spec, **when** Button, Card, and Badge are implemented in `packages/ui`, **then** Button supports `primary`/`secondary`/`ghost` variants with mandatory icon+label composition for primary/secondary usage (icon-only rendering is available only via an explicit prop, reserved for dense inline row actions like "Correct" — see story 1.3).
2. **And** Card supports a resting `shadow-2` state and an `interactive` prop producing `shadow-2-hover` + `translateY(-2px)` lift on hover, transition ≤160ms with no bounce.
3. **And** Badge supports all 5 semantic variants (`success`, `warning`, `danger`, `gold`, `neutral`) and optionally pairs with an icon (accepts an icon node as a prop, never hardcodes one).
4. **And** all three components consume only tokens from `packages/ui/src/styles/theme.css` (story 1.1) — zero raw hex/px/rgba literals in any of the three component files (AD-4).
5. **And** each component has a colocated automated test asserting variant class output and, for Card, the interactive-hover behavior contract (prop toggles the right classes).

## Tasks / Subtasks

- [ ] Task 1: Rebuild Button against the new tokens (AC: #1, #4, #5)
  - [ ] Update `packages/ui/src/components/button.tsx`'s `buttonVariants` (currently `primary`/`secondary`/`outline`/`ghost`/`destructive` with `--color-primary-*`/`--color-neutral-*`/`--color-error-*` classes from the old placeholder scale) to the three `DESIGN.md`-specified variants only: `primary` (`bg-accent-teal-700 text-white hover:bg-accent-teal-600`, `shadow-1` at rest, `shadow-2` + `translateY(-1px)` on hover, per `DESIGN.md`'s `button-primary`/Components section), `secondary` (`bg-surface-1 text-ink-900 border border-border-strong`, hover `bg-surface-2 border-accent-teal-700`), `ghost` (`bg-transparent text-ink-700`, hover `bg-surface-2 text-ink-900`). Drop `outline` and `destructive` — they're not in `DESIGN.md`'s three-variant spec; if a destructive-style action is ever needed later, that's a future extension of this same component's prop surface (AD-5), not a reason to keep an unspecified variant now.
  - [ ] Radius: `rounded-md` (10px token from story 1.1) for all variants, matching `DESIGN.md`'s `button-primary.radius`.
  - [ ] Hover transition timing: ≤160ms (`DESIGN.md` "Do's and Don'ts": "Keep hover/transition motion ≤160ms, subtle") — use the existing `--default-transition-duration` motion token (150ms, already in `theme.css`, untouched by story 1.1) rather than a new literal.
  - [ ] Add an `iconOnly` boolean prop (default `false`) that, when true, removes the mandatory-label assumption and adjusts padding to a square icon-button shape — this is the explicit escape hatch AC #1 requires for dense row actions; it must not be the default rendering path.
  - [ ] Keep the existing `isLoading`/spinner behavior (already implemented, satisfies AD-6's full-state-set rule for a submitting button) — don't remove or regress it.
  - [ ] Write/update `packages/ui/src/components/button.test.tsx` (Vitest + React Testing Library or equivalent already-configured tooling) asserting: each variant renders its expected class names, `iconOnly` toggles the icon-only layout, `isLoading` disables the button and shows the spinner.
- [ ] Task 2: Build Card (AC: #2, #4, #5)
  - [ ] New file `packages/ui/src/components/card.tsx`. Base styles: `bg-surface-1 border border-border-hairline rounded-lg shadow-2 p-6` (resting state — `DESIGN.md` is explicit that cards rest at `shadow-2`, not `shadow-1`; this is a corrected-from-original-exploration rule, don't default to the lighter shadow).
  - [ ] `interactive` boolean prop: when true, adds `cursor-pointer` and a hover state producing `shadow-2-hover` + `translateY(-2px)`, transition ≤160ms — mirrors `_shared-kit.html`'s `.card.interactive:hover` rule exactly.
  - [ ] Export as a simple, composable component (`<Card>{children}</Card>`) — no forced internal layout (header/body/footer subcomponents are not specified by `DESIGN.md` and would be inventing structure beyond what this story's AC calls for; keep it a plain styled container, matching AD-5's "extend the shared component's documented prop surface" — start minimal, since over-building unrequested subcomponents ahead of a screen that never needs them just to look decisive is not the AD-5 pattern).
  - [ ] Write `packages/ui/src/components/card.test.tsx` asserting: default render has `shadow-2` class and no `cursor-pointer`; `interactive` render has the hover-lift classes present (even if jsdom can't assert actual `:hover` pseudo-state, assert the static classes that drive it, e.g. `hover:shadow-2-hover` string presence, or use a class-variance-authority variant map that's directly inspectable — follow whatever pattern `buttonVariants` already establishes for testability).
- [ ] Task 3: Build Badge (AC: #3, #4, #5)
  - [ ] New file `packages/ui/src/components/badge.tsx`. Base: pill shape (`rounded-full`), small padding, `text-caption`-scale (or nearest token from story 1.1's typography roles), per `DESIGN.md`'s badge component tokens.
  - [ ] Five variants mapped 1:1 to `DESIGN.md`'s `badge-success`/`badge-warning`/`badge-danger`/`badge-gold` tokens plus a `neutral` variant (`bg-surface-3 text-ink-700`, per `_shared-kit.html`'s `.badge-neutral` — `DESIGN.md`'s frontmatter doesn't name a `badge-neutral` token explicitly but `_shared-kit.html`'s literal CSS does; treat the shared kit as the tie-breaker source for this one variant since `DESIGN.md`'s Components section for Badges says "semantic color only (success/warning/danger/gold/neutral)" — `neutral` is named in prose even though its exact token values live only in the shared-kit CSS).
  - [ ] Accept an optional `icon` prop (`ReactNode`) rendered before the label text, sized per `_shared-kit.html`'s `.badge svg { width:11px; height:11px; }` — never a hardcoded icon inside the component; AC #3 requires the caller to supply it (this keeps Badge decoupled from story 1.4's icon set, which lands in a later story).
  - [ ] Write `packages/ui/src/components/badge.test.tsx` asserting each of the 5 variants renders its expected token-based classes and that the optional icon renders when passed.
- [ ] Task 4: Wire exports and verify (AC: #4)
  - [ ] Add `export * from "./components/card";` and `export * from "./components/badge";` to `packages/ui/src/index.ts` (alongside the existing button export).
  - [ ] Run `pnpm --filter @azentisfieldos/ui typecheck`, `pnpm --filter @azentisfieldos/ui lint`, and the new test suite.
  - [ ] Grep the three component files for raw hex (`#[0-9a-fA-F]{3,6}`), inline `rgba(`, and bare pixel literals outside of Tailwind's arbitrary-value bracket syntax (which is itself disallowed here per AD-4) — confirm zero matches before marking this story done.

## Dev Notes

- This story depends on story 1.1 having landed the token names it references throughout (`accent-teal-700`, `accent-teal-600`, `surface-1`/`surface-2`/`surface-3`, `border-hairline`/`border-strong`, `ink-900`/`ink-700`, `success/warning/danger/gold` pairs, `shadow-1`/`shadow-2`/`shadow-2-hover`, `rounded-md`/`rounded-full`). If story 1.1 is not yet complete when this story starts, treat that as a hard blocker — do not invent placeholder token names now and rename later; confirm the actual token names landed in `packages/ui/src/styles/theme.css` before writing this story's component code, since AC #4 requires consuming exactly those tokens.
- `packages/ui/src/components/button.tsx` is an UPDATE target (it already exists — see story 1.1's "Implementation Notes" and this workflow's own read of the file above), not a new file. Its current five-variant/`--color-primary-*` implementation predates `DESIGN.md` entirely and must be replaced, not extended — this is one of the explicit "bring into spec" items called out in the epic.
- `packages/ui`'s existing dependencies already include `class-variance-authority`, `clsx`, `tailwind-merge`, `@base-ui-components/react`, and `lucide-react` (see `packages/ui/package.json`) — `cva` is the established pattern for variant components in this codebase (`buttonVariants` already uses it); Card and Badge should follow the same `cva`-based pattern for consistency, not a different styling approach.
- `apps/web/app/page.tsx` currently imports and renders `<Button>Scaffold OK</Button>` with no variant prop (so it uses `primary` by default) — after this story, that scaffold usage should render correctly again with the new token-based styling (it was visually broken after story 1.1 removed the old tokens; this story is what restores it). Confirm `pnpm --filter @azentisfieldos/web build` succeeds and the button renders with real teal styling, not unstyled fallback, as a manual sanity check — though updating `page.tsx` itself is not required by this story's AC (it's scaffold-only and gets replaced by real screens in later epics).
- Testing standard: Vitest project-wide (root `AGENTS.md` — `apps/api` explicitly uses Vitest, not Jest, "for consistency with the rest of the monorepo"). Check whether `packages/ui` already has a Vitest config; story 1.1's Task 6 may have added a minimal one — reuse it rather than creating a second, divergent config.
- Icon-only buttons: `DESIGN.md`'s Do's/Don'ts table is explicit — "Pair every primary/secondary button with an icon" / don't "Ship icon-only buttons for primary actions." The `iconOnly` prop this story adds is deliberately not exercised by any screen yet (that begins in story 1.3 with the Correct action, which is itself a distinct component wrapping a ghost icon-only Button). Don't add a demo/example usage of `iconOnly` in `apps/web` as part of this story — out of scope.

### Project Structure Notes

- New files: `packages/ui/src/components/card.tsx`, `packages/ui/src/components/badge.tsx`, plus their colocated test files — matches the existing colocation convention (`button.tsx` lives directly under `components/`, no further nesting).
- Updated files: `packages/ui/src/components/button.tsx`, `packages/ui/src/index.ts` (barrel export).
- No `apps/web` or `apps/api` files are required to change for this story's AC, though a manual visual check against the running `apps/web` dev server is expected as part of verification (per this project's root-level convention of testing UI changes live before reporting completion).

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md#Components] — Button/Card/Badge visual specs (variants, elevation, radius, icon rules).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-5] — "One implementation per UI primitive" — the binding rule this story implements.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html] — lines 140-179 (`.card`, `.btn` family) and lines 198-206 (`.badge` family) are the literal CSS shape to translate into Tailwind utility/`cva` form, including the `neutral` badge variant not named in `DESIGN.md`'s frontmatter.
- [Source: packages/ui/src/components/button.tsx] — file to modify; current variant set and structure to replace.
- [Source: _bmad-output/implementation-artifacts/1-1-design-token-foundation.md] — token names this story's components must consume; confirm against the actual landed `theme.css`, not just this reference, before implementing.

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent._

### Debug Log References

### Completion Notes List

### File List
