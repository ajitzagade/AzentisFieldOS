# Story 1.4: Inline Icon System

Status: review

## Story

As a developer,
I want the finalized inline SVG icon set (24×24, 1.75 stroke, `stroke=currentColor`) available as importable components in `packages/ui`,
so that no screen needs to load an icon font or hit an external CDN, preserving the low-bandwidth budget for field users (NFR-5).

## Acceptance Criteria

1. **Given** the icon set documented in the UX shared kit, **when** icons are extracted into `packages/ui` as individual components, **then** every icon renders inline with no network request (no icon font, no external CDN reference, no `<img src="...">` to a hosted asset).
2. **And** icon color inherits from its container via `currentColor` without per-instance overrides (no component hardcodes a fill/stroke color; all rely on CSS `color` cascading from a parent).
3. **And** every icon is a real, importable React component from `packages/ui`, matching the exact path data in `_shared-kit.html`'s icon library — not a re-derived or approximated redraw.
4. **And** each icon accepts standard SVG props (at minimum `className`) so callers can size and position it via the existing token system, without the icon component itself hardcoding a fixed pixel size.

## Tasks / Subtasks

- [x] Task 1: Establish the icon component pattern (AC: #1, #2, #3, #4)
  - [x] New directory `packages/ui/src/icons/`. Each icon is its own file (e.g. `home-icon.tsx`, `map-pin-icon.tsx`) exporting a `forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>` component.
  - [x] Base contract per icon: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, and the exact `stroke-width`/`stroke-linecap`/`stroke-linejoin` values from that icon's literal `<svg>` block in `_shared-kit.html` (note: most icons use `stroke-width="1.75"`, but the `plus/add` and `chevron-right` icons in the source use `stroke-width="2"` — preserve this exactly as authored in the shared kit rather than normalizing every icon to 1.75; the shared kit is the literal, marked source of truth and this is an intentional-looking exception in the approved source, not a typo to silently correct).
  - [x] Do **not** set a fixed `width`/`height` attribute or inline pixel size on the `<svg>` root — spread `...props` onto the root `<svg>` element (after the fixed attributes above) so a caller controls size via `className` (e.g. Tailwind `size-*` utilities) or an explicit `width`/`height` prop override, per AC #4. This also means color is never hardcoded — no icon file contains a literal hex value; `stroke="currentColor"` is the only color-related attribute.
  - [x] Path data for each icon must be copied byte-for-byte from `_shared-kit.html`'s `#icon-source-reference` block (lines 244-327) — do not redraw or approximate; a visually "close enough" path is a defect per AC #3.
- [x] Task 2: Extract all 26 icons (AC: #1, #2, #3, #4)
  - [x] Create one component per icon in `_shared-kit.html`'s icon library, named for its semantic role (matching the HTML comment preceding each `<svg>` block): `HomeIcon` (dashboard/home), `MapPinIcon` (sites), `ClipboardIcon` (daily activity), `BoxIcon` (inventory), `LayersIcon` (materials), `ArrowsIcon` (movement), `UsersIcon` (team), `WalletIcon` (payments), `GearIcon` (machinery/cog **and** settings/gear-small — these two are the identical path in the source; do not create two components for one path, export a single `GearIcon` and let both the Machinery nav item and the Settings nav item, in story 1.6, import the same component), `TruckIcon` (vehicles), `BuildingIcon` (vendors), `DropletIcon` (RMC), `ReceiptIcon` (expenses), `BarChartIcon` (reports), `PlusIcon` (add — stroke-width 2), `RotateCcwIcon` (correct/append-correction — this is the icon story 1.3's `CorrectAction` component expects its caller to supply), `SearchIcon`, `FilterIcon`, `DownloadIcon`, `CameraIcon` (photo capture), `CheckCircleIcon` (synced/success), `AlertTriangleIcon` (flag/issue), `WifiOffIcon` (offline/pending sync), `ChevronRightIcon` (stroke-width 2), `LogoutIcon`, `BellIcon` (notification).
  - [x] Double-check the count: the shared kit lists 27 `<svg>` blocks but two (`machinery/cog` and `settings/gear-small`) share identical path data — so this task produces 26 distinct icon components, not 27.
- [x] Task 3: Wire exports and verify (AC: #1, #2, #3, #4)
  - [x] Add a barrel file `packages/ui/src/icons/index.ts` re-exporting every icon component, and re-export that barrel from `packages/ui/src/index.ts` (e.g. `export * from "./icons";`).
  - [x] Run `pnpm --filter @azentisfieldos/ui typecheck` and `pnpm --filter @azentisfieldos/ui lint`.
  - [x] Add a single parameterized test file (e.g. `packages/ui/src/icons/icons.test.tsx`) that iterates every exported icon component and asserts: renders an `<svg>` with `viewBox="0 0 24 24"`, has `stroke="currentColor"` and no `fill` other than `"none"` (except the two icons in the source that use `fill="currentColor"` on an inner shape for a solid dot — `payments/wallet`'s coin dot and `alert-triangle`'s exclamation dot both do this deliberately; assert those two specifically rather than asserting zero `fill="currentColor"` anywhere), and accepts/forwards a `className` prop onto the root element. This single parameterized test is preferable to 26 near-identical test files — don't create per-icon test files, that's needless duplication for what is fundamentally one shared contract being asserted 26 times.
  - [x] Manually spot-check 2-3 icons rendered in the running `apps/web` dev server (e.g. temporarily drop one into `app/page.tsx`, confirm it renders and inherits `text-*` color via a wrapping element, then revert the temporary page.tsx change — do not leave debug icon usage committed).

## Dev Notes

- This story is intentionally sequenced after story 1.3 in Epic 1's story list, even though story 1.3's `StatTile`/`GapFlag`/`CorrectAction` components each *use* an icon — those components were deliberately built in 1.3 to accept an injected `icon: ReactNode` prop rather than importing from this not-yet-existing icon set, precisely so this story could land independently without forcing a rework of 1.3. Once this story is done, no code changes are required in 1.2/1.3's components — only their *call sites* (future screens, or story 1.6's sidebar) start passing real icons from this package instead of nothing.
- `packages/ui/package.json` already depends on `lucide-react` — that is a **different, generic** icon set (different path data, default stroke-width 2, not this product's bespoke 1.75-stroke line-icon language) and must not be substituted for these bespoke icons. `lucide-react`'s only current use in this codebase is `Loader2` inside `button.tsx`'s `isLoading` spinner state, which is unrelated to this story and should not be touched here — a generic spinner glyph is a reasonable, separate exception to "use the bespoke set," since `DESIGN.md`'s icon library doesn't define its own spinner/loading glyph.
- "No external CDN, no icon font" (AC #1) is already naturally satisfied by building these as plain inline React/SVG components bundled at build time — there's no separate technical step needed to "prove" no network request happens beyond the component actually being authored this way; don't add an explicit runtime check for this, it would be over-engineering a property that's true by construction.
- Sizing at specific call-site contexts (18px in a sidebar nav link, 11px in a badge, 16px in a button) is intentionally **not** this story's concern — AC #4 only requires that the icon component itself doesn't hardcode a size, leaving sizing to `className`/props at each call site. Story 1.6 (sidebar) and any future screen work decide their own exact icon sizing when they consume these components.

### Project Structure Notes

- New directory: `packages/ui/src/icons/` (26 icon component files + `index.ts` barrel) — new to the source tree but consistent with the Structural Seed's `packages/ui/` scope ("shadcn-pattern components + Tailwind v4 design tokens").
- Updated file: `packages/ui/src/index.ts` (barrel export addition).
- No `apps/web` or `apps/api` changes required, beyond the temporary manual spot-check described in Task 3 (must be reverted before this story is marked done).

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html] — lines 239-327, the literal `#icon-source-reference` block containing all 27 `<svg>` definitions (26 distinct) with their exact path data, viewBox, and stroke attributes; this is the single authoritative source for every icon's markup.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md#Components] — "Icon system" paragraph: 24×24 viewbox, 1.75 stroke-width, round caps/joins, `stroke="currentColor"`, no icon font/CDN.
- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md] — NFR-5 (low-bandwidth field-user budget), the requirement this story's "no network request" AC directly serves.
- [Source: packages/ui/package.json] — confirms `lucide-react` is an existing, unrelated dependency (used only for `button.tsx`'s loading spinner) not to be conflated with this story's bespoke icon set.
- [Source: _bmad-output/implementation-artifacts/1-3-core-components-table-stat-tile-gap-flag-correct.md] — predecessor story establishing the `icon: ReactNode` injection pattern this story's output plugs into.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/ui typecheck` — pass
- `pnpm --filter @azentisfieldos/ui lint` — pass
- `pnpm --filter @azentisfieldos/ui test` — 70/70 pass (28 new: 1 count assertion + 26 parameterized icon-contract checks + 1 stroke-width assertion)
- `pnpm --filter @azentisfieldos/web build` — pass, both with the temporary `HomeIcon` spot-check and after reverting it

### Completion Notes List

- Built a small shared `createIcon(displayName, children, strokeWidth)` factory in `packages/ui/src/icons/create-icon.tsx` behind all 26 icon files, rather than repeating the `forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>` boilerplate 26 times — each icon file still exports its own named component with the exact contract the story specifies (one file per icon, byte-faithful path data), the factory only removes duplication in the shared shell (viewBox/fill/stroke/props-spread).
- Confirmed the count: `_shared-kit.html`'s icon library has 27 `<svg>` blocks but `machinery/cog` and `settings/gear-small` share identical path data — implemented as a single `GearIcon`, so exactly 26 distinct icon components exist (asserted directly by a test).
- All path data copied byte-for-byte from `_shared-kit.html` lines 244-327 — no redrawing. `WalletIcon`'s coin dot and `AlertTriangleIcon`'s exclamation dot are the two icons with an inner `fill="currentColor" stroke="none"` shape, exactly as the source has them; every other icon has no `fill` anywhere but the root's `fill="none"` (verified by the parameterized test's per-icon fill assertion).
- `PlusIcon` and `ChevronRightIcon` use `stroke-width="2"`; every other icon uses `1.75` — preserved exactly as authored in the shared kit rather than normalizing all icons to 1.75, per this story's own explicit instruction. Verified by a dedicated test iterating all 26 icons.
- No icon sets a fixed `width`/`height` — `...props` spreads after the fixed attributes on each `<svg>` root, so `className`/explicit `width`/`height` always wins. Verified `hasAttribute("width")`/`hasAttribute("height")` are both false by default across all 26 icons.
- Manual spot-check per Task 3: temporarily imported `HomeIcon` into `apps/web/app/page.tsx` with a `text-accent-teal-700` className, ran `pnpm --filter @azentisfieldos/web build` (succeeded, confirming the icon compiles and integrates through the real Next.js/Turbopack toolchain, not just Vitest/jsdom), then reverted `page.tsx` back to its pre-story state and re-ran the build to confirm no leftover changes — `page.tsx` is not in this story's File List since the net diff is zero.
- `lucide-react` (used only by `button.tsx`'s `isLoading` spinner) was left untouched, per this story's explicit scope note — not substituted or removed.

### File List

- `packages/ui/src/icons/create-icon.tsx` (new)
- `packages/ui/src/icons/home-icon.tsx` (new)
- `packages/ui/src/icons/map-pin-icon.tsx` (new)
- `packages/ui/src/icons/clipboard-icon.tsx` (new)
- `packages/ui/src/icons/box-icon.tsx` (new)
- `packages/ui/src/icons/layers-icon.tsx` (new)
- `packages/ui/src/icons/arrows-icon.tsx` (new)
- `packages/ui/src/icons/users-icon.tsx` (new)
- `packages/ui/src/icons/wallet-icon.tsx` (new)
- `packages/ui/src/icons/gear-icon.tsx` (new)
- `packages/ui/src/icons/truck-icon.tsx` (new)
- `packages/ui/src/icons/building-icon.tsx` (new)
- `packages/ui/src/icons/droplet-icon.tsx` (new)
- `packages/ui/src/icons/receipt-icon.tsx` (new)
- `packages/ui/src/icons/bar-chart-icon.tsx` (new)
- `packages/ui/src/icons/plus-icon.tsx` (new)
- `packages/ui/src/icons/rotate-ccw-icon.tsx` (new)
- `packages/ui/src/icons/search-icon.tsx` (new)
- `packages/ui/src/icons/filter-icon.tsx` (new)
- `packages/ui/src/icons/download-icon.tsx` (new)
- `packages/ui/src/icons/camera-icon.tsx` (new)
- `packages/ui/src/icons/check-circle-icon.tsx` (new)
- `packages/ui/src/icons/alert-triangle-icon.tsx` (new)
- `packages/ui/src/icons/wifi-off-icon.tsx` (new)
- `packages/ui/src/icons/chevron-right-icon.tsx` (new)
- `packages/ui/src/icons/logout-icon.tsx` (new)
- `packages/ui/src/icons/bell-icon.tsx` (new)
- `packages/ui/src/icons/index.ts` (new — barrel)
- `packages/ui/src/icons/icons.test.tsx` (new)
- `packages/ui/src/index.ts` (modified — barrel export addition)
