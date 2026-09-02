# Epic 19 Context: Owner Quick-Access & Mobile-Alignment

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Reduce the Owner's click-depth for the actions they do most often, and fix a real mobile-rendering bug affecting both Owner and Site Supervisor roles. An audit of the live `apps/web` Owner experience found most single-entity actions already ≤2 clicks away, but three real friction points (pending-pricing gap-flag lands on a generic list instead of the record, Advance entry buried 3 clicks inside a Team Member's profile, ⌘K search covers only Sites/Materials) plus a separate mobile bug (action-button rows across ~12 pages wrap unevenly on narrow viewports, no full-width-stack rule). This is the Owner-side counterpart to Epic 17's Supervisor simplicity work. No new FRs — entirely UI/component-level within the existing architecture spine.

## Stories

- Story 19.1: Advance Quick-Entry Modal
- Story 19.2: Global Search & Action Palette
- Story 19.3: Dashboard Quick-Actions Bar
- Story 19.4: Owner Mobile Quick-Bar
- Story 19.5: Pending-Pricing Deep Link
- Story 19.6: Recently-Viewed Shortcuts
- Story 19.7: Action-Button Group Mobile Alignment Fix
- Story 19.8: Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory

## Requirements & Constraints

- No approval-chain UX anywhere; minimal fields; dropdowns/search over free-text.
- Every quantity/amount correction uses the corrected-value pattern (user types the right value, delta is derived) — not relevant to this epic's stories, but any Advance-adjacent UI must not regress it.
- Click/tap-first interaction model. The Search/Action palette is the one keyboard-accelerator exception, and must remain fully optional — every flow it reaches must also be reachable by ordinary navigation.
- WCAG 2.2 AA across every surface; no status conveyed by color alone; visible focus states; full-row/generous touch targets on mobile.
- Loading/empty/success/validation-failure/error states required on every data-bearing surface (no ad-hoc partial-state screens).
- Money is never rendered as a decorative color; gold is reserved strictly for money figures — new UI (palette action icons, FAB, chips) must not use gold for non-money emphasis.
- No infinite scroll, no Edit/Delete on transaction-history rows, no decorative/celebratory animation, no manual "send" actions.

## Technical Decisions

- Single-tenant per deployment; no tenant switcher; no cross-tenant role. `apps/web` never touches a database directly — all writes go through `apps/api` over HTTP.
- Purchase/Movement/Consumption/Advance/AdvanceAdjustment/Payment/WasteDisposal are append-only transaction-history tables — never `UPDATE`/`DELETE`; corrections are new reason-carrying rows. The one sanctioned exception (`PATCH /purchases/:id/pricing`, one-time fill of null pricing fields) is unrelated to this epic and must not be widened.
- One implementation per UI primitive lives in `packages/ui` — new primitives this epic needs (palette result groups, quick-entry modal shell, Owner mobile quick-bar, recently-viewed chip) go there, never re-implemented per screen.
- Form validation schemas are defined once (Zod) in `packages/shared`, imported by both `apps/api` and `apps/web` — the Advance quick-entry modal (19.1) must reuse the existing `Advance` schema/action, not fork a parallel one.
- `DataTable`'s `mobileCard` prop already exists and is used by Payments/RMC/Expenses/Movements/Waste — Story 19.8 wires it onto four more call sites using the same pattern, no new table component.
- `SiteField`'s remembered-value localStorage pattern is the precedent for Story 19.6's recently-viewed list and for 19.1's Team Member combobox styling.
- Role gating is server-side (`@Roles`/`RolesGuard`); the Owner mobile quick-bar and dashboard bar are UI de-emphasis for `OWNER_ADMIN`, never a new access boundary.
- **Concurrency note:** another session may be working on Epic 18 (Subcontractor Management) in this same working tree concurrently. Re-read any shared file (`owner-dashboard.tsx`, `nav-config.ts`, `app-shell.tsx`, `global-search.tsx`, `data-table.tsx`) immediately before editing it in every story, and keep commits scoped to only the files each story actually changes.

## UX & Interaction Patterns

- `EXPERIENCE.md`'s Component Patterns rows: "Dashboard quick-actions bar," "Search / Action palette," "Advance quick-entry modal," "Owner mobile quick-bar," "Recently-viewed shortcuts," "Action-button group," and the extended "Mobile card list" and "Pricing pending (D7)" rows are the authoritative behavioral spec for this epic.
- `DESIGN.md`'s Components section has matching visual specs for the same four new patterns (palette, modal, quick-bar FAB, chip) — action-row icons in the palette are solid `accent-teal-700` (never gold).
- Visual reference: `mockups/24-owner-quick-access-and-mobile-alignment.html` (all 8 decisions plus the 2 mobile-alignment fixes, D1-D8 labels are local to that file only).
- Spines win on conflict with the mockup.

## Cross-Story Dependencies

Sequenced so no story depends on a later-numbered one: 19.1 (modal) and 19.2 (palette) are the shared primitives and ship first; 19.3 (dashboard bar) and 19.4 (mobile quick-bar) consume both. 19.5-19.8 are independent of everything above and of each other.
