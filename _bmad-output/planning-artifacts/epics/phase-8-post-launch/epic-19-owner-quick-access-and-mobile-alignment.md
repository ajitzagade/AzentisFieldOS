---
epic: 19
phase: "8 — Post-launch Enhancements"
status: backlog
---

# Epic 19: Owner Quick-Access & Mobile-Alignment

## Goal

Reduce the Owner's click-depth for the actions they do most often, and fix a real mobile-rendering bug affecting both roles — the Owner-side counterpart to Epic 17's Supervisor simplicity work. An audit of the live `apps/web` Owner experience found most single-entity actions already reachable in ≤2 clicks, but three real friction points: the Dashboard's pending-pricing gap-flag lands on a generic filtered list instead of the record itself, Advance entry is buried 3 clicks deep inside a Team Member's profile with no shortcut from the Dashboard's own "Outstanding Advances" card, and the existing `⌘K` search covers only Sites and Materials — an Owner who doesn't use the system daily has no way to jump straight to a Vendor, Payment, or Purchase by name. Running the app locally at a 390px viewport also surfaced a real, separate bug: action-button header rows across roughly a dozen pages use `flex flex-wrap` with no full-width-stack rule below the mobile breakpoint, producing jagged, unevenly-wrapped button rows for both Owner and Supervisor.

This epic ships the nine changes that came out of that audit, approved from interactive HTML mockups (`_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html`) before any code was written. `EXPERIENCE.md`'s "2026-09-02 Owner quick-access & mobile-alignment revision" note, its six new/extended Component Pattern rows, the corrected Interaction Primitives line, and the new Flow 7 are the resulting spine changes; this epic is the story-level record of delivering them. No new FRs — this is entirely UI/component-level work within the existing architecture spine.

**Deferred, not in scope:** Vendor payment recording and Subcontractor Site Contract payment UI are real gaps the audit surfaced, but both need new API/backend work — logged as separate future work, not part of this epic.

## Stories

Ordered so shared primitives ship before the surfaces that consume them — no story depends on a later-numbered one.

- 19.1 Advance Quick-Entry Modal (ships with one standalone entry point: Dashboard's Outstanding Advances card)
- 19.2 Global Search & Action Palette (entity-search expansion + curated Actions group)
- 19.3 Dashboard Quick-Actions Bar (adds Record Payment/Advance, Add Purchase, Search entry points, consuming 19.1 and 19.2)
- 19.4 Owner Mobile Quick-Bar (consuming 19.1 and 19.2 via its Quick Add sheet and Search tab)
- 19.5 Pending-Pricing Deep Link (independent)
- 19.6 Recently-Viewed Shortcuts (independent)
- 19.7 Action-Button Group Mobile Alignment Fix (independent; also cleans up 19.3's button row once both have landed)
- 19.8 Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory (independent)

## Related Architecture Requirements

- AD-3 unaffected: every new surface reads through existing `apps/api` endpoints (Advance, Payment, Purchase pricing, search) or extends the existing `GET /search` endpoint's coverage — `apps/web` still never touches a database directly.
- AD-5 extended: new shared `packages/ui` primitives — a Search/Action palette result-group renderer, a quick-entry modal shell, an Owner mobile quick-bar, and a recently-viewed chip row — each adopted wherever the pattern applies, never re-implemented per screen. `DataTable`'s existing `mobileCard` mode is wired onto four more lists, not re-implemented.
- AD-7 unaffected: the Advance quick-entry modal reuses the existing `Advance` creation schema/action — no parallel validation path.
- AD-9 unaffected: no transaction-history table gains a new mutation path; the Advance quick-entry modal creates the same kind of row the Team Member profile's full form already creates.
- AD-11 unaffected: the Owner mobile quick-bar and Search/Action palette are `OWNER_ADMIN`-scoped by the same role gating already in place (`@Roles`/`RolesGuard`); no access-boundary change.
