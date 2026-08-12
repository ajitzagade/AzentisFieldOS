---
baseline_commit: NO_VCS
---

# Story 1.1: Design Token Foundation

Status: review

## Story

As the implementer of any future screen,
I want the finalized `DESIGN.md` token system (colors light+dark, typography, spacing, radius, shadows) implemented as Tailwind v4 `@theme` tokens in `packages/ui`,
so that every component renders the approved visual identity from one source, with no scattered hex/px/rgba literals.

## Acceptance Criteria

1. **Given** the `DESIGN.md` token frontmatter as source of truth, **when** `packages/ui/src/styles/theme.css` is updated, **then** every named token group (colors incl. `-dark` variants, typography roles, spacing scale, radius scale, shadow scale) exists as a CSS custom property consumable via Tailwind v4 `@theme`.
2. **And** no component in `packages/ui` (or `apps/web`, once story 1.2+ lands components that consume these) contains a raw hex/px/rgba literal (AD-4) — every value traces to a token.
3. **And** toggling a `dark` scope class on an ancestor element switches every color and shadow token to its dark counterpart without any per-component conditional logic (no `if (isDark)` branches anywhere).
4. **And** all light/dark token pairs remain the exact values specified in `DESIGN.md`'s frontmatter — no substitutions, no "close enough" approximations.
5. **And** the existing `packages/ui/src/components/button.tsx` and `apps/web/app/page.tsx` scaffold still render (Turbopack dev server boots, `pnpm --filter @azentisfieldos/web build` succeeds) after the token swap, even though `button.tsx`'s own variant styling is out of scope for this story (story 1.2 rebuilds it against the new tokens).

## Tasks / Subtasks

- [x] Task 1: Replace the color token set (AC: #1, #3, #4)
  - [x] Remove the current placeholder OKLCH `--color-primary-*`, `--color-accent-*`, `--color-neutral-*` scales from `packages/ui/src/styles/theme.css` — they predate `DESIGN.md` and don't match it.
  - [x] For every light-mode color in `DESIGN.md`'s frontmatter (`surface-0`..`surface-3`, `border-hairline`, `border-strong`, `ink-900`, `ink-700`, `ink-500`, `ink-on-accent`, `accent-teal-900`, `accent-teal-700`, `accent-teal-600`, `accent-teal-100`, `accent-navy-800`, `accent-navy-600`, `gold-700`, `gold-500`, `gold-100`, `success-700`, `success-100`, `danger-700`, `danger-100`, `warning-700`, `warning-100`), define a raw CSS custom property in `:root` (e.g. `--surface-0: #FBFAF7;`) using the exact hex value from the frontmatter.
  - [x] Define a `.dark` class-scoped block overriding every one of the above properties with its `-dark`-suffixed frontmatter counterpart (e.g. `--surface-0-dark` → applied as `--surface-0` inside `.dark`). Colors with no `-dark` entry in the frontmatter (`surface-0`..`surface-3` have `-dark` entries; double check `accent-navy-800`/`accent-navy-600` do **not** — confirm against the frontmatter and, if genuinely absent, keep them constant across modes since the sidebar surface is deliberately navy in both themes) keep their light value unchanged in dark mode.
  - [x] Bridge each raw property into Tailwind's `@theme` block under the `--color-*` namespace so utilities generate correctly, e.g.: `--color-surface-0: var(--surface-0);` inside `@theme`, with `--surface-0` (and its `.dark` override) declared outside `@theme` in plain `:root`/`.dark` rules. This indirection is what makes "toggle a class, tokens swap" work — `@theme` values must resolve through a variable that a selector can override; a value written directly inside `@theme` cannot be re-scoped by a class selector.
  - [x] This produces utilities like `bg-surface-1`, `text-ink-900`, `border-border-hairline` (Tailwind strips the `--color-` prefix and uses the remainder as the utility suffix).
- [x] Task 2: Replace the typography scale (AC: #1, #4)
  - [x] Remove the current generic `--text-xs`..`--text-3xl` scale.
  - [x] For each named role in `DESIGN.md`'s `typography` frontmatter (`eyebrow`, `caption`, `body-sm`, `body`, `card-title`, `section-header`, `page-title`, `kpi-numeral`), define `--text-{role}`, `--text-{role}--line-height`, `--text-{role}--font-weight`, and (where specified) `--text-{role}--letter-spacing` inside `@theme` — Tailwind v4 supports these four paired sub-properties per named font-size token, so a single utility class (e.g. `text-kpi-numeral`) applies size, line-height, weight, and tracking together.
  - [x] `eyebrow` also needs `text-transform: uppercase` and its `letter-spacing: 0.05em` — since `text-transform` isn't a paired `--text-*` sub-property in Tailwind v4, document in a code comment on the token block (not scattered per-usage) that consumers pair `text-eyebrow` with the existing Tailwind `uppercase` utility.
  - [x] Keep the system font stack (`--font-sans`) as-is structurally, but confirm it matches `DESIGN.md`'s exact stack string (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) — note `DESIGN.md` explicitly forbids webfont loading (NFR-2, low-bandwidth field users), which conflicts with `apps/web/app/layout.tsx`'s current `next/font/google` Geist loading. Flag this conflict in Dev Agent Record completion notes for story 1.6 (which touches the shell) to resolve — do not silently remove the Geist font wiring in this story, since that's `apps/web` scope, not `packages/ui`'s token file; this story only ensures `--font-sans`'s *fallback* value is correct.
- [x] Task 3: Replace the spacing scale (AC: #1)
  - [x] Verify `--spacing: 0.25rem` (already present) — check it against `DESIGN.md`'s `spacing` frontmatter (`1`=4px through `16`=64px): Tailwind v4 generates `p-{n}` etc. as `n * --spacing`, so `--spacing: 0.25rem` (4px) already produces `p-1`=4px, `p-4`=16px, `p-6`=24px, `p-8`=32px, `p-10`=40px, `p-12`=48px, `p-16`=64px — an exact match to the named spacing scale. No change needed here; just confirm and leave a short note in Dev Agent Record so nobody "fixes" it later under the mistaken belief it's still a placeholder.
- [x] Task 4: Replace the radius scale (AC: #1, #4)
  - [x] Replace `--radius-sm`/`md`/`lg`/`xl` (currently generic rem values) with `DESIGN.md`'s `rounded` frontmatter: `sm`=6px, `md`=10px, `lg`=14px, `xl`=20px, `full`=9999px (add `--radius-full` if not already present).
- [x] Task 5: Replace the shadow scale, dark-mode-aware (AC: #1, #3, #4)
  - [x] Remove the current generic `--shadow-sm`/`md`/`lg`.
  - [x] Using the same raw-property + `.dark`-override + `@theme` bridge pattern as Task 1, define `--shadow-1`, `--shadow-2`, `--shadow-3`, `--shadow-2-hover` with `DESIGN.md`'s exact light-mode `rgba(27,36,48,...)` values and `.dark`-scope override using the dark shadow values from `DESIGN.md`'s Elevation & Depth section (`rgba(0,0,0,.4–.5)` family — use the precise numbers given there, not an approximation).
- [x] Task 6: Verify no regressions (AC: #5)
  - [x] Run `pnpm --filter @azentisfieldos/ui typecheck` and `pnpm --filter @azentisfieldos/ui lint`.
  - [x] Run `pnpm --filter @azentisfieldos/web build` — confirm it still compiles even though `button.tsx` and `app/page.tsx` reference now-removed utility classes like `bg-primary-600`/`text-neutral-900`/`bg-neutral-100` (expected: Tailwind will simply not generate those utilities anymore since the underlying `--color-primary-*`/`--color-neutral-*` tokens are gone). Confirm the build still *succeeds* (unknown Tailwind utility classes on an element don't fail a build, they just don't apply styling) — do not attempt to fix `button.tsx`'s or `page.tsx`'s broken visual appearance in this story; that's story 1.2's and out-of-scope polish respectively. Record the now-unstyled state as an expected, temporary interim result in Completion Notes.
  - [x] Add or update a lightweight test (e.g. a Vitest/DOM snapshot or a simple assertion reading computed `getPropertyValue` on `--color-surface-0` etc. after import) confirming the token file exports the expected custom properties in both default and `.dark`-scoped contexts. If `packages/ui` has no test runner configured yet, set up the minimal Vitest config needed (per root `AGENTS.md`, Vitest is the project-wide test runner) — do not introduce Jest.

## Dev Notes

- This is the first story in Epic 1 and has no prior story's File List to build on — but it modifies files that already exist on disk (per the epic's Implementation Notes): `packages/ui/src/styles/theme.css` is an UPDATE target, not a new file.
- Read `packages/ui/src/styles/theme.css` in full before editing (already loaded during story creation — see current content below) — the file's existing structure (an `@import "tailwindcss";` line followed by one `@theme { ... }` block) is the right shape; this story replaces the *values* inside it, not the overall structure. Motion tokens (`--ease-standard`, `--default-transition-duration`) and z-index tokens (`--z-index-*`) are **not** part of `DESIGN.md`'s frontmatter and are out of scope for this story — leave them exactly as they are; do not delete or "clean them up."
- Current `theme.css` (before this story) defines colors in OKLCH for perceptual evenness. `DESIGN.md`'s frontmatter defines colors as literal hex. Use the hex values verbatim — `DESIGN.md` is the explicit source of truth per this story's own acceptance criteria, and OKLCH conversion is not requested or needed; don't introduce a conversion step that risks drifting from the approved values.
- The dark-mode toggle mechanism referenced by AC #3 ("toggling a dark scope class") is a `.dark` CSS class per `DESIGN.md`'s own literal prototype markup (`.dark-scope` in `_shared-kit.html`/`00-login.html`) — this story only needs the CSS side of that contract (tokens that respond to a `.dark` ancestor class existing). Wiring *when* that class gets applied (system preference, a user toggle, `next-themes`, etc.) is `apps/web` application logic, not a `packages/ui` token concern, and is not part of this story's acceptance criteria — don't build a theme-toggle UI here.
- `packages/ui`'s `package.json` exports `"./styles/theme.css": "./src/styles/theme.css"` and `apps/web/app/globals.css` already does `@import "@azentisfieldos/ui/styles/theme.css";` — this wiring is correct and pre-existing; nothing in this story needs to change either file's import wiring, only `theme.css`'s internal token values.
- Money-specific typography (`font-variant-numeric: tabular-nums lining-nums`, called out in `DESIGN.md` as "non-negotiable" for currency/quantity figures) is not one of the eight named typography roles and has no natural home as a `--text-*` paired sub-property (Tailwind has no `font-variant-numeric` pairing). Do not invent a workaround in this story — a `.tabular` utility class or a `packages/ui` `<Tabular>`/`money-text` component is component-library work for a later story (money-text is listed under `DESIGN.md`'s `components` frontmatter, not its base token groups). Flag this as a known gap for whichever future story implements money-rendering components (likely inside Epic 4/6's People/Money or Insights work) — do not silently add it here since it's outside this story's stated AC scope, but do not let it get lost either.
- Full technical stack pins relevant to this story: Tailwind CSS 4.3.3 (CSS-first `@theme`, no JS config file — confirmed already in use), the project runs on Node ≥22 per root `package.json` `engines`.

### Project Structure Notes

- File touched: `packages/ui/src/styles/theme.css` (UPDATE, not NEW) — matches the architecture spine's Structural Seed (`packages/ui/` = "shadcn-pattern components + Tailwind v4 design tokens (AD-4, AD-5)").
- No new files are structurally required for this story beyond an optional test file (e.g. `packages/ui/src/styles/theme.test.ts` or similar, if a test runner needs to be added) — keep it colocated with the file it tests, matching the monorepo's existing colocation pattern (`packages/shared/src/schemas/site.ts` has no sibling test file yet, but Vitest is the project standard per root `AGENTS.md` — use `*.test.ts` or `*.spec.ts` consistent with `apps/api/src/app.controller.spec.ts`'s existing naming).
- No `apps/web` or `apps/api` files should be modified in this story — this is deliberately scoped to `packages/ui`'s token file alone; `apps/web/app/page.tsx`'s and `button.tsx`'s stale utility-class references are expected fallout, not something to fix here.

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md] — frontmatter (`colors`, `typography`, `rounded`, `spacing`) is the literal token source; `## Colors`, `## Typography`, `## Layout & Spacing`, `## Elevation & Depth`, `## Shapes` sections narrate the intent behind each token group.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-4] — "One design-token source, zero inline styles" — the binding rule this story implements.
- [Source: packages/ui/src/styles/theme.css] — file to modify; current structure (light-only OKLCH tokens, no dark-mode class scoping) predates `DESIGN.md`'s finalized system.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html] — lines 37-102 (`:root` and `.dark-scope` CSS custom property blocks) are the literal value source for both light and dark tokens, useful as a cross-check against `DESIGN.md`'s frontmatter (values must match; if they ever disagree, `DESIGN.md`'s frontmatter wins since it's marked `status: final`).
- [Source: _bmad-output/planning-artifacts/epics/phase-1-foundation/epic-1-platform-foundation-auth-design-system.md] — "Implementation Notes" section confirms `theme.css` and `button.tsx` already exist as pre-story-creation scaffolding to bring into spec, not placeholders to ignore.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/ui typecheck` — pass
- `pnpm --filter @azentisfieldos/ui lint` — pass
- `pnpm --filter @azentisfieldos/ui test` — 9/9 pass
- `pnpm --filter @azentisfieldos/web build` — pass (Next.js 16.3.0/Turbopack, static `/` route compiled)

### Completion Notes List

- Replaced the placeholder OKLCH color/typography/radius/shadow scales in `packages/ui/src/styles/theme.css` with `DESIGN.md`'s exact frontmatter values, using a raw-custom-property + `.dark`-class-override + `@theme` `var()` bridge so every color/shadow token responds to a `.dark` ancestor class with zero per-component logic.
- `accent-teal-900`, `accent-navy-800`, `accent-navy-600` confirmed to have no `-dark` entry in `DESIGN.md`'s frontmatter — left constant across both modes, per the story's own instruction.
- `--spacing: 0.25rem` confirmed already correct against `DESIGN.md`'s spacing scale — left unchanged, not a placeholder.
- `--font-sans` now leads with `var(--font-geist-sans)` followed by `DESIGN.md`'s exact system-font fallback stack. **Flag for story 1.6:** `apps/web/app/layout.tsx` still loads Geist via `next/font/google`, which is a webfont — `DESIGN.md` explicitly forbids webfont loading for the low-bandwidth field-user budget (NFR-2). This story only fixed the *fallback* value per its own scope; removing/replacing the Geist loading itself belongs to story 1.6 (which owns `apps/web`'s shell/layout).
- Money-specific `tabular-nums` typography has no home in the eight named typography roles — flagged as a known gap for whichever future story builds money-rendering components, per the story's own Dev Notes; not built here.
- Motion (`--ease-standard`, `--default-transition-duration`), breakpoint, and z-index tokens left untouched — out of `DESIGN.md`'s frontmatter scope.
- Set up Vitest for `packages/ui` from scratch (no test runner existed there before): added `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `react-dom`, `@types/node` as devDependencies, added a `"test": "vitest run"` script, `vitest.config.mts` (jsdom environment), and `vitest.setup.ts`. This groundwork is reused by every later Epic 1 story that adds component tests in this package.
- The token test (`packages/ui/src/styles/theme.test.ts`) asserts against `theme.css`'s raw source text rather than `getComputedStyle` — Tailwind v4's `@theme` block is a build-time (PostCSS/lightningcss) construct with no browser-runtime representation, so jsdom has no CSS engine that evaluates it; a computed-style assertion would test nothing meaningful without running a full Tailwind build first. Text-based assertions still catch the real regressions this test exists to prevent (a missing token, a wrong hex value, a missing dark override).
- Per AC #5: confirmed `apps/web` still builds successfully after the token swap even though `button.tsx`/`page.tsx` now reference removed utility classes (e.g. `bg-primary-600`) — Tailwind simply omits ungenerated utilities rather than failing the build. Visual restyling is story 1.2's job.
- New dependencies added (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `react-dom`, `@types/node`) were all explicitly anticipated by this story's own Task 6 ("set up the minimal Vitest config needed") — not treated as an out-of-story dependency addition requiring separate halt/approval.

### File List

- `packages/ui/src/styles/theme.css` (modified)
- `packages/ui/src/styles/theme.test.ts` (new)
- `packages/ui/package.json` (modified — devDependencies, `test` script)
- `packages/ui/vitest.config.mts` (new)
- `packages/ui/vitest.setup.ts` (new)
- `pnpm-lock.yaml` (modified — new devDependency resolution)
