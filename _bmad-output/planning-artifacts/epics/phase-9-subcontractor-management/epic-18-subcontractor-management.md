---
epic: 18
phase: "9 — Subcontractor Management"
status: in-progress
---

# Epic 18: Subcontractor Management

## Goal

Owner/Admin engages external Subcontractors for site work under flexible commercial terms (Fixed Cost, Per Trip, Per Pipe, Per Unit, or Custom), tracks work completed against those terms, and records payments/advances — with Site Supervisors able to see who's on their Site and log day-to-day work progress in a form as simple as Consumption entry. Every Site and every Subcontractor shows work assigned, terms, completed-vs-pending, and amount payable/paid/outstanding at a glance.

**Naming decision:** the feature is user-facing as "Subcontractors," not "Contractors" — `glossary.md`'s **Contractor / Company** term already means the tenant itself (the business running the app). Reusing "Contractor" for an external party would collide with every existing dashboard label, report heading, and FR (FR-3, FR-46, CAP-10 "Contractor Dashboard") that already means "the tenant." "Subcontractor" is unambiguous and defined fresh in `glossary.md`.

**Requirements:** FR-55 through FR-63 (CAP-17, `functional-requirements.md`). No PRD/architecture-spine update needed beyond the FR/glossary additions — this epic fits entirely within the existing AD-1..AD-15 architecture (deploy-per-tenant, `apps/api`-only DB access, append-only transaction history, shared Zod schemas, two-role model), no new architectural decision required.

## Stories

- 18.1 Manage Subcontractor Records (FR-55) — Owner-managed master data: name, contact, phone, email, address, work categories. Mirrors Epic 9's Vendor pattern exactly (plain edit + soft delete, not transaction history).
- 18.2 Create and Manage Site Contracts (FR-56, FR-57) — Owner-managed: a Subcontractor's engagement on one Site, flexible rate type (Fixed/Per Trip/Per Pipe/Per Unit/Custom), Draft→Active→Completed/Cancelled lifecycle, Draft contracts may leave commercial terms pending (D7 pricing-completion pattern reused).
- 18.3 Record Subcontractor Work Progress (FR-58) — Supervisor-facing, deliberately simple: quantity + date + note against an Active Site Contract. Append-only, mirrors Consumption/Movement entry.
- 18.4 Record Subcontractor Payments & Advances (FR-59) — Owner-facing money movement against a Site Contract. Append-only ledger row (type: Advance or Payment), mirrors Epic 7's Advance/Payment pattern but without the floor-check (a Subcontractor advance may legitimately exceed work completed so far).
- 18.5 Subcontractor Visibility on Site & Subcontractor Detail Pages (FR-60, FR-61, FR-62) — Ties 18.1–18.4 together: a "Subcontractors" section on Site detail (who's assigned, what work, status), and a Subcontractor detail page showing full cross-Site contract/payment history with completed-vs-pending and payable/paid/outstanding, mirroring Epic 9's Vendor detail composition.
- 18.6 Cross-Site Subcontractor Payable Rollup (FR-63) — Owner Dashboard: total outstanding-to-Subcontractors stat tile, drillable per Subcontractor, plus a Gap Flag for any Site Contract still in Draft with pending commercial terms (same GapFlag + count-endpoint pattern as D7's pending-pricing flag).

## Related Architecture Requirements

- **AD-9 extended:** `SubcontractorWorkEntry` and `SubcontractorPayment` join the append-only transaction-history set (`correctsId` + reason, DB-grant-backed); the contract's materialized `quantityCompleted`/`amountPaid` fields update only in the same transaction as the causing ledger row, never summed on read — same discipline as `TeamMember.outstandingAdvanceBalance` and `Purchase`'s stock effects.
- **D7's idea reused, its mechanism deliberately not:** a Draft Site Contract's rate/amount fields stay nullable until filled, echoing D7's "start incomplete, complete later" shape — but Site Contract is master/agreement data edited in place (like Site), not an AD-9 append-only table like Purchase, so it doesn't need and must not copy D7's atomic-one-time-fill endpoint (`PATCH /purchases/:id/pricing`'s conditional `updateMany`). Instead, a normal `PATCH /site-contracts/:id` plus a status-transition validation rule (DRAFT→ACTIVE requires terms complete) achieves the same outcome with less machinery — no new AD-9 sanctioned-exception decision needed, because this story never touches AD-9's exception surface at all. See Story 18.2's Dev Notes for the full reasoning.
- **AD-5:** no new `packages/ui` primitives expected — `DataTable` (with `mobileCard`), `CorrectAction`, `GapFlag`, `StatTile`, `Badge`, `DetailsDisclosure`, `AmountField`, `ComboboxField` all already cover this epic's UI surface.
- **AD-7:** one Zod schema per shape in `packages/shared` (`subcontractor.ts`, `site-contract.ts`, `subcontractor-work-entry.ts`, `subcontractor-payment.ts`), imported by both `apps/api` and `apps/web`.
- **AD-11 unaffected:** only `OWNER_ADMIN`/`SITE_SUPERVISOR` — Supervisors get an unguarded `POST` for Work Entries (mirrors Consumption); everything else (Subcontractor CRUD, Site Contract CRUD/pricing, Payments) is `@Roles('OWNER_ADMIN')`, matching the `VendorsController`/`PurchasesController` split.
- **AD-3 unaffected:** `apps/web` reaches all of this over HTTP through a new `contractors` (or `subcontractors`) `apps/api` module, mirroring the standalone `vendors/` module shape.

## Implementation Notes

Scoped from a direct feature request (2026-09-02) to add outsourced-work tracking aligned to Sites, reusing existing Vendor (master + soft delete), Advance/Payment (append-only ledger + materialized balance), and D7 pricing-completion (nullable-terms-until-Owner-completes-them) patterns rather than inventing new mechanics. No offline/DSR-queue support is in scope (AD-8 doesn't apply) — this is a desktop-oriented Owner/Supervisor flow like Vendors and Advances, not a field-entry flow.

Out of scope for this epic, tracked separately: a general Vendor payables ledger (`_bmad-output/reviews/product-ux-review-2026-08-29.md` roadmap item #1) is a related-but-distinct gap for *material* Vendors, not Subcontractors — do not conflate the two entities or their payment tables even though the append-only shape is similar.

**Implementation (2026-09-02):** all 6 stories built end to end in one pass — 4 new Prisma models (`Subcontractor`, `SiteContract`, `SubcontractorWorkEntry`, `SubcontractorPayment`) + `ContractStatus` enum (migration `20260902083509_subcontractor_management`), 4 shared Zod schemas, a new `apps/api/src/subcontractors/` module (`SubcontractorsController`/`Service`, `SiteContractsController`/`Service`, `WorkEntriesController`/`Service`, `SubcontractorPaymentsController`/`Service`), and the full `apps/web` surface (Subcontractors list/detail/edit, Site Contract new/detail/edit with the flexible rate-type form, Log Work + Record Payment forms with corrections, Site detail's "Subcontractors" section, Subcontractor detail's "Site Contracts" section, Dashboard StatTile + GapFlag). One deliberate correction mid-build: the epic's original assumption that Draft Site Contracts would reuse D7's atomic-one-time-fill mechanism turned out wrong — `SiteContract` is mutable master data (like `Site`), not an AD-9 append-only table, so it uses a normal `PATCH` plus a merged-record ACTIVE-requires-terms check instead (see the corrected Related Architecture Requirements entry above). `packages/ui` gained one new primitive, `TagsField` — `MaterialsSuppliedField` (Vendor-local since Story 9.1) was promoted once Subcontractor's `workCategories` became its second consumer, per Story 9.1's own dev notes naming that exact threshold.

Verification: full monorepo `pnpm typecheck`/`pnpm test`/`pnpm lint` all green (two unrelated pre-existing `daily-activity` tests timed out once under full-suite resource contention, confirmed passing in isolation — not a regression). UX finalized first: 4 mockups promoted from `.working/` to `ux-designs/.../mockups/` (`20-subcontractors.html` through `23-site-contract-detail.html`), `03-site-detail.html` updated in place, `EXPERIENCE.md` gained an IA note + 2 Component Patterns rows + Flow 6, all 21 mockup files' sidebars updated with the new nav item.
