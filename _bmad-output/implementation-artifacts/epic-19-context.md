# Epic 19 Context: Owner Quick-Access & Mobile-Alignment

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Reduce the Owner's click-depth for their most frequent actions, and fix a real mobile-rendering bug affecting both roles. An audit of the live `apps/web` Owner experience (approved via interactive HTML mockups before any code was written) found three friction points — the Dashboard's pending-pricing gap-flag lands on a generic filtered list instead of the record itself; Advance entry is buried three clicks deep inside a Team Member's profile with no shortcut from the Dashboard's own Outstanding Advances card; and the existing `⌘K` search covers only Sites and Materials, leaving no fast path to a Vendor, Payment, or Purchase — plus one unrelated but confirmed real bug: action-button header rows on roughly a dozen pages use `flex flex-wrap` with no full-width-stack rule below the mobile breakpoint, producing jagged, unevenly-wrapped rows at 390px. This is entirely UI/component-level work within the existing architecture spine — no new FRs and no new backend surfaces beyond the search endpoint's coverage expansion. Vendor payment recording and Subcontractor Site Contract payment UI are known related gaps but are explicitly deferred (need new API work, out of scope here).

## Stories

Ordered so shared primitives ship before the surfaces that consume them — no story depends on a later-numbered one.

- Story 19.1: Advance Quick-Entry Modal (done — ships with Dashboard's Outstanding Advances card entry point)
- Story 19.2: Global Search & Action Palette (entity-search expansion + curated Actions group)
- Story 19.3: Dashboard Quick-Actions Bar (adds Record Payment/Advance, Add Purchase, Search entry points)
- Story 19.4: Owner Mobile Quick-Bar (Quick Add sheet + Search tab)
- Story 19.5: Pending-Pricing Deep Link
- Story 19.6: Recently-Viewed Shortcuts
- Story 19.7: Action-Button Group Mobile Alignment Fix
- Story 19.8: Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory

## Requirements & Constraints

- No new functional requirements — this epic ships UI/component changes only. It reuses existing Advance, Payment, Purchase-pricing, and search semantics.
- The Owner Dashboard's four rollup cards (Active Sites, Inventory low-stock, Outstanding Advances, Pending Payments) are the anchor surface several stories attach to: the quick-actions bar sits above/beside them, the pending-pricing deep link comes off the pending-pricing gap-flag, and recently-viewed shortcuts render below the bar.
- Advances are pooled per Team Member; the quick-entry modal must create the same kind of Advance record the full Team Member-profile form creates — not a parallel record type or validation path.
- All changes are additive: no existing surface is removed, no new top-level nav section is introduced.
- Keyboard shortcuts stay a strictly optional accelerator: the Search/Action palette (`⌘K` on desktop, a tap target on Owner mobile) is the only keyboard-triggerable UI in the product, and it must never become a requirement to accomplish a task — everything remains click/tap-first.
- The button-row mobile-alignment bug is a single shared pattern problem, not twelve separate ones: the fix is one shared responsive rule (stack full-width below the mobile breakpoint, wrap inline at `sm`+), applied everywhere the pattern occurs (Movements, Site detail's "Today at this Site" card, Team & Labour, Vendors, Subcontractors, Machinery & Vehicles, Inventory, Expenses, Materials, Daily Activity, RMC), not a per-page bespoke fix.
- Mobile card-list conversion targets exactly: `apps/web/app/(app)/sites/sites-list-client.tsx` (Location column currently clips), `apps/web/app/(app)/vendors/vendors-list-client.tsx` (Phone clips), `apps/web/app/(app)/team/team-members-list-client.tsx` (Employment Type clips), and `apps/web/app/(app)/inventory/page.tsx` (both Godown Stock and Site Stock tables, Qty clips). No horizontal-scroll-only tables is a hard rule.

## Technical Decisions

- AD-3 unaffected: every new surface reads through existing `apps/api` endpoints (Advance, Payment, Purchase pricing) or the extended `GET /search` endpoint — `apps/web` still never touches a database directly.
- AD-5 extended: four new shared `packages/ui` primitives — a Search/Action palette result-group renderer, a quick-entry modal shell, an Owner mobile quick-bar, and a recently-viewed chip row — each adopted wherever the pattern applies, never re-implemented per screen.
- The existing `DataTable` component (`packages/ui/src/components/data-table.tsx`) already supports a `mobileCard` mode, proven by the epic-17 pass on Payments/RMC/Expenses/Movements/Waste. Story 19.8 wires it onto four more lists with correct primary/secondary field mapping — it is not a new component.
- AD-7 unaffected: the Advance quick-entry modal reuses the existing `Advance` creation schema/action.
- AD-9 unaffected: no transaction-history table gains a new mutation path.
- AD-11 unaffected: the Owner mobile quick-bar and Search/Action palette are `OWNER_ADMIN`-scoped by the existing `@Roles`/`RolesGuard` gating; no access-boundary change.
- Recently-viewed shortcuts are device-local (localStorage), following the same convention as the existing `SiteField` combobox: last 4-6 distinct records across any entity type, most-recent-first, cleared on sign-out, read-only jump links, no pinning.

## UX & Interaction Patterns

- **Search/Action palette** (extends the existing `⌘K` palette): entity coverage expands to Vendors, Team Members, Payments, Purchases, Subcontractors, RMC entries, and Expenses, each its own grouped, plain-text-match "See all" set (no fuzzy/AI matching). A curated **Actions** group (New Daily Report, Record Payment, Record Advance, Add Purchase/Vendor/Team Member/Subcontractor, Review & Price, Open Reports, Open Settings) renders above entity groups on matching queries. Selecting an action that needs a target opens a quick-entry modal in place; selecting an entity result navigates directly. Visually: centered modal over a dimmed scrim, results grouped under uppercase eyebrow labels; entity rows use a tinted icon tile, action rows use a solid-filled icon tile (distinguishes "does something" from "opens a record"; never gold, which is reserved for money).
- **Dashboard quick-actions bar**: "New Daily Report" stays the hero-styled primary action; Record Payment/Record Advance/Add Purchase render as secondary buttons; a "Search ⌘K" ghost chip sits alongside. Wraps per the same action-button-group rule as everywhere else on narrow viewports.
- **Advance quick-entry modal**: a searchable Team Member combobox (same interaction pattern as `SiteField`, scoped to Team Members) plus amount and reason fields; submits the same `Advance` record the full form creates; returns the user to their origin screen on success. Modal chrome matches the palette but narrower (~420px), with a standard Cancel/primary-submit footer.
- **Pending-pricing deep link**: the Dashboard gap-flag's action button becomes "Review & Price →". It opens Movements pre-filtered to a real "Pricing pending" tab (not a generic mixed list) — or, if exactly one purchase is pending, skips the list entirely and goes straight to that purchase's pricing screen.
- **Owner mobile quick-bar**: a fixed bottom bar shown below the `lg` breakpoint, `OWNER_ADMIN`-only, distinct from the Supervisor's bottom bar (this one is entity-spanning, not dominant-task): Dashboard · Sites · a center raised circular "+" FAB (Quick Add bottom sheet, listing the same curated action set) · Search (opens the palette) · More (full nav).
- **Recently-viewed shortcuts**: a horizontally-scrolling chip row under the quick-actions bar; each chip shows a tinted icon, the record name, and a muted entity-type suffix (e.g. "· Site").
- **Action-button group mobile fix**: below the mobile breakpoint, button rows stack full-width in a single column instead of wrapping unevenly; at `sm`+ they continue to wrap inline as before. This is one shared responsive rule applied across all affected pages, not a per-page fix.

## Cross-Story Dependencies

- 19.3 (Dashboard Quick-Actions Bar) consumes the modal shell from 19.1 and the palette from 19.2.
- 19.4 (Owner Mobile Quick-Bar) consumes 19.1 (its Quick Add sheet) and 19.2 (its Search tab).
- 19.7 (Action-Button Group Mobile Alignment Fix) also cleans up the button row 19.3 introduces, once both have landed.
- 19.5, 19.6, and 19.8 are independent of the rest of the epic.
