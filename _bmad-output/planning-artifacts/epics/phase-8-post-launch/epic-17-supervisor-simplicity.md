---
epic: 17
phase: "8 — Post-launch Enhancements"
status: done
---

# Epic 17: Supervisor Simplicity

## Goal

Make the product usable by a Site Supervisor with no training and no one to ask — the brief's original mandate, which had drifted as later epics (Materials, RMC, Waste & Disposal, Search & Scale) each added their own owner-oriented surface without re-checking the field-user path. A full end-to-end usability audit (three parallel code-review passes over app shell/nav, every entry form, and every list/state/consistency pattern) found the foundation strong — one shared component per primitive, solid empty/error states, confirm-before-submit on every money flow — but the daily-task path itself had regressed: a Supervisor landed on the Owner's cross-Site financial dashboard, every task was 3+ taps behind a hamburger, corrections asked the user to compute a signed delta by hand, and the same concept ("Daily Report") had four different names across the UI.

This epic ships the seven decisions (D1–D7) that came out of that audit, approved from interactive visual mockups (`_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html`) before any code was written. `EXPERIENCE.md`'s "2026-09-01 simplicity revision" note and its eight new Component Pattern rows are the resulting spine changes; this epic is the story-level record of delivering them.

## Stories

- 17.1 Supervisor Home & task-first navigation
- 17.2 One name everywhere: "Daily Report"
- 17.3 Mobile card lists for wide tables
- 17.4 Forgiving corrections
- 17.5 Simplified, validated entry forms
- 17.6 Inward entries without pricing (Supervisor records, Owner prices)

## Related Architecture Requirements

- AD-3 unaffected: every new surface (Supervisor Home, the pricing queue) reads through existing `apps/api` endpoints or one new endpoint (`GET /purchases/count/pending-pricing`, `PATCH /purchases/:id/pricing`) — `apps/web` still never touches a database directly.
- AD-5 extended: three new shared `packages/ui` primitives — `CorrectedValueField` (corrected-value → derived-delta correction entry), `DetailsDisclosure` (native `<details>` progressive fold), and `DataTable`'s `mobileCard` mode — each adopted everywhere the pattern applies, never re-implemented per screen.
- AD-7 extended: every server-action form's FormData→schema coercion now lives in a sibling `parse.ts`, imported by both the Server Action and a new `useClientValidation` hook (`apps/web/lib/use-client-validation.ts`) for inline pre-submit errors — one validator, two run sites.
- AD-9's append-only rule gains its one sanctioned, documented exception (AGENTS.md): `PATCH /purchases/:id/pricing` fills a Supervisor-recorded Purchase's null pricing fields exactly once (atomic `updateMany` conditional on `totalAmount IS NULL`) — never an overwrite of a recorded value.
- AD-11 unaffected: role gating stays server-side (`@Roles('OWNER_ADMIN')` + `RolesGuard`); every UI change (trimmed nav, hidden pricing fields) is de-emphasis/reachability, never the access boundary itself.

## Implementation Notes

Scoped from the 2026-09-01 UX audit (three parallel `Explore` subagent passes) and delivered against visual mockups the user approved decision-by-decision (D1 layout, D2 nav trim, D3 mobile cards, D4 corrections, D5 form simplification, D6 naming, D7 pricing split) before implementation began. A 10-layer adversarial code review (Blind Hunter + Edge Case Hunter + Verification Gap × 3 code chunks, plus a full Acceptance Auditor pass against `EXPERIENCE.md`) followed the initial implementation; all 21 findings it raised were patched (commit `b6c0950`) and ~40 tests were added pinning behavior that had shipped with no coverage. Nine pre-existing findings unrelated to this epic's own regressions are tracked in `_bmad-output/implementation-artifacts/deferred-work.md` rather than files against these stories.

One deploy-pipeline fix rode along with this epic but isn't a story of its own: `turbo.json`'s build task now hashes `DATABASE_URL` (not just `VERCEL_ENV`) so a Turbo cache hit can never replay a build — and skip its migration — against a different tenant's database; found during the code review of this epic's own migration but applies to every future migration-bearing deploy.

Commits: `9f79461` (initial delivery), `4ebea08` (deploy env-passthrough fix), `b6c0950` (code-review patches + tests).
