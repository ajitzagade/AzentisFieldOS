---
id: SPEC-AzentisFieldOS
companions:
  - glossary.md
  - functional-requirements.md
  - success-metrics.md
  - ../../planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md
sources:
  - ../../planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md
  - ../../planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/addendum.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# AzentisFieldOS

## Why

Small and mid-size civil/government contractors in India run a dozen-plus construction sites at once — the pilot contractor behind this spec runs 10+ concurrently, ~70+ over a year — and track materials, labour, advances, and daily progress by hand, in paper books, with no way to see what happened at any site without phoning someone. AzentisFieldOS is a mandate-and-vision spec: a mandate because the pilot contractor is a paying client whose payment is contingent on delivered quality, and a vision because it's built white-label and multi-tenant from day one, deploy-per-tenant, so the same product becomes the operating system for the next contractor client, and the one after that.

## Capabilities

- **CAP-1 — Multi-Site Management**
  - **intent:** Owner/Admin creates and manages multiple Sites, with both an individual Site view and a consolidated cross-Site rollup.
  - **success:** A new Site appears immediately in both views with no separate config step; every record tagged to a Site is retrievable from that Site's view.

- **CAP-2 — Material Catalog Configuration**
  - **intent:** Owner/Admin defines and extends Material categories, Materials, Sizes/Specs, Units, and Custom Fields without a code change.
  - **success:** A newly added Material/Size/Unit is immediately selectable in Purchase/Movement/Consumption forms; disabling a Material hides it from new entries while historical records stay intact.

- **CAP-3 — Inventory Lifecycle & Movement**
  - **intent:** Track every unit of Material through Purchase → Godown Stock → Site Transfer → Site Stock → Consumption → Return/Wastage, across Vendor→Godown, Godown→Site, Vendor→Site direct, and Site→Site.
  - **success:** Current Stock is always derivable by replaying transaction history; a transaction driving Stock negative is rejected, not allowed.

- **CAP-4 — Machinery & Vehicle Registers**
  - **intent:** Track Machinery/Vehicles by current Site with fuel/maintenance/repair logging and movement history.
  - **success:** Current Site updates the moment a movement is recorded, visible from both the asset's record and the Site view.

- **CAP-5 — Labour & Team Management**
  - **intent:** One tenant-wide Team Member pool, never permanently assigned to a Site; daily Work Records capture who actually worked where.
  - **success:** A Team Member can work different Sites on different dates freely, but never two Sites on the same date.

- **CAP-6 — Labour Advances & Payments**
  - **intent:** Owner/Admin records Advances and Payments with fully manual, owner-controlled Advance Adjustments — never automatic deduction.
  - **success:** Outstanding Balance changes only via explicit Adjustment, capped so it can never go negative; full adjustment history retained.

- **CAP-7 — RMC Tracking**
  - **intent:** Record RMC delivered/used per Site, Vendor, grade, and cost.
  - **success:** Site-wise and Vendor-wise RMC totals reconcile exactly to the sum of individual entries in range.

- **CAP-8 — Daily Site Report (DSR)**
  - **intent:** Site Supervisor completes one DSR per Site per day from a phone — work, labour, materials, RMC, machinery/vehicles, expenses, issues, photos — fully offline-capable.
  - **success:** A DSR completed offline is never lost and syncs automatically on reconnect, with per-sub-record idempotency preventing duplicates.

- **CAP-9 — Automated Report Generation & Delivery**
  - **intent:** Compile a branded daily report per Site from that day's DSR and deliver it to the Owner automatically (WhatsApp/Email/in-app), no manual send.
  - **success:** A submitted DSR results in same-day delivery without user action; failed delivery retries then surfaces in-app rather than silently dropping.

- **CAP-10 — Contractor Dashboard**
  - **intent:** One dashboard rolling up Projects, Today's Activity, Inventory, Team, and Machinery/Vehicles, with drill-down into underlying records.
  - **success:** Every summary figure reconciles exactly to underlying records; a Site with no DSR submitted today is visibly flagged.

- **CAP-11 — Vendor Management**
  - **intent:** Maintain a Vendor database with full Purchase → Material → Quantity → Amount history per Vendor.
  - **success:** A Vendor's displayed total matches the exact sum of their individual Purchase records.

- **CAP-12 — Expense Tracking**
  - **intent:** Record Site-linked Expenses against admin-configurable categories.
  - **success:** Every Expense is retrievable by Site/category/date range; the category list is never hardcoded.

- **CAP-13 — Reports**
  - **intent:** A defined set of Site, Inventory, Labour, Machinery/Vehicle, and Financial reports, each strictly Tenant-scoped.
  - **success:** No report, under any filter combination, can surface another Tenant's data.

- **CAP-14 — Admin Configuration**
  - **intent:** Owner/Admin configures branding, users/roles, sites, inventory, labour, machinery/vehicle types, expense/vendor categories, report templates, and notification channels, without a code deployment.
  - **success:** A branding change is reflected in the next generated report with no separate publish step.

- **CAP-15 — Multi-Tenant / White-Label Platform**
  - **intent:** Each Tenant runs as a fully isolated, independently branded instance of the product, provisioned from one shared codebase.
  - **success:** A newly provisioned Tenant has zero visibility into any other Tenant's data, verified by the absence of any network path between Tenant deployments — not merely an application-layer check.

- **CAP-16 — Audit & Transaction History**
  - **intent:** Material, Advance, Machinery/Vehicle, and Payment transactions are never overwritten or deleted; every correction is a new, linked, reason-carrying entry.
  - **success:** No UI or API path can update or delete a past transaction; a correction submitted without a reason is rejected.

## Constraints

- Tenant isolation is absolute: no cross-tenant data path may ever exist, enforced by deployment separation (architecture companion, AD-1), not an in-app check alone.
- Advances, Stock, and Payments are never auto-adjusted or auto-deducted; every change requires explicit, reason-carrying user action, logged append-only (CAP-16).
- No approval-chain, hierarchy, or mandatory workflow may be introduced anywhere — this is a simple owner-operated tool, not an enterprise ERP.
- Every material type, size, unit, labour category, machinery/vehicle type, and expense category must be admin-configurable; none may be hardcoded.
- DSR entry must function fully offline on a low-end phone over a 2G/3G-equivalent connection; the network is an optimization, not a dependency (CAP-8).
- Platform is responsive web only for v1 — no native mobile app.
- WCAG AA accessibility and Lighthouse >95 (Performance/Accessibility/Best Practices/SEO) are enforced in CI, not left to discretionary review.
- The pilot contractor's payment is contingent on delivered product quality, not a fixed spec-and-price contract — completeness and correctness of this contract carry direct commercial weight.
- Infrastructure cost is linear per Tenant under the deploy-per-tenant architecture; this must inform any future pricing model rather than being decided independently of it.
- Team Member personal data (contact details, wage/advance history) and Site photos (which may capture people) get basic within-tenant access-scoping — visible only to that Tenant's Owner/Admin and relevant Site Supervisors — pending confirmation of whether a formal regulatory framework (e.g., India's DPDP Act) applies.

## Non-goals

- No native mobile app in v1.
- No formal billing, invoicing, BOQ management, or GST/invoicing workflow.
- No purchase-order workflow, project costing/budgeting module, or approval chains anywhere.
- No GPS-based tracking for vehicles, machinery, or attendance.
- No formal equipment-maintenance-management workflow beyond basic logging (CAP-4).
- No document/drawing management system beyond attachments already on DSR/Purchase/RMC records.
- No client portal for the government/private client side of a contract.
- No WhatsApp chatbot — WhatsApp is one-way automated report delivery only (CAP-9).
- No AI-generated summaries, cost/progress forecasting, or predictive analysis.
- No accounting/GST software integration.
- No in-app cross-tenant admin surface of any kind — Tenant provisioning is a credential-level, off-app concern (architecture companion, AD-11).

## Success signal

The pilot contractor runs all daily site, inventory, labour, and financial tracking through the product instead of paper books, and can answer "what happened today at every Site" from the app alone without phoning a supervisor. A second Tenant is successfully onboarded and demonstrably isolated on the same platform, validating the white-label premise the business model depends on — the founder has named "a few more contractors" they could approach if the pilot succeeds, but no second-Tenant lead is confirmed yet, so this half of the signal is directional, not committed. Full numeric targets in `success-metrics.md`.

## Assumptions

- Labourers/Team Members are data records, not app users, in v1 (no labourer-facing login).
- The in-app Role set is Owner/Admin and Site Supervisor only; Platform Operator is a credential-level concern outside the app (architecture companion, AD-11).
- DSR "minimal required fields" and the dashboard's "missing-DSR" flag behavior are inferred from user journeys, not confirmed field-by-field with the founder.
- Offline sync conflict resolution is per-sub-record, last-synced-write-wins, not whole-DSR overwrite (architecture companion, AD-8).
- A per-Tenant subscription pricing model is assumed likely (based on comparable products) but not settled with the founder or the pilot contractor.

## Open Questions

- What specifically is the manual paper-book process costing the pilot contractor today (money/material traceability, no visibility, advance disputes, billing delays)? Never itemized despite being asked twice during brief discovery.
- Is government-audit-grade reporting or RA-bill evidence in scope? The domain vocabulary (RMC, godown, challan) implies government contract work, but this was never confirmed.
- Exact permission granularity between Owner/Admin and Site Supervisor for edge actions (e.g., can a Supervisor record a direct Vendor→Site purchase unassisted)?
- Is regional-language (Hindi/other) UI needed for Site Supervisors, given the likely end-user population?
- What are the actual numeric Success Metric targets (`success-metrics.md`)? Currently PRD-authored defaults, not founder-ratified — significant given the pilot's payment is quality-contingent on them.
- What is the Tenant offboarding/data-retention policy? Also unresolved: the in-app procedure for deactivating a departing Owner/Admin's or Site Supervisor's access (CAP-14), and separately the ops procedure for revoking a departing team member's provisioning-credential access.
- Which WhatsApp BSP (Gupshup vs. Interakt vs. AiSensy) will actually be used? Architecture named the pattern, not the vendor.
