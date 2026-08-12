# Story 1.3: Core Component Library — Data Table, Stat Tile, Gap Flag, Correct Action

Status: review

## Story

As a developer building any future list/detail screen,
I want the Data Table (zebra+hover, linked-row and non-link-row modes), Stat Tile, Gap Flag, and the "Correct" action component implemented once in `packages/ui`,
so that every transaction/list screen across the product behaves identically.

## Acceptance Criteria

1. **Given** the `DESIGN.md` Components spec and `EXPERIENCE.md` Component Patterns table, **when** Data Table, Stat Tile, Gap Flag, and CorrectAction are implemented in `packages/ui`, **then** Data Table renders zebra-striped rows with a hover highlight, and supports a linked-row mode (whole row is a real link) vs. a non-link-row mode with no false-affordance cursor.
2. **And** Stat Tile renders a meaning-tinted icon, tabular KPI numeral, and caption label.
3. **And** Gap Flag renders an icon + message + one primary action, never a bare warning with no next step.
4. **And** CorrectAction renders as an icon-only ghost button that, when wired by a consuming screen, opens a reason-required entry linked to the original record — never an Edit/Delete affordance.
5. **And** Data Table renders each of its full state set (loading, empty, success, error) per AD-6 — no ad-hoc per-screen conditional is needed to get these states; the component itself owns them.
6. **And** all four components consume only tokens from `packages/ui/src/styles/theme.css` (story 1.1) plus the Button/Card/Badge primitives from story 1.2 where applicable (e.g. Gap Flag's primary action is a `Button`, CorrectAction is a `Button` with `iconOnly` + `ghost`) — no competing one-off styling.

## Tasks / Subtasks

- [x] Task 1: Build Data Table (AC: #1, #5, #6)
  - [x] New file `packages/ui/src/components/data-table.tsx`. Container: `bg-surface-1 border border-border-hairline rounded-lg shadow-2 overflow-hidden` (per `_shared-kit.html`'s `.table-wrap`). Header cells: uppercase, `eyebrow`-scale token, `bg-surface-2`, bottom border. Body rows: zebra via even-row `bg-surface-2`, hover via `bg-accent-teal-100`, transition ≤110ms (matches `_shared-kit.html`'s `--dur-fast`) — this is a *faster* transition than the button/card ≤160ms figure; don't reuse the same duration token for both, they're deliberately different per the shared kit.
  - [x] Design the row API so a consuming screen chooses per-row (or per-table) whether rows are links: e.g. a `rowHref` accessor prop returning `string | undefined` per row — when defined, the entire row renders as a real `<a>`-wrapped set of cells (per `EXPERIENCE.md`: "Row is a link (wrapped `<a>` per cell, not `onclick`)"); when `undefined` for a given row, that row renders with no `cursor-pointer` and no link semantics at all — this is the explicit UX-review-caught bug class this component must make structurally impossible (see Dev Notes below). Do not implement link-row behavior via an `onClick` handler + `cursor: pointer` styling — that is exactly the anti-pattern this story exists to prevent.
  - [x] Money/quantity columns: expose a per-column `align: "right"` or an `isNumeric` flag that applies `.num`/tabular-nums styling (right-aligned, `font-variant-numeric: tabular-nums`) — matches `_shared-kit.html`'s `td.num`.
  - [x] Full state set (AD-6, AC #5): accept a `state: "loading" | "empty" | "error" | "success"` prop (or equivalent discriminated-union data prop) and render accordingly — `loading` renders skeleton rows matching the eventual column layout (per `EXPERIENCE.md`'s State Patterns table: "Skeleton rows matching the eventual layout — never a bare spinner replacing the whole screen"), `empty` renders an icon + one sentence + a single primary action slot (not just headers with no rows), `error` renders a plain-language retry affordance (no raw HTTP status/stack trace), `success` renders the real row data. Do not let each consuming screen hand-build these states individually — that's precisely what AD-6 forbids.
  - [x] Write `packages/ui/src/components/data-table.test.tsx` covering: zebra/hover classes present on body rows, a row with `rowHref` renders as a link with no `onClick`-only affordance, a row without `rowHref` has no `cursor-pointer`/link markup, each of the four `state` values renders its distinct expected output (skeleton row count matches columns for `loading`, empty-state message+action for `empty`, retry affordance for `error`).
- [x] Task 2: Build Stat Tile (AC: #2, #6)
  - [x] New file `packages/ui/src/components/stat-tile.tsx`. Structure: tinted icon circle → `kpi-numeral`-scale tabular value → `caption`-scale label, per `DESIGN.md`'s `stat-tile` component tokens (`shadow-1` at rest, `shadow-2` on hover, `surface-1` background, `border-hairline`).
  - [x] Icon tint variants: `teal`/`gold`/`success`/`danger` (per `_shared-kit.html`'s `.stat-icon.{teal,gold,success,danger}`) — a `tint` prop selecting the tinted-circle background+foreground pair from story 1.1's tokens (`accent-teal-100`/`accent-teal-700`, `gold-100`/`gold-700`, `success-100`/`success-700`, `danger-100`/`danger-700`).
  - [x] Icon itself is an injected `ReactNode` prop, not hardcoded — decouples this component from story 1.4's icon set, which lands after this story; a consuming screen supplies whichever icon fits (e.g. once story 1.4 exists, `<StatTile icon={<HomeIcon />} .../>`).
  - [x] Optionally-linkable: per `EXPERIENCE.md`'s Component Patterns table ("where the underlying data has a real destination... the tile itself is a link"), accept an optional `href` prop; when present, the tile renders as a link (same "whole real link, not `onclick`" principle as Data Table).
  - [x] Value formatting (currency symbols, thousands separators) is a caller concern, not this component's — it receives an already-formatted `value` node/string and applies only the tabular-nums typographic treatment. Don't build currency-formatting logic into this component; that's out of scope and belongs with whichever screen/domain logic produces the number.
  - [x] Write `packages/ui/src/components/stat-tile.test.tsx` covering: each tint variant applies correct token classes, `href` presence renders a link, absence renders a non-interactive tile with no false hover-as-link affordance.
- [x] Task 3: Build Gap Flag (AC: #3, #6)
  - [x] New file `packages/ui/src/components/gap-flag.tsx`. Structure: icon + message + exactly one primary action — per `DESIGN.md`'s `gap-flag` component tokens (`warning-100` background, `warning-700` foreground, `#E8CC8F` border, `rounded-md`) and `EXPERIENCE.md`'s explicit rule that a gap flag is never a bare warning with no next step.
  - [x] The primary action is a `Button` (from story 1.2, `primary` or `secondary` variant per caller's judgment) rendered inline within the flag — make the action prop required (not optional), enforcing AC #3's "never a bare warning with no next step" at the type level, not just by convention.
  - [x] Icon is an injected `ReactNode` prop (same reasoning as Stat Tile — decoupled from story 1.4).
  - [x] Message content is caller-supplied text/node — this component owns layout/styling only, not copy. Per `EXPERIENCE.md`'s Voice and Tone table, actual gap-flag copy used by real screens must name the specific Site/Material/etc. ("Site X has not submitted a Daily Site Report yet today") rather than a generic warning — that's each consuming screen's responsibility when this component is used in later epics, not something to hardcode here.
  - [x] Write `packages/ui/src/components/gap-flag.test.tsx` covering: renders icon, message, and the required action; TypeScript (or a runtime check, if the prop can't be made strictly required due to the icon/message being children) makes omitting the action a build-time or clearly-asserted error.
- [x] Task 4: Build CorrectAction (AC: #4, #6)
  - [x] New file `packages/ui/src/components/correct-action.tsx`. Renders `<Button variant="ghost" iconOnly>` wrapping an injected icon (intended to be story 1.4's rotate-ccw/"correct" icon once that story lands — accept it as a required `icon` prop for now, same decoupling pattern as Gap Flag/Stat Tile) with an accessible label (`aria-label="Correct"` or a caller-overridable `label` prop, since an icon-only button needs a non-visual name per the Accessibility Floor in `EXPERIENCE.md`).
  - [x] This component does **not** implement the "opens a reason-required entry linked to the original record" behavior itself — per AC #4's own wording ("when wired by a consuming screen") and per AD-9, that flow is domain-specific (a Purchase's correction form differs from an Advance's) and belongs to whichever future epic/story implements each transaction type's screens. This component's contract is purely the *affordance*: an `onClick`/`href` prop the consuming screen wires to its own correction flow. Do not build a generic correction modal/form here — that would be scope creep beyond this story's AC and would guess at a UX pattern (`DESIGN.md` says correction is "a new entry requiring a reason, linked to the original" but the entry itself is always a full domain form, not a generic dialog).
  - [x] Enforce the "never Edit/Delete" rule structurally where practical: do not expose a `variant` prop on this component at all (it's always the ghost/icon-only rotate pattern) — a caller cannot accidentally configure it to look like an Edit button, because there's no prop surface that would allow it.
  - [x] Write `packages/ui/src/components/correct-action.test.tsx` covering: renders as an icon-only ghost button, forwards `onClick`/`href` correctly, has an accessible name.
- [x] Task 5: Wire exports and verify (AC: #6)
  - [x] Add exports for all four new components to `packages/ui/src/index.ts`.
  - [x] Run `pnpm --filter @azentisfieldos/ui typecheck`, `pnpm --filter @azentisfieldos/ui lint`, and the full new test suite.
  - [x] Grep all four new files for raw hex/rgba/bare-px literals — zero matches required (AD-4).

## Dev Notes

- This story depends on story 1.1's tokens and story 1.2's `Button` component (Gap Flag's action, CorrectAction's whole implementation). If either predecessor story is incomplete, treat as a hard blocker — confirm the actual landed component APIs (prop names, variant names) in `packages/ui/src/components/button.tsx` before wiring against them here, rather than assuming this story file's own earlier description of story 1.2 is still accurate; a story file describes intent at authoring time, the actual code is the source of truth once written.
- Icon decoupling: three of this story's four components (Stat Tile, Gap Flag, CorrectAction) need an icon but story 1.4 (the icon system) hasn't landed yet at this story's position in the sequence. The pattern established in story 1.2 for Badge (accept `icon` as an injected `ReactNode` prop rather than importing a hardcoded icon) is deliberately reused here for the same reason — it keeps this story's components buildable and testable independent of story 1.4's completion, and story 1.4 becomes a pure "produce icon components, pass them in at call sites" story with no rework needed here.
- The Data Table's row-link bug class this story must make impossible is not hypothetical — it's a documented finding: "Caught during UX review: `mockups/18-daily-activities.html` originally had `cursor:pointer` rows with no real link — the Data Table component must make that class of bug structurally impossible." This is the single most important behavioral requirement in this story; don't treat it as a minor detail. The `rowHref`-accessor API design in Task 1 is the mechanism that prevents it — verify with a real test, not just visual inspection, since "structurally impossible" is a testable claim (a row with no `rowHref` must be provably free of both `cursor-pointer` and any click-navigation wiring).
- AD-9's append-only transaction tables (Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment) are exactly the rows CorrectAction targets; Vendor/Material/category config rows use a normal Edit affordance instead (out of scope for this story — Edit-in-place for config data isn't part of Epic 1's component set per the epic's UX-DR list, and isn't requested by this story's AC).
- Testing standard: Vitest, matching stories 1.1/1.2's established config — reuse it, don't reconfigure.

### Project Structure Notes

- New files: `packages/ui/src/components/data-table.tsx`, `stat-tile.tsx`, `gap-flag.tsx`, `correct-action.tsx`, plus colocated test files for each — same flat `components/` colocation convention as `button.tsx`/`card.tsx`/`badge.tsx`.
- Updated file: `packages/ui/src/index.ts` (barrel export additions).
- No `apps/web` or `apps/api` changes required by this story's AC.

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md#Components] — Data Table, Stat Tile, Gap Flag, Correct action visual specs.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md#Component Patterns] — behavioral rules for Data table row-linking, Row-level Correct vs. Edit, Gap flag.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md#State Patterns] — Loading/Empty/Error treatment this story's Data Table state set must match.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-6] — full-state-set rule.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-9] — append-only/Correct pattern rationale.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html] — lines 150-161 (`.stat-tile`/`.stat-icon`), lines 181-196 (`.table-wrap`/`table.data`), line 230 (`.gap-flag`) — literal CSS shapes to translate.
- [Source: _bmad-output/planning-artifacts/epics/phase-1-foundation/epic-1-platform-foundation-auth-design-system.md] — UX-review-caught row-link bug, cited verbatim in this story's Dev Notes.
- [Source: _bmad-output/implementation-artifacts/1-1-design-token-foundation.md], [Source: _bmad-output/implementation-artifacts/1-2-core-components-button-card-badge.md] — predecessor stories whose outputs this story consumes.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/ui typecheck` — pass
- `pnpm --filter @azentisfieldos/ui lint` — pass
- `pnpm --filter @azentisfieldos/ui test` — 42/42 pass (18 new tests across the 4 components)
- `pnpm --filter @azentisfieldos/web build` — pass
- Grep for raw hex/rgba/px-bracket literals in all 4 new component files — zero matches (after fixing two violations found during self-check, see below)

### Completion Notes List

- `DataTable` uses a `rowHref: (row: T) => string | undefined` accessor — a row without a resolved href renders with no `cursor-pointer` and no anchor at all, verified by a dedicated test, making the `mockups/18-daily-activities.html` bug class (clickable-looking dead rows) structurally impossible rather than just avoided by convention. Row-links render as real `<a>` elements per cell content, not an `onClick` handler.
- Added a new `--duration-fast: 110ms` token to `packages/ui/src/styles/theme.css`'s Motion section (`@theme` block) for the table's row-hover transition — `DESIGN.md`/`_shared-kit.html` specify a *faster* ≤110ms transition for table rows distinct from the ≤160ms figure buttons/cards use (`--default-transition-duration`), and this story's own Dev Notes explicitly warn against conflating the two. This is new theme.css scope beyond what story 1.1 touched, but it's the correct place for it under AD-4 (one token source) rather than a component-local literal.
- Discovered and fixed two AD-4 violations during self-check before running the final grep: `StatTile` initially used arbitrary-bracket pixel literals (`size-[34px]`/`size-[18px]`) for the icon circle — replaced with the nearest token-scale steps (`size-8`/`size-4`, i.e. 32px/16px) since the prototype's exact 34px/18px don't fall on the 4px spacing scale. `GapFlag` initially hardcoded `border-[#E8CC8F]` (DESIGN.md's literal one-off gap-flag border color, which isn't part of the named semantic palette) — added a proper `--gap-flag-border` token to `theme.css` instead of leaving a raw hex literal in component code.
- `StatTile`, `GapFlag`, and `CorrectAction` all accept their icon as an injected `ReactNode` prop rather than importing anything — deliberately decoupled from story 1.4 (icon system), which hasn't landed yet at this point in the sequence, per this story's own Dev Notes.
- `GapFlag.action` is a required `ReactElement` prop (not optional) — omitting it is a TypeScript compile error, enforcing "never a bare warning with no next step" at the type level.
- `CorrectAction` exposes no `variant` prop at all — it always renders the ghost/icon-only rotate pattern via `Button`'s `variant="ghost" iconOnly` (or the equivalent anchor styled with `buttonVariants` for the `href` case), so there is no prop surface that could make it look like an Edit affordance. It does not implement the actual "opens a reason-required entry" flow — that's an `onClick`/`href` the consuming screen wires up in a later epic, per AD-9 and this story's explicit scope boundary.
- `DataTable`'s `state` prop is a discriminated union (`loading`/`empty`/`error`/`success`) so each of AD-6's required states is owned by the component itself, not left to per-screen conditionals — loading renders skeleton rows matching the real column count, empty and error both require a message (and empty optionally an action), never a bare header-only table.

### File List

- `packages/ui/src/components/data-table.tsx` (new)
- `packages/ui/src/components/data-table.test.tsx` (new)
- `packages/ui/src/components/stat-tile.tsx` (new)
- `packages/ui/src/components/stat-tile.test.tsx` (new)
- `packages/ui/src/components/gap-flag.tsx` (new)
- `packages/ui/src/components/gap-flag.test.tsx` (new)
- `packages/ui/src/components/correct-action.tsx` (new)
- `packages/ui/src/components/correct-action.test.tsx` (new)
- `packages/ui/src/index.ts` (modified — barrel exports)
- `packages/ui/src/styles/theme.css` (modified — `--duration-fast`, `--gap-flag-border` tokens)
