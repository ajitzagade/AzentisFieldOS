---
stepsCompleted: ["step-01", "step-02", "step-03", "step-04"]
inputDocuments:
  - _bmad-output/specs/spec-AzentisFieldOS/SPEC.md
  - _bmad-output/specs/spec-AzentisFieldOS/glossary.md
  - _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md
  - _bmad-output/specs/spec-AzentisFieldOS/success-metrics.md
  - _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md (background/audit trail — fully absorbed into SPEC.md, not re-extracted directly)
  - _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md
---

# AzentisFieldOS - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AzentisFieldOS, decomposing the requirements from the canonical spec contract (`SPEC.md` + companions) and the architecture spine into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Owner/Admin creates and maintains Sites (name, location, status, contract reference); new Site appears immediately in Site list and dashboard.
FR-2: Individual Site view shows every DSR, stock movement, Work Record, expense, RMC entry, and photo tagged to that Site, chronologically.
FR-3: Consolidated contractor-wide rollup across all active Sites; a new Site is included automatically.
FR-4: Owner/Admin adds/edits/disables Material Categories and Materials; disabling hides from new entries, preserves history.
FR-5: Owner/Admin defines Sizes/Specifications per Material, addable anytime without disturbing existing Stock records.
FR-6: Owner/Admin defines Units of Measure; a Material's Unit is enforced consistently across all transaction types.
FR-7: Owner/Admin adds Custom Fields to a Material definition, via a `customFields` JSONB column (no per-tenant schema migration).
FR-8: Record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle, notes, destination Godown-or-Site, optional documents); Godown-destined increases Godown Stock, Site-destined increases Site Stock directly.
FR-9: Godown→Site movement (Material/Size/quantity, vehicle, person responsible, received quantity); decreases Godown Stock at recording, increases Site Stock on confirmed receipt, captures shortage/damage gap.
FR-10: Direct Vendor→Site purchase bypassing Godown, same field set as FR-8 plus receiver; never touches Godown Stock.
FR-11: Site→Site transfer with the same field discipline as FR-9 (vehicle, person responsible, notes, received quantity, shortage/damage gap).
FR-12: Record Consumption at a Site against an activity reference; reduces Site Stock; comparable against total received to compute variance.
FR-13: Record Return/Wastage as a distinct transaction type from Consumption.
FR-14: Full lifecycle visibility per Material/Size/Site/Godown, derived from transaction history, always reconciling exactly.
FR-15: Machinery register (name, type, asset number, model, ownership, operator, current Site); current Site updates on recorded movement.
FR-16: Vehicle register (number, type, ownership, driver, current Site/usage); same visibility guarantee as FR-15.
FR-17: Movement history between Sites (or to/from Maintenance) for Machinery/Vehicles; full history retained, not just latest state.
FR-18: Fuel, maintenance, and repair logging per Machine/Vehicle, retrievable as a dated service history.
FR-19: Team Member records (name, role, contact, employment/payment type); never bound to a single Site.
FR-20: Daily Work Record (Team Members present at a Site on a date, attendance, hours, overtime); a Team Member cannot have two Work Records at two different Sites on the same date.
FR-21: Site-wise work history per Team Member, queryable by Team Member or by Site.
FR-22: Record an Advance (amount, date, reason, payment method); updates Outstanding Balance immediately, no approval step.
FR-23: Record an Advance Adjustment at any time against any Payment; Outstanding Balance changes only via explicit Adjustment; an Adjustment cannot exceed the current Outstanding Balance.
FR-24: Record a Payment (Base Pay + Additional − Deductions − Advance Adjustment = Net Payable); full history retained, never overwritten.
FR-25: Outstanding-advance visibility at a glance, drillable per Team Member, reconciling exactly to the sum of individual balances.
FR-26: Record RMC delivery (Vendor, date, quantity m³, grade/type, rate, total, invoice/challan), queryable by day/Site/Vendor.
FR-27: Daily, Site-wise, and Vendor-wise RMC consumption/cost reporting, reconciling exactly to individual entries.
FR-28: One DSR per Site per date (work, labour, materials, RMC, machinery/vehicles, expenses, issues, photos); submitting a DSR creates/updates linked underlying records rather than duplicating entry.
FR-29: Offline DSR entry and sync; queues on-device, syncs automatically on reconnect; per-sub-record idempotency key prevents duplicates on retry; two-device conflicts resolve last-synced-write-wins per sub-record.
FR-30: Multiple photos per DSR, each auto-associated with Site/date/DSR/activity/uploader.
FR-31: Chronological Site photo/progress gallery across all DSRs.
FR-32: Auto-compile a branded per-Site daily report from that day's DSR, reflecting the Tenant's own branding configuration.
FR-33: Automated delivery via WhatsApp/Email/in-app, no manual send; failed delivery retries then surfaces in-app rather than silently dropping.
FR-34: Projects summary (total/active/completed Sites, per-Site DSR-activity-based progress); empty state for a zero-Site Tenant.
FR-35: Today's activity summary across all Sites; flags any Site with no DSR yet today.
FR-36: Inventory summary (Godown/Site stock, low-stock materials against a per-Material-per-Tenant threshold, recent purchases/transfers/consumption).
FR-37: Team summary (total Team Members, today's working headcount, weekly/monthly payment totals, total outstanding Advances).
FR-38: Machinery & Vehicle summary (available/in-use counts, per-Site allocation, maintenance flags); every dashboard tile supports drill-down.
FR-39: Vendor records (name, contact, phone, email, address, materials/services supplied).
FR-40: Per-Vendor Purchase→Material→Quantity→Amount history and payment status.
FR-41: Record an Expense (date, Site, category, amount, description, payment method, person/vendor, optional document); categories admin-configurable.
FR-42: Site reports (DSR history, progress, activity history, photo history), filterable by date range.
FR-43: Inventory reports (current/Godown/Site stock, consumption, purchase, movement, wastage, low-stock).
FR-44: Labour reports (attendance, work history, payments, advance outstanding/adjustment history).
FR-45: Machinery & Vehicle reports (usage, Site movement history, maintenance/repair history).
FR-46: Financial reports (Site expenses, cost breakdowns by Material/Labour/RMC/Machinery/Vehicle).
FR-47: Company/branding configuration; a change reflects in the next generated report with no separate publish step.
FR-48: Users, Roles (Owner/Admin, Site Supervisor), and permissions within the Tenant.
FR-49: Labour/machinery/vehicle/expense-category configuration.
FR-50: Notification channel configuration (which channels receive automated reports, and to whom).
FR-51: Report configuration (templates, frequency, recipients) independent of FR-50's daily-DSR delivery.
FR-52: Tenant provisioning as a scripted deployment procedure (not an in-app action by any user role).
FR-53: Tenant-scoped everything — every feature operates within a single Tenant's boundary, true by construction under deploy-per-tenant isolation.
FR-54: Append-only transaction history for Material movement/consumption, Advances/Adjustments, Machinery/Vehicle location changes, and Payments; a correcting transaction requires a reason field.

### NonFunctional Requirements

NFR-1: Tenant isolation is absolute — no cross-tenant data path may ever exist, enforced by deployment separation (architecture AD-1), not an in-app check alone.
NFR-2: Advances, Stock, and Payments are never auto-adjusted or auto-deducted; every change requires explicit, reason-carrying user action, logged append-only.
NFR-3: No approval-chain, hierarchy, or mandatory workflow may be introduced anywhere — a simple owner-operated tool, not an enterprise ERP.
NFR-4: Every material type, size, unit, labour category, machinery/vehicle type, and expense category must be admin-configurable; none may be hardcoded.
NFR-5: DSR entry must function fully offline on a low-end phone over a 2G/3G-equivalent connection; the network is an optimization, not a dependency.
NFR-6: Platform is responsive web only for v1 — no native mobile app.
NFR-7: WCAG AA accessibility and Lighthouse >95 (Performance/Accessibility/Best Practices/SEO) are enforced in CI, not left to discretionary review.
NFR-8: The pilot contractor's payment is contingent on delivered product quality, not a fixed spec-and-price contract — completeness and correctness carry direct commercial weight.
NFR-9: Infrastructure cost is linear per Tenant under the deploy-per-tenant architecture; this must inform any future pricing model.

### Additional Requirements

- **No named starter template** — Architecture specifies a concrete stack and structural seed directly (Turborepo monorepo: `apps/web` Next.js 16.3, `apps/api` NestJS 11, `packages/ui`/`packages/shared`/`packages/config`, `infra/provisioning`/`infra/tenants`/`infra/prisma`) rather than scaffolding from a named starter. **This is Epic 1 Story 1's job**: stand up the monorepo skeleton exactly per the spine's Structural Seed, with the pinned Stack versions (AD/Stack table) — before any feature work begins.
- Deploy-per-tenant provisioning (AD-2): onboarding a Tenant is one script covering Vercel project, Neon Postgres instance + staging branch (AD-12), Clerk instance, and R2 bucket — no per-resource manual setup.
- Tenant isolation (AD-1) and the credential-level Platform Operator model (AD-11, MFA-gated) are infrastructure/ops requirements, not application features — no in-app cross-tenant surface should ever be scoped into a story.
- API-only data access (AD-3): `apps/web` never imports a DB client; all writes go through `apps/api` over HTTP.
- Design-token and component-library requirements (AD-4, AD-5): single Tailwind v4 `@theme` token source, one shadcn-pattern implementation per UI primitive in `packages/ui` — an early foundational story, not deferred.
- Full-state-set requirement (AD-6): every data-bearing screen's story needs loading/empty/success/error/validation-failure acceptance criteria, not just the happy path.
- Centralized validation (AD-7): one Zod schema per data shape in `packages/shared`, shared by API and frontend.
- Offline-first DSR (AD-8): local-first Dexie/IndexedDB queue, per-sub-record idempotency key, background sync — this is architecturally load-bearing for the DSR epic, not an enhancement.
- Append-only financial/inventory ledger with a DB-level enforcement backstop (AD-9): no `UPDATE`/`DELETE` grant on transaction-history tables for the API's DB role.
- Auth via Clerk (AD-10), no hand-rolled password/session/MFA code anywhere.
- Staging-before-production migrations via Neon branching (AD-12) — a CI/CD requirement affecting every epic that touches the schema.
- Scheduled background work via Vercel Cron inside `apps/api`, no separate worker service (AD-13) — relevant to the report-delivery epic.
- Uniform observability/backup baseline per tenant deployment (AD-14): Sentry, Vercel logs, Neon automatic backups + PITR, applied by the provisioning script.
- CI-enforced accessibility/performance budgets (AD-15): `eslint-plugin-jsx-a11y` + Lighthouse CI on every PR touching `apps/web`.

### UX Design Requirements

Extracted from the finalized `bmad-ux` spine pair (`DESIGN.md` + `EXPERIENCE.md`, both `status: final`, 2026-08-12), which also ships 20 fully wired, click-through HTML mockups covering the entire IA at `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/`.

UX-DR1: Implement the full design-token system from `DESIGN.md` as Tailwind v4 `@theme` tokens in `packages/ui` — colors (`surface-0..3`, `border-hairline/strong`, `ink-900/700/500`, `accent-teal-900/700/600/100`, `accent-navy-800/600`, `gold-700/500/100`, `success/danger/warning` at `700`+`100` weights), each with a `-dark` counterpart; typography scale (8 named roles, `eyebrow` through `kpi-numeral`); spacing scale (4px base, 10 steps); radius scale (`sm/md/lg/xl/full`). This is the concrete deliverable behind the generic AD-4 mandate below.
UX-DR2: Implement the Button component with three variants — primary, secondary, ghost — supporting icon+label composition; primary/secondary always render an icon; icon-only rendering is permitted only for the dense inline "Correct" row action.
UX-DR3: Implement the Card component with two elevation states — resting `shadow-2` and `.interactive` hover (`shadow-2-hover` + `translateY(-2px)`).
UX-DR4: Implement the Stat Tile component — meaning-tinted icon circle (teal/gold/success/danger) above a tabular KPI numeral and caption label.
UX-DR5: Implement the Data Table component with mandatory zebra striping AND hover highlight; must support a "linked row" mode (whole row wrapped as a real link — never a false-affordance `cursor:pointer` with no actual link) and a "non-link row" mode for rows with nothing to open.
UX-DR6: Implement the 5-variant Badge component (success/warning/danger/gold/neutral), pill-shaped, paired with an icon where meaning benefits from one — never color-alone status signaling.
UX-DR7: Implement the "Correct" action as a shared, reusable component — icon-only ghost button opening a new reason-carrying entry linked to the original record. Must appear on every transaction-history row across the product (Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment, Work Record, synced DSR) and must never be replaced by Edit/Delete on those rows — this is the UI-layer enforcement of FR-54/AD-9, backstopping the DB-level grant restriction.
UX-DR8: Implement the Sidebar Navigation component — icon+label items grouped under uppercase group labels (Materials / People / Assets / Insights), solid-pill active state; collapses to a minimal top-bar-only chrome (no sidebar) for the Site Supervisor's mobile context.
UX-DR9: Build the inline SVG icon system (24×24, 1.75 stroke-width, `stroke="currentColor"`) as a shared component set — no icon font, no external CDN, to preserve the offline-first/low-bandwidth budget for field users (NFR-5).
UX-DR10: Implement the Gap Flag component — warning-toned inline banner (icon + message + one primary action) — used for "Site has not submitted today's report" (Dashboard, Daily Activity) and "Material below low-stock threshold" (Inventory); must always carry a direct next action, never a bare warning badge.
UX-DR11: Implement the DSR sync-state indicator as two unambiguously distinct states — "Saved on device, will sync when back online" (warning tokens + wifi-off icon) vs. "Synced" (success tokens + check-circle icon) — required on both the mobile DSR entry flow and the desktop Daily Activity log.
UX-DR12: Implement photo capture/upload as one underlying field with two platform-appropriate input methods — camera-icon tap on mobile, drag-and-drop dropzone on desktop — both producing an additive thumbnail grid (no forced single-photo limit).
UX-DR13: Build the full information architecture as routed surfaces exactly per `EXPERIENCE.md`'s IA table: Login, Dashboard, Sites (list+detail), Daily Activity (cross-site log + desktop entry/correction form + mobile field-entry flow), Inventory, Materials, Movements, Team & Labour (list+detail), Payments, Machinery & Vehicles, Vendors (list+detail), RMC, Expenses, Reports, Settings (Branding/Users & Roles/Categories) — sidebar-grouped, not a flat unordered nav.
UX-DR14: Implement full per-screen state-set coverage per `EXPERIENCE.md`'s State Patterns table: loading (skeleton matching eventual layout), empty (icon + sentence + one primary action), success (inline confirmation, return to origin — never a modal for routine actions), validation failure (inline per-field, mirroring the shared Zod schema), offline/pending-sync, no-permission (hidden from nav, not a visible-blocked screen), network/API failure (plain-language retry, never a raw error). This is the concrete deliverable behind the generic AD-6 mandate below.
UX-DR15: Implement the Correction Banner pattern on the Daily Activity desktop entry form — explains that the same form both creates new entries and files corrections, prepending a reason-field requirement when correcting, linked back to the original entry.
UX-DR16: Enforce click/tap-first interaction design — no keyboard-shortcut layer; full-row tap targets on every linked list, not small icon-only hit targets.
UX-DR17: Implement reason-field-not-confirmation-dialog as the universal pattern for consequential actions (Advance Adjustment, any Correction) — a short required reason input, never an "Are you sure?" modal.
UX-DR18: Implement smart defaults across entry forms — DSR crew checklist pre-populated from the previous day's attendance at that Site; material/machinery pickers as search/dropdown/chip-add, never free-text — serving the <5-minute DSR completion target (SM-2) without sacrificing accuracy (SM-C1).
UX-DR19: Enforce the interaction ban list at the component level: no infinite scroll (pagination only), no Edit/Delete affordance anywhere on transaction-history rows, no manual "Send Report" action anywhere (delivery is fully automatic per AD-13 — UI only ever shows delivery status), no decorative/celebratory animation.
UX-DR20: Meet the Accessibility Floor as implementation-level detail beyond generic WCAG AA: no status conveyed by color alone, full-row/generous touch targets sized for on-site use, visible focus rings using the `accent-teal-100` token, programmatically-associated inline validation errors, outdoor-glare-readable contrast on the mobile DSR flow specifically.
UX-DR21: Implement responsive breakpoint behavior per `EXPERIENCE.md`'s Responsive & Platform table: desktop/laptop full sidebar + 1240px-capped content; mobile (Site Supervisor) no sidebar, single-column, full-width fields; Owner-on-mobile gets a responsive fallback of the desktop screens, not forced into the Supervisor's DSR-only flow. **Open item, not yet decided:** tablet-specific breakpoint behavior — flag for a design decision before an epic touching it can be marked done.

### FR Coverage Map

FR-1: Epic 2 - Create/maintain Sites
FR-2: Epic 2 - Individual Site chronological view
FR-3: Epic 2 - Consolidated contractor-wide rollup
FR-4: Epic 4 - Material Categories/Materials CRUD
FR-5: Epic 4 - Sizes/Specifications per Material
FR-6: Epic 4 - Units of Measure
FR-7: Epic 4 - Custom Fields per Material
FR-8: Epic 5 - Record Purchase (Godown or Site destination)
FR-9: Epic 5 - Godown→Site Movement
FR-10: Epic 5 - Direct Vendor→Site purchase
FR-11: Epic 5 - Site→Site transfer
FR-12: Epic 5 - Record Consumption
FR-13: Epic 5 - Record Wastage/Return
FR-14: Epic 5 - Full stock lifecycle visibility
FR-15: Epic 8 - Machinery register
FR-16: Epic 8 - Vehicle register
FR-17: Epic 8 - Machinery/Vehicle movement history
FR-18: Epic 8 - Fuel/maintenance/repair logging
FR-19: Epic 6 - Team Member records
FR-20: Epic 6 - Daily Work Record
FR-21: Epic 6 - Work history by Team Member/Site
FR-22: Epic 7 - Record Advance
FR-23: Epic 7 - Record Advance Adjustment
FR-24: Epic 7 - Record Payment
FR-25: Epic 7 - Outstanding-advance visibility
FR-26: Epic 10 - Record RMC delivery
FR-27: Epic 10 - RMC reporting
FR-28: Epic 3 - One DSR per Site per date
FR-29: Epic 3 - Offline DSR entry and sync
FR-30: Epic 3 - Multi-photo DSR attachment
FR-31: Epic 3 - Chronological Site photo gallery
FR-32: Epic 13 - Auto-compile branded daily report
FR-33: Epic 13 - Automated delivery, failure surfaced
FR-34: Epic 12 - Projects/Sites summary
FR-35: Epic 12 - Today's activity summary + missing-DSR flag
FR-36: Epic 5 - Inventory summary (part of stock visibility)
FR-37: Epic 6 - Team summary
FR-38: Epic 8 - Machinery & Vehicle summary
FR-39: Epic 9 - Vendor records
FR-40: Epic 9 - Vendor Purchase history
FR-41: Epic 11 - Record Expense
FR-42: Epic 13 - Site reports
FR-43: Epic 13 - Inventory reports
FR-44: Epic 13 - Labour reports
FR-45: Epic 13 - Machinery & Vehicle reports
FR-46: Epic 13 - Financial reports
FR-47: Epic 14 - Branding configuration
FR-48: Epic 14 - Users, Roles & permissions
FR-49: Epic 14 - Labour/machinery/vehicle/expense category config
FR-50: Epic 14 - Notification channel config
FR-51: Epic 14 - Report configuration
FR-52: Not an epic - infra/ops (scripted Tenant provisioning, AD-2)
FR-53: Not an epic - true by construction (deploy-per-tenant isolation, AD-1)
FR-54: Cross-cutting - enforced in Epic 3, Epic 5, Epic 7 via the shared Correct component (Epic 1)

All 54 FRs mapped — none missed.

## Epic List

**Organized in 7 delivery phases** (per owner request — epics and, later, stories are also written to phase-organized folders alongside this tracking document; see note below the list).

**Note on current implementation state (checked against the working tree, not assumed):** the monorepo scaffold already exists — `apps/web` (Next.js), `apps/api` (NestJS), `packages/ui`/`shared`/`config`, `infra/prisma/schema.prisma` (499 lines), `infra/provisioning/provision.ts` — and a Sites module has a partial start (`create`/`list` endpoints, Zod-validated, no frontend, no update/detail endpoints). No commits exist yet. Epic 1 and Epic 2 below are scoped as "finish and validate," not "build from zero."

### Phase 1 — Foundation

### Epic 1: Platform Foundation, Auth & Design System
Owner/Admin and Site Supervisor can sign in to a running, correctly-branded application shell — sidebar navigation, the full design-token system, and the core reusable component library (Button, Card, Stat Tile, Data Table, Badge, the Correct-action pattern, icon system, Gap Flag) all render exactly per `DESIGN.md`/`EXPERIENCE.md`, ready for every later epic to build on without re-deriving visual or interaction rules.
**FRs covered:** (none directly — foundation for all; also carries NFR-6, NFR-7 and Additional Requirements AD-4, AD-5, AD-6, AD-7, AD-10, AD-15, UX-DR1–9, UX-DR13, UX-DR20)

### Phase 2 — Field Operations Core

### Epic 2: Site Management
Owner/Admin creates and maintains Sites and sees each Site's full chronological activity feed; the contractor-wide rollup lists every Site automatically as they're added.
**FRs covered:** FR-1, FR-2, FR-3

### Epic 3: Daily Site Reporting (DSR)
Site Supervisor completes and submits a Daily Site Report from a phone in under 5 minutes, fully offline, with automatic background sync; Owner/Admin reviews every report from a desktop log, creates or corrects an entry from the web, and never loses data to a dropped connection.
**FRs covered:** FR-28, FR-29, FR-30, FR-31, FR-54 (as it applies to synced DSR corrections)

### Phase 3 — Materials & Inventory

### Epic 4: Material Catalog Configuration
Owner/Admin defines Material Categories, Materials, Sizes/Specifications, Units, and Custom Fields — every later inventory transaction draws from this catalog instead of free text.
**FRs covered:** FR-4, FR-5, FR-6, FR-7

### Epic 5: Inventory Transactions & Stock Visibility
Owner/Admin and Site Supervisor record Purchases, Godown↔Site and Site↔Site Movements, Consumption, and Wastage/Return; Godown and Site-wise stock levels are always correct and derived from history, with low-stock flagged automatically and every correction handled via the append-only Correct pattern.
**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-36, FR-54 (as it applies to inventory transactions)

### Phase 4 — People & Money

### Epic 6: Team & Labour Management
Owner/Admin maintains Team Member records and records daily Work Records/attendance per Site, with a Team Member's full work history queryable either way.
**FRs covered:** FR-19, FR-20, FR-21, FR-37

### Epic 7: Advances & Payments
Owner/Admin records Advances and Advance Adjustments against a Team Member's running Outstanding Balance and records Payments (Base + Additional − Deductions − Adjustment = Net Payable), with full history retained and every correction append-only.
**FRs covered:** FR-22, FR-23, FR-24, FR-25, FR-54 (as it applies to Advances/Payments)

### Phase 5 — Assets & Suppliers

### Epic 8: Machinery & Vehicle Management
Owner/Admin maintains Machinery and Vehicle registers, records movement between Sites/Maintenance, and logs fuel/maintenance/repair history — current location and full lifecycle are always visible.
**FRs covered:** FR-15, FR-16, FR-17, FR-18, FR-38

### Epic 9: Vendors
Owner/Admin maintains Vendor records and sees each Vendor's full Purchase history and payment status in one place.
**FRs covered:** FR-39, FR-40

### Epic 10: RMC (Ready-Mix Concrete)
Owner/Admin records RMC deliveries per Site and Vendor, with daily/Site-wise/Vendor-wise reporting reconciling exactly to individual entries.
**FRs covered:** FR-26, FR-27

### Epic 11: Expenses
Owner/Admin and Site Supervisor record Expenses against admin-configurable categories, tagged to a Site, immutable once logged.
**FRs covered:** FR-41

### Phase 6 — Insight & Delivery

### Epic 12: Dashboard & Cross-Site Rollup
Owner/Admin opens the Dashboard and immediately sees the full story — Today's Activity, Overall status, and an explicit gap-flag for any Site that hasn't reported yet today — with every tile drilling down into the real screen behind it. Placed last among feature epics deliberately: its promised value (real drill-downs, real gap detection) depends on Sites, DSR, Inventory, Team, and Machinery/Vehicles already existing.
**FRs covered:** FR-34, FR-35

### Epic 13: Reports & Auto-Delivery
Owner/Admin sees Site, Inventory, Labour, and Financial reports, filterable and Tenant-scoped; each day's branded report auto-compiles from that day's DSR and delivers automatically via WhatsApp/Email with no manual send step, retrying and surfacing failure rather than silently dropping.
**FRs covered:** FR-32, FR-33, FR-42, FR-43, FR-44, FR-45, FR-46

### Phase 7 — Administration

### Epic 14: Tenant Configuration & Settings
Owner/Admin configures company branding (reflected in the next generated report immediately), manages Users & Roles within the Tenant, and configures labour/machinery/vehicle/expense categories and notification/report delivery settings — all admin-configurable, none hardcoded.
**FRs covered:** FR-47, FR-48, FR-49, FR-50, FR-51

---

**Deliberately not epics:**
- **FR-52** (scripted Tenant provisioning) and **FR-53** (Tenant-scoped-by-construction) are infra/ops requirements per AD-1/AD-2/AD-11 — no in-app story should ever scope a cross-tenant surface.
- **FR-54** (append-only correction) is cross-cutting, not a standalone epic — it's a recurring acceptance-criteria requirement threaded through Epic 3 (DSR), Epic 5 (Inventory), and Epic 7 (Advances/Payments) wherever a transaction-history table appears, enforced via the shared "Correct" component from Epic 1.

---

## Epic 1: Platform Foundation, Auth & Design System

Owner/Admin and Site Supervisor can sign in to a running, correctly-branded application shell — sidebar navigation, the full design-token system, and the core reusable component library (Button, Card, Stat Tile, Data Table, Badge, the Correct-action pattern, icon system, Gap Flag) all render exactly per `DESIGN.md`/`EXPERIENCE.md`, ready for every later epic to build on without re-deriving visual or interaction rules.

### Story 1.1: Design Token Foundation

As the implementer of any future screen,
I want the finalized `DESIGN.md` token system (colors light+dark, typography, spacing, radius) implemented as Tailwind v4 `@theme` tokens in `packages/ui`,
So that every component renders the approved visual identity from one source, with no scattered hex/px literals.

**Acceptance Criteria:**

**Given** the `DESIGN.md` token frontmatter as source of truth
**When** `theme.css` is updated in `packages/ui`
**Then** every named token (colors incl. `-dark` variants, typography roles, spacing scale, radius scale) exists as a CSS custom property consumable via Tailwind v4 `@theme`
**And** no component in `packages/ui` contains a raw hex/px/rgba literal (AD-4)
**And** toggling a `dark` scope class switches every color token to its dark counterpart without per-component logic

### Story 1.2: Core Component Library — Button, Card, Badge

As a developer building any future screen,
I want the Button (primary/secondary/ghost), Card (resting + interactive-hover), and Badge (5 semantic variants) components implemented once in `packages/ui`,
So that every screen reuses the same primitive instead of re-implementing it (AD-5).

**Acceptance Criteria:**

**Given** the `DESIGN.md` Components spec
**When** Button, Card, and Badge are implemented in `packages/ui`
**Then** Button supports primary/secondary/ghost variants with mandatory icon+label composition (icon-only only via an explicit prop for dense row actions)
**And** Card supports a resting `shadow-2` state and an `interactive` prop producing `shadow-2-hover` + lift on hover
**And** Badge supports all 5 semantic variants and optionally pairs with an icon
**And** all three components pass a visual check against `DESIGN.md` token values

### Story 1.3: Core Component Library — Data Table, Stat Tile, Gap Flag, Correct Action

As a developer building any future list/detail screen,
I want the Data Table (zebra+hover, linked-row and non-link-row modes), Stat Tile, Gap Flag, and the "Correct" action component implemented once in `packages/ui`,
So that every transaction/list screen across the product behaves identically.

**Acceptance Criteria:**

**Given** the `DESIGN.md` Components spec and `EXPERIENCE.md` Component Patterns table
**When** Data Table, Stat Tile, Gap Flag, and CorrectAction are implemented in `packages/ui`
**Then** Data Table renders zebra-striped rows with a hover highlight, and supports a linked-row mode (whole row is a real link) vs. a non-link-row mode with no false-affordance cursor
**And** Stat Tile renders a meaning-tinted icon, tabular KPI numeral, and caption label
**And** Gap Flag renders an icon + message + one primary action, never a bare warning with no next step
**And** CorrectAction renders as an icon-only ghost button that, when wired by a consuming screen, opens a reason-required entry linked to the original record — never an Edit/Delete affordance

### Story 1.4: Inline Icon System

As a developer,
I want the finalized inline SVG icon set (24×24, 1.75 stroke, `stroke=currentColor`) available as importable components in `packages/ui`,
So that no screen needs to load an icon font or hit an external CDN, preserving the low-bandwidth budget for field users (NFR-5).

**Acceptance Criteria:**

**Given** the icon set documented in the UX shared kit
**When** icons are extracted into `packages/ui` as individual components
**Then** every icon renders inline with no network request
**And** icon color inherits from its container via `currentColor` without per-instance overrides

### Story 1.5: Sign In

As an Owner/Admin or Site Supervisor,
I want to sign in with my Tenant-issued credentials,
So that I can access AzentisFieldOS as myself, scoped to my Tenant.

**Acceptance Criteria:**

**Given** a valid Clerk-issued account for this Tenant
**When** I submit my credentials on the Sign In screen
**Then** I land on the application shell, authenticated, with no tenant-selection step (single-tenant by construction, AD-1)
**And** an invalid credential attempt shows an inline, actionable error — never a raw auth-provider error
**And** no hand-rolled password/session/MFA code exists anywhere in the implementation (AD-10)

### Story 1.6: Application Shell & Navigation

As an authenticated Owner/Admin,
I want a persistent sidebar grouped into Materials / People / Assets / Insights (plus Dashboard, Sites, Daily Activity, and Settings),
So that I can navigate to every part of the product without hunting for it.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I view any desktop screen
**Then** the sidebar renders all 15 routed surfaces from `EXPERIENCE.md`'s Information Architecture table, grouped exactly as specified
**And** the current section shows an unambiguous active state (solid pill, not just a color change)
**And** on the Site Supervisor's mobile context, no sidebar renders — only the minimal top bar per `EXPERIENCE.md`'s Responsive & Platform rules
**And** every route without a real screen yet renders a real empty-state placeholder using the shared component, never a 404 or blank page

### Story 1.7: Accessibility & Performance CI Gate

As the Development Team,
I want `eslint-plugin-jsx-a11y` and Lighthouse CI wired into every PR touching `apps/web`,
So that WCAG AA and the >95 Lighthouse budgets (AD-15) are enforced automatically, not left to discretionary review.

**Acceptance Criteria:**

**Given** a PR that modifies any file under `apps/web`
**When** CI runs
**Then** `eslint-plugin-jsx-a11y` errors block merge
**And** a Lighthouse CI run reports Performance/Accessibility/Best Practices/SEO scores, failing the check if any drops below 95
**And** this gate is documented in `AGENTS.md`'s Running and verifying section, replacing the current TODO placeholder

---

## Epic 2: Site Management

Owner/Admin creates and maintains Sites and sees each Site's full chronological activity feed; the contractor-wide rollup lists every Site automatically as they're added.

### Story 2.1: Create and List Sites

As Owner/Admin,
I want to create a Site (name, location, status, contract reference) and see it in a list with every other Site,
So that I can start tracking a new project immediately and always see my full portfolio in one place.

**Acceptance Criteria:**

**Given** I fill in a Site's name, location, status, and contract reference
**When** I submit the Create Site form
**Then** the Site is saved and appears immediately at the top of the Sites list, no refresh required
**And** the Sites list always reflects every Site that exists, automatically including newly created ones (FR-3)
**And** submitting with a missing required field shows inline validation matching the shared Zod schema, not a generic error
**And** the empty state (zero Sites) shows a clear "create your first Site" prompt, never a blank table

### Story 2.2: Update Site Details & Status Transitions

As Owner/Admin,
I want to edit a Site's details and change its status between Active, On Hold, and Completed,
So that the Sites list always reflects reality.

**Acceptance Criteria:**

**Given** an existing Site
**When** I update its name, location, contract reference, or status
**Then** the change saves and is reflected immediately in the Sites list
**And** each status change is timestamped
**And** this uses a normal Edit affordance — Site master data is not transaction history, so AD-9's Correct pattern does not apply here

### Story 2.3: View Site Detail — Chronological Activity Feed

As Owner/Admin,
I want to open a Site and see every DSR, stock movement, Work Record, expense, RMC entry, and photo tagged to it, in chronological order,
So that I understand what's actually happened at that Site without hunting across screens.

**Acceptance Criteria:**

**Given** a Site with zero linked records
**When** I open its detail view
**Then** I see a clear empty state explaining no activity has been logged yet — not a blank feed
**Given** a Site with linked records from any combination of DSR, Movement, Work Record, Expense, RMC, or photo sources
**When** I open its detail view
**Then** every record appears in a single chronological feed, newest first, each tagged with its record type
**And** this view degrades gracefully as later epics (DSR, Inventory, Team, Expenses, RMC) ship — it reads from whatever record types exist without requiring all of them to be built first

---

## Epic 3: Daily Site Reporting (DSR)

Site Supervisor completes and submits a Daily Site Report from a phone in under 5 minutes, fully offline, with automatic background sync; Owner/Admin reviews every report from a desktop log, creates or corrects an entry from the web, and never loses data to a dropped connection.

### Story 3.1: Submit a Daily Site Report (Mobile)

As a Site Supervisor,
I want to fill in work completed, crew present (defaulted from yesterday), materials consumed, RMC used, and photos on my phone and submit,
So that I can log a full day's activity in under 5 minutes without re-typing what didn't change (SM-2).

**Acceptance Criteria:**

**Given** I open the DSR entry flow for my Site today
**When** the form loads
**Then** the crew checklist is pre-populated from yesterday's attendance at this Site, and material/machinery pickers are search/dropdown/chip-add, never free-text (SM-C1: accuracy is never traded for speed)
**When** I submit with work completed, crew, at least one material or RMC entry, and photos
**Then** the DSR is created as one record, and submitting a second DSR for the same Site/date before the first syncs is treated as an edit to the queued entry, not a duplicate (FR-28)
**And** a Team Member cannot appear present at two different Sites on the same date — this is enforced, not just assumed

### Story 3.2: Offline Queueing & Background Sync

As a Site Supervisor working with patchy or no signal,
I want my submitted DSR to save on my device immediately and sync automatically once I'm back online,
So that I never lose a report to a dropped connection.

**Acceptance Criteria:**

**Given** I submit a DSR while offline
**When** the submission completes
**Then** I see "Saved on device — will sync when back online" (warning tokens + wifi-off icon), unambiguously distinct from a synced state
**Given** connectivity returns
**When** the app detects it
**Then** the queued DSR syncs automatically and silently, with no re-entry required, using a per-sub-record idempotency key so a retried sync never creates duplicates
**And** if two devices submitted conflicting sub-records for the same DSR, the last-synced write wins per sub-record (FR-29) — not per whole-DSR

### Story 3.3: Chronological Site Photo Gallery

As Owner/Admin,
I want to see every photo from every DSR at a Site in one chronological gallery,
So that I can review site progress visually without opening each report individually.

**Acceptance Criteria:**

**Given** a Site with DSRs that include photos
**When** I open its photo gallery
**Then** every photo appears newest-first, each auto-tagged with the Site/date/DSR/uploader it came from
**And** a Site with no photos yet shows a clear empty state, not a blank grid

### Story 3.4: Desktop Daily Activity Log & Report Detail

As Owner/Admin,
I want a desktop log of every Site's Daily Site Reports, showing who has and hasn't reported today, with a full read view of any report's detail,
So that I can review field activity across all Sites without opening each Site individually.

**Acceptance Criteria:**

**Given** DSRs have been submitted for some Sites today and not others
**When** I open the Daily Activity log
**Then** each Site shows its sync status (Synced / Pending sync / Not submitted) as a distinct, unambiguous state, and a Site with no report today is never a silent blank row
**When** I open a specific report
**Then** I see its full detail — work completed, crew, materials, RMC, machinery, expenses, a flagged issue if any, and the photo grid
**And** every table row that has a report links to it as a real destination; a row with nothing to open carries no link and no false pointer-cursor affordance (the bug caught during UX review)

### Story 3.5: Desktop Daily Activity Entry & Correction

As Owner/Admin,
I want to create a new Daily Activity entry or file a correction on an already-synced one from my desktop,
So that I'm not limited to the mobile flow, and mistakes get fixed the right way — a new linked entry, not a silent edit.

**Acceptance Criteria:**

**Given** I open "New Daily Activity" from the desktop log
**When** I fill in and submit the same fields as the mobile flow (Site, date, work, crew, materials, RMC, machinery, expenses/issues, photos)
**Then** a new DSR is created exactly as if submitted from the field
**Given** I click "Correct" on an already-synced report
**When** the entry form opens
**Then** a correction banner explains this creates a new linked entry, a reason field is required, and the original report is never edited or deleted (AD-9, FR-54)
**And** the desktop photo field is a drag-drop dropzone (vs. mobile's camera tap) — same underlying field, platform-appropriate input

---

## Epic 4: Material Catalog Configuration

Owner/Admin defines Material Categories, Materials, Sizes/Specifications, Units, and Custom Fields — every later inventory transaction draws from this catalog instead of free text.

### Story 4.1: Manage Material Categories & Materials

As Owner/Admin,
I want to add, edit, and disable Material Categories and Materials,
So that my catalog reflects what I actually stock, without losing history when something is discontinued.

**Acceptance Criteria:**

**Given** I create a Category and add Materials to it
**When** I save
**Then** the Category and Materials are immediately available in every Material picker across the product
**Given** a Material I disable
**When** I view existing Purchases/Movements/Consumption that reference it
**Then** that history is untouched and still displays correctly — disabling only hides it from new-entry pickers (FR-4)

### Story 4.2: Manage Sizes/Specifications & Units per Material

As Owner/Admin,
I want to define Sizes/Specifications and a Unit of Measure per Material,
So that every transaction against that Material uses consistent, correct units and options.

**Acceptance Criteria:**

**Given** a Material (e.g. "RCC Pipe")
**When** I add Sizes/Specifications (e.g. 300mm, 450mm, 600mm, 900mm)
**Then** each Size is immediately selectable wherever that Material is picked, and adding a new Size later doesn't disturb existing Stock records tied to prior Sizes
**And** a Material's Unit is enforced consistently — every transaction type referencing it uses the same Unit, never a mismatched one

### Story 4.3: Add Custom Fields to a Material

As Owner/Admin,
I want to add Custom Fields to a Material definition,
So that I can capture Tenant-specific attributes without needing a schema change.

**Acceptance Criteria:**

**Given** a Material
**When** I add a Custom Field (label + value type)
**Then** it's stored in the Material's `customFields` JSONB column, with no per-tenant database migration required
**And** the Custom Field appears on that Material's entry forms going forward

---

## Epic 5: Inventory Transactions & Stock Visibility

Owner/Admin and Site Supervisor record Purchases, Godown↔Site and Site↔Site Movements, Consumption, and Wastage/Return; Godown and Site-wise stock levels are always correct and derived from history, with low-stock flagged automatically and every correction handled via the append-only Correct pattern.

### Story 5.1: Record a Purchase

As Owner/Admin,
I want to record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle, notes, destination Godown-or-Site, optional documents),
So that stock and spend are tracked from the moment material enters the business.

**Acceptance Criteria:**

**Given** I record a Purchase with Godown as the destination
**When** I submit
**Then** Godown Stock for that Material/Size increases by the purchased quantity immediately
**Given** I record a Purchase with a Site as the destination
**When** I submit
**Then** that Site's Stock increases directly, bypassing Godown Stock entirely (FR-8)
**And** the row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete (AD-9)

### Story 5.2: Record Godown→Site Movement

As Owner/Admin,
I want to record a Movement of Material from Godown to a Site, capturing both sent and received quantity,
So that any shortage or damage in transit is visible as its own value, not silently absorbed.

**Acceptance Criteria:**

**Given** I record a Movement (Material/Size/quantity, vehicle, person responsible)
**When** I submit
**Then** Godown Stock decreases by the sent quantity at recording time
**When** the receiving Site confirms receipt with a received quantity
**Then** Site Stock increases by the received quantity, and any gap between sent and received is captured as a visible, distinct value (FR-9) — never hidden or auto-reconciled
**And** the row's "Correct" action is available, never Edit/Delete

### Story 5.3: Record Direct Vendor→Site Purchase

As Owner/Admin,
I want to record a Purchase that goes directly from a Vendor to a Site, bypassing the Godown,
So that Site-delivered material is tracked without a false Godown Stock detour.

**Acceptance Criteria:**

**Given** I record a direct Vendor→Site Purchase with the same field set as a standard Purchase plus a receiver
**When** I submit
**Then** the destination Site's Stock increases directly, and Godown Stock is never touched by this transaction (FR-10)

### Story 5.4: Record Site→Site Transfer

As Owner/Admin,
I want to record a Material transfer from one Site directly to another,
So that Site Stock stays accurate when material moves between active jobsites without passing through the Godown.

**Acceptance Criteria:**

**Given** I record a Site→Site transfer (vehicle, person responsible, notes, received quantity)
**When** I submit
**Then** the sending Site's Stock decreases and the receiving Site's Stock increases on confirmed receipt, with the same shortage/damage-gap capture discipline as Story 5.2 (FR-11)

### Story 5.5: Record Consumption

As Site Supervisor or Owner/Admin,
I want to record Material Consumption at a Site against an activity reference,
So that Site Stock reflects what's actually been used, comparable against what was received.

**Acceptance Criteria:**

**Given** a Site with available Stock for a Material
**When** I record Consumption (date, material, size/spec, quantity, unit, activity reference, notes)
**Then** Site Stock for that Material/Size decreases by the consumed quantity, and the entry is comparable against total received to compute variance (FR-12)

### Story 5.6: Record Wastage/Return

As Owner/Admin or Site Supervisor,
I want to record Wastage or a Return as its own transaction type, distinct from Consumption,
So that material lost to waste is never miscounted as material actually used in the work.

**Acceptance Criteria:**

**Given** a Site with Stock for a Material
**When** I record a Wastage/Return entry
**Then** it's stored as a distinct transaction type from Consumption (FR-13), and Stock adjusts accordingly with a visible reason

### Story 5.7: Stock Lifecycle Visibility & Low-Stock Flagging

As Owner/Admin,
I want full stock visibility per Material/Size/Site/Godown, always derived from transaction history, with low-stock flagged automatically against a configured threshold,
So that I catch a shortage before it stalls work, not after.

**Acceptance Criteria:**

**Given** any combination of Purchase/Movement/Consumption/Wastage entries for a Material
**When** I view its stock lifecycle
**Then** the displayed quantity always reconciles exactly to the sum of its transaction history — never a manually-editable "current stock" field (FR-14)
**Given** a Material's stock falls below its configured per-Material threshold
**When** I view Inventory
**Then** a Gap Flag names the exact Material and threshold, with a direct "Transfer Stock" action, never a bare warning badge (FR-36)

---

## Epic 6: Team & Labour Management

Owner/Admin maintains Team Member records and records daily Work Records/attendance per Site, with a Team Member's full work history queryable either way.

### Story 6.1: Manage Team Members

As Owner/Admin,
I want to create and maintain Team Member records (name, role/designation, contact, employment/payment type),
So that I have one accurate roster, never bound to a single Site.

**Acceptance Criteria:**

**Given** I create a Team Member with a name, role, contact, and employment type (monthly/weekly/daily-wage)
**When** I save
**Then** the Team Member is immediately available in every Work Record, Advance, and Payment picker across the product
**And** a Team Member is never permanently bound to one Site — their assignment comes only from actual Work Records (FR-19)
**And** employment-type categories are admin-configurable data, not a hardcoded enum (NFR-4) — Epic 14 later adds the admin UI to manage them

### Story 6.2: Record Daily Work Record / Attendance

As Site Supervisor or Owner/Admin,
I want to record which Team Members were present at a Site on a given date, with attendance, hours, and overtime,
So that labour presence is tracked accurately per Site per day.

**Acceptance Criteria:**

**Given** a Team Member already has a Work Record at Site A for a given date
**When** I try to record a Work Record for that same Team Member at Site B on the same date
**Then** the second entry is rejected — a Team Member cannot have two Work Records at two different Sites on the same date (FR-20)
**And** the attendance entry defaults from the previous day's crew at that Site for faster entry

### Story 6.3: Work History & Team Summary

As Owner/Admin,
I want to view a Team Member's full work history by Team Member or by Site, and see a summary of today's working headcount and totals,
So that I can answer "who worked where, and how much" without cross-referencing multiple screens.

**Acceptance Criteria:**

**Given** Work Records exist across multiple Sites and dates
**When** I query by Team Member
**Then** I see every Work Record for that person, chronologically, across all Sites (FR-21)
**When** I query by Site
**Then** I see every Team Member who worked there, by date
**And** the Team summary shows total Team Members, today's working headcount, and weekly/monthly payment totals — the latter populated once Epic 7 (Advances & Payments) exists, showing zero/empty gracefully until then (FR-37)

---

## Epic 7: Advances & Payments

Owner/Admin records Advances and Advance Adjustments against a Team Member's running Outstanding Balance and records Payments (Base + Additional − Deductions − Adjustment = Net Payable), with full history retained and every correction append-only.

### Story 7.1: Record an Advance

As Owner/Admin,
I want to record an Advance to a Team Member (amount, date, reason, payment method),
So that the money given is tracked immediately, with no approval step slowing down a same-day need.

**Acceptance Criteria:**

**Given** a Team Member
**When** I record an Advance
**Then** their Outstanding Balance updates immediately — no approval gate, no workflow (FR-22, NFR-3)
**And** the row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete (AD-9)

### Story 7.2: Record an Advance Adjustment

As Owner/Admin,
I want to record an Advance Adjustment against a Team Member's Outstanding Balance, capped at the current balance,
So that repayments reduce what's owed accurately, and I can never accidentally push a balance negative.

**Acceptance Criteria:**

**Given** a Team Member with an Outstanding Balance of ₹8,000
**When** I attempt an Adjustment of ₹9,000
**Then** the submission is rejected with inline helper text stating the ₹8,000 cap — not a rejected-form surprise after submission (FR-23)
**Given** a valid Adjustment within the balance
**When** I submit it, optionally linked to a Payment
**Then** the Outstanding Balance decreases by exactly that amount, logged, timestamped, and attributed

### Story 7.3: Record a Payment

As Owner/Admin,
I want to record a Payment (Base Pay + Additional − Actual Deductions − Advance Adjustment = Net Payable),
So that what a Team Member is actually paid is calculated correctly and kept as permanent history.

**Acceptance Criteria:**

**Given** Base Pay, Additional, Deductions, and an optional Advance Adjustment
**When** I record a Payment
**Then** Net Payable computes automatically as Base + Additional − Deductions − Adjustment, and the full breakdown is retained, never overwritten (FR-24)
**And** the row's "Correct" action is available, never Edit/Delete

### Story 7.4: Outstanding Advance Visibility

As Owner/Admin,
I want to see total Outstanding Advances at a glance, drillable per Team Member,
So that I always know how much is owed back to the business without adding it up manually.

**Acceptance Criteria:**

**Given** Advances and Adjustments exist across multiple Team Members
**When** I view the Outstanding Advances summary
**Then** the total reconciles exactly to the sum of individual Team Members' balances (FR-25)
**And** clicking through from the summary opens the specific Team Member's Advance ledger

---

## Epic 8: Machinery & Vehicle Management

Owner/Admin maintains Machinery and Vehicle registers, records movement between Sites/Maintenance, and logs fuel/maintenance/repair history — current location and full lifecycle are always visible.

### Story 8.1: Manage Machinery & Vehicle Registers

As Owner/Admin,
I want to register Machinery (name, type, asset number, model, ownership, operator) and Vehicles (number, type, ownership, driver),
So that I have one accurate list of every asset the business uses.

**Acceptance Criteria:**

**Given** I register a Machine or Vehicle
**When** I save
**Then** it's immediately available in movement, fuel/maintenance log, and reporting pickers (FR-15, FR-16)
**And** Machinery/Vehicle type categories are admin-configurable data, not a hardcoded enum (NFR-4) — Epic 14 later adds the admin UI to manage them

### Story 8.2: Record Movement Between Sites/Maintenance

As Owner/Admin,
I want to record a Machine or Vehicle's movement — Available → Site A → Site B → Maintenance → Available — with full history retained,
So that I always know where an asset is now and where it's been.

**Acceptance Criteria:**

**Given** a Machine/Vehicle's current recorded location
**When** I record a movement to a new Site or to Maintenance
**Then** its "current Site" updates immediately, and every prior movement remains visible in its history — never overwritten to show only the latest state (FR-17, FR-38)
**And** "current Site" is a manually recorded value — no GPS or live tracking is implied anywhere in the UI

### Story 8.3: Log Fuel/Maintenance/Repair History

As Owner/Admin,
I want to log fuel, maintenance, and repair entries per Machine/Vehicle,
So that I can retrieve a dated service history for any asset when I need it.

**Acceptance Criteria:**

**Given** a Machine or Vehicle
**When** I log a fuel, maintenance, or repair entry with a date
**Then** it appears in that asset's dated service history, retrievable in full at any time (FR-18)

---

## Epic 9: Vendors

Owner/Admin maintains Vendor records and sees each Vendor's full Purchase history and payment status in one place.

### Story 9.1: Manage Vendor Records

As Owner/Admin,
I want to create and maintain Vendor records (name, contact person, phone, email, address, materials/services supplied),
So that I have one accurate list of who I buy from.

**Acceptance Criteria:**

**Given** I create a Vendor with contact and supplied materials/services
**When** I save
**Then** the Vendor is immediately available in every Purchase/RMC picker across the product (FR-39)
**And** this uses a normal Edit affordance — Vendor master data is not transaction history

### Story 9.2: View Vendor Purchase History

As Owner/Admin,
I want to see a Vendor's full Purchase→Material→Quantity→Amount history and payment status in one place,
So that I know exactly what I've bought from them and what I owe.

**Acceptance Criteria:**

**Given** a Vendor with Purchases recorded against them (from Epic 5)
**When** I open their detail page
**Then** I see every Purchase chronologically with Material, Quantity, Amount, Invoice/Challan #, and Payment status (FR-40)
**And** a Vendor with no Purchases yet shows a clear empty state, not a blank table

---

## Epic 10: RMC (Ready-Mix Concrete)

Owner/Admin records RMC deliveries per Site and Vendor, with daily/Site-wise/Vendor-wise reporting reconciling exactly to individual entries.

### Story 10.1: Record RMC Delivery

As Owner/Admin,
I want to record an RMC delivery (Vendor, date, quantity m³, grade/type, rate/m³, total, invoice/challan),
So that concrete usage is tracked as its own category, separate from general Material inventory.

**Acceptance Criteria:**

**Given** an RMC delivery to a Site
**When** I record it
**Then** it's stored as its own entity, not merged into the Material Catalog or Inventory Transactions data model (FR-26)
**And** it's queryable by day, Site, or Vendor
**And** the row's "Correct" action is available, never Edit/Delete

### Story 10.2: RMC Reporting

As Owner/Admin,
I want daily, Site-wise, and Vendor-wise RMC consumption/cost reporting,
So that I can see how much concrete was used and at what cost, sliced the way I need it.

**Acceptance Criteria:**

**Given** RMC delivery entries across multiple Sites, Vendors, and dates
**When** I view RMC reporting
**Then** daily, Site-wise, and Vendor-wise totals reconcile exactly to the sum of individual entries (FR-27)

---

## Epic 11: Expenses

Owner/Admin and Site Supervisor record Expenses against admin-configurable categories, tagged to a Site, immutable once logged.

### Story 11.1: Record an Expense

As Owner/Admin or Site Supervisor,
I want to record an Expense (date, Site, category, amount, description, payment method, person/vendor, optional document),
So that every Site cost is captured as it happens, categorized consistently.

**Acceptance Criteria:**

**Given** an Expense category list seeded with defaults (material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, misc) — modeled as admin-configurable data, not a hardcoded enum (NFR-4)
**When** I record an Expense against a Site and category
**Then** it's saved as permanent history, tagged to that Site, immediately reflected in Site and Financial reporting (FR-41)
**And** the row's "Correct" action is available, never Edit/Delete

---

## Epic 12: Dashboard & Cross-Site Rollup

Owner/Admin opens the Dashboard and immediately sees the full story — Today's Activity, Overall status, and an explicit gap-flag for any Site that hasn't reported yet today — with every tile drilling down into the real screen behind it.

### Story 12.1: Today's Activity & Missing-DSR Gap Flag

As Owner/Admin,
I want to open the Dashboard and see today's activity across all Sites — sites active, labour working, materials received/consumed, RMC used, machinery in use, expenses — with an explicit flag for any Site that hasn't reported yet today,
So that I know what happened today and what needs my attention, without phoning anyone (SM-3).

**Acceptance Criteria:**

**Given** DSRs and transactions exist for some Sites today
**When** I open the Dashboard
**Then** each Today's Activity stat tile drills down into the real screen behind it (Daily Activity, Inventory, Team, Machinery, Expenses)
**Given** a Site has not submitted a DSR yet today
**When** I view the Dashboard
**Then** a Gap Flag names that Site explicitly — never a silent absence in a list (FR-35)

### Story 12.2: Overall Rollup

As Owner/Admin,
I want to see Overall status — active Sites, inventory status, outstanding Advances, pending payments — with drill-down into every figure,
So that I understand business-wide state at a glance.

**Acceptance Criteria:**

**Given** a Tenant with zero Sites
**When** I open the Dashboard
**Then** I see an explicit empty state guiding me to create a Site — never a broken or blank layout (FR-34)
**Given** Sites, Inventory, Advances, and Payments data exist
**When** I view the Overall section
**Then** every figure matches its source screen exactly and links through to it

---

## Epic 13: Reports & Auto-Delivery

Owner/Admin sees Site, Inventory, Labour, and Financial reports, filterable and Tenant-scoped; each day's branded report auto-compiles from that day's DSR and delivers automatically via WhatsApp/Email with no manual send step, retrying and surfacing failure rather than silently dropping.

### Story 13.1: Auto-Compile & Deliver Branded Daily Report

As Owner/Admin,
I want each day's branded per-Site report to compile automatically from that day's DSR and deliver via WhatsApp/Email with no manual send step,
So that I get the day's summary without asking anyone to send it, and it always reflects my Tenant's own branding.

**Acceptance Criteria:**

**Given** a Site's DSR is submitted and synced for a given day
**When** the scheduled compile runs (Vercel Cron, AD-13)
**Then** a branded report auto-generates reflecting the Tenant's branding configuration — seeded with sensible defaults (Tenant name, neutral placeholder colors, no logo) from day one, so this story doesn't hard-depend on Epic 14's admin UI — and delivers via the configured channel(s) with no manual "Send" action anywhere in the UI (FR-32, UX-DR19)
**Given** delivery fails
**When** the retry policy is exhausted
**Then** the failure surfaces in-app as a visible status, never silently dropped (FR-33)

### Story 13.2: Site & Inventory Reports

As Owner/Admin,
I want filterable Site reports (DSR history, activity, photos) and Inventory reports (stock, consumption, purchases, movements, wastage, low-stock), scoped to my Tenant,
So that I can review either domain in depth without exporting data elsewhere.

**Acceptance Criteria:**

**Given** DSR and Inventory transaction data exists
**When** I open Site or Inventory reports and apply a date-range filter
**Then** results are scoped strictly to my Tenant and reflect exactly the underlying records (FR-42, FR-43)

### Story 13.3: Labour & Machinery/Vehicle Reports

As Owner/Admin,
I want filterable Labour reports (attendance, work history, payments, advance history) and Machinery/Vehicle reports (usage, movement, maintenance),
So that I can review workforce and asset activity in depth.

**Acceptance Criteria:**

**Given** Work Record, Payment, Advance, and Machinery/Vehicle movement data exists
**When** I open Labour or Machinery/Vehicle reports and apply filters
**Then** results are scoped strictly to my Tenant and reflect exactly the underlying records (FR-44, FR-45)

### Story 13.4: Financial Reports

As Owner/Admin,
I want Financial reports showing Site expenses and cost breakdowns by Material/Labour/RMC/Machinery/Vehicle,
So that I understand where money is actually going, per Site.

**Acceptance Criteria:**

**Given** Expense, Purchase, Payment, and RMC cost data exists across Sites
**When** I open Financial reports
**Then** cost breakdowns by category reconcile exactly to the sum of underlying entries, filterable by Site and date range (FR-46)

---

## Epic 14: Tenant Configuration & Settings

Owner/Admin configures company branding (reflected in the next generated report immediately), manages Users & Roles within the Tenant, and configures labour/machinery/vehicle/expense categories and notification/report delivery settings — all admin-configurable, none hardcoded.

### Story 14.1: Branding Configuration

As Owner/Admin,
I want to configure my company's branding (name, logo, address, contact, GST, colors, report branding),
So that every generated report carries my own business's identity, not a generic default.

**Acceptance Criteria:**

**Given** I update the Tenant's branding configuration
**When** I save
**Then** the change reflects in the next generated report automatically, with no separate publish step (FR-47)

### Story 14.2: Users, Roles & Permissions

As Owner/Admin,
I want to manage which people have accounts in my Tenant and what role they hold — Owner/Admin or Site Supervisor,
So that access matches who's actually on the team, with no third role tier or cross-tenant surface ever appearing.

**Acceptance Criteria:**

**Given** I invite a user to my Tenant
**When** I assign them a role
**Then** only Owner/Admin and Site Supervisor exist as options — never a Platform Operator or any cross-tenant role (AD-1, AD-11, FR-48)

### Story 14.3: Category Configuration

As Owner/Admin,
I want to manage the category sets seeded by Epics 6, 8, and 11 (labour/employment types, machinery/vehicle types, expense categories),
So that my catalog of categories matches how my business actually operates, fully admin-configurable.

**Acceptance Criteria:**

**Given** categories seeded with sensible defaults by their originating epics
**When** I add, edit, or disable a category
**Then** the change is reflected immediately in the relevant entry forms, with none of these categories ever hardcoded (NFR-4, FR-49)

### Story 14.4: Notification Channel Configuration

As Owner/Admin,
I want to configure which channels (WhatsApp/Email/in-app) receive automated reports, and to whom,
So that the right people get the daily report without me forwarding it manually.

**Acceptance Criteria:**

**Given** I configure a notification channel and recipient list
**When** the next automated report compiles (Epic 13)
**Then** it delivers to exactly the configured channels and recipients (FR-50)

### Story 14.5: Report Configuration

As Owner/Admin,
I want to configure report templates, frequency, and recipients independently of the daily-DSR delivery channel,
So that I can tune reporting cadence without affecting the core daily report flow.

**Acceptance Criteria:**

**Given** I configure a report template, frequency, and recipient list
**When** I save
**Then** this configuration operates independently of FR-50's daily-DSR delivery settings (FR-51)
