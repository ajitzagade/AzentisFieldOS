---
title: "AzentisFieldOS"
created: 2026-08-11
updated: 2026-08-12
status: final
---

# PRD: AzentisFieldOS
*Working title — confirm against the brief's flagged name assumption before this circulates.*

## 0. Document Purpose

This PRD is for the founder/PM driving the build, the engineers implementing it, and the downstream BMad workflows (UX, Architecture, Epics & Stories) that consume it. It builds on `brief.md` and `addendum.md` in `_bmad-output/planning-artifacts/briefs/brief-AzentisFieldOS-2026-08-11/` — the brief's Executive Summary, Problem, and Business Model are not repeated here; this document translates that brief plus the founder's full 30-section functional specification (preserved in the brief's addendum) into testable requirements. Vocabulary is Glossary-anchored (§3); every Functional Requirement (FR) is globally numbered and stable; `[ASSUMPTION]` tags are inline where this draft inferred without explicit confirmation, indexed in §11. This is a Fast-path draft — assumptions should be corrected in review, not treated as settled.

## 1. Vision

Small and mid-size civil/government contractors in India run a dozen-plus construction sites at once — the pilot contractor behind this PRD runs 10+ concurrently and roughly 70+ over a year — and track almost everything — material stock, labour advances, machinery location, daily progress — by hand, in paper books. AzentisFieldOS replaces that with one system: a contractor owner opens the app and knows, for every site, what happened today — without phoning a supervisor to ask.

Underneath the daily loop sits the operational backbone a civil contractor actually needs: a fully admin-configurable material catalog tracked from godown to consumption, a shared labour pool with flexible cash advances instead of rigid payroll, machinery and vehicle registers, RMC tracking, and automatic branded daily reports delivered to the owner.

It is built white-label and multi-tenant from the start, so the same product, reconfigured, becomes the operating system for the next contractor client, and the one after that — a segment competitor research shows is still running on WhatsApp and Excel, split across point tools that each solve one slice of this and none solve all of it together.

## 2. Target User

### 2.1 Jobs To Be Done

- As the **contractor owner/admin**, I need to know what happened at every site today without calling anyone, so I can catch problems (material shortage, a stalled activity, a safety issue) same-day instead of weeks later.
- As the **contractor owner/admin**, I need a single source of truth for what material was purchased, moved, and consumed, so I stop reconciling paper receipts against what's physically at each site.
- As the **contractor owner/admin**, I need to track labour advances and decide myself when and how much to recover, without a payroll system forcing automatic deductions that don't match how I actually run the business.
- As the **contractor owner/admin**, I need machinery and vehicles visible by current site, so idle equipment doesn't sit unused at one site while another needs it.
- As the **site supervisor**, I need to log the day's activity, materials, labour, and photos in minutes from my phone, even with poor signal, so daily reporting doesn't become a chore I skip.
- As the **founder/platform operator**, I need to onboard a new contractor as an isolated tenant with their own branding and material catalog without touching code, so the business model (reselling the same product) actually works.

### 2.2 Non-Users (v1)

- Government client-side officials or auditors are not direct users in v1 — no client portal, no external stakeholder login (§5 Non-Goals). RA-bill/government-audit evidence needs are unconfirmed (§10, Open Question 4) and out of scope until confirmed.
- Accountants/bookkeepers are not a distinct role in v1 — expense and payment data exists for the owner to view and export manually; no accounting-system integration or GST/invoicing workflow (§5 Non-Goals).
- Individual labourers/team members are tracked *as records*, not as app users — v1 has no labourer-facing login, self-service attendance, or payment-request flow. `[ASSUMPTION]`

### 2.3 Key User Journeys

- **UJ-1. Ramesh logs today's site activity with no signal.**
  - **Persona + context:** Ramesh, site supervisor at a highway-widening site with patchy mobile coverage, wraps up the day's concreting work.
  - **Entry state:** Already authenticated on a prior session; opens the responsive web app on his phone, offline.
  - **Path:** Selects today's Daily Site Report (DSR) for his assigned site from a recently-used shortcut; logs work completed, labour present (defaults pre-filled from yesterday's crew), material consumed (cement, RCC pipe — picked from dropdowns, not typed), RMC used, and takes three site photos; taps Submit.
  - **Climax:** The app confirms "saved on device — will sync when back online" instead of failing or losing his entry.
  - **Resolution:** Two hours later, back in signal range, the app syncs automatically; Ramesh gets a silent confirmation, no re-entry needed.
  - **Edge case:** If Ramesh submits a second DSR for the same site/date before the first has synced, the app treats it as an edit to the queued entry, not a duplicate. `[ASSUMPTION — offline conflict rule not confirmed, see §10, Open Question 5]`

- **UJ-2. The owner starts the day already knowing what happened yesterday.**
  - **Persona + context:** Suresh, the contractor owner, manages 10+ concurrent sites and used to start every morning calling three or four supervisors.
  - **Entry state:** Opens the app (or WhatsApp/email) from his phone or laptop, authenticated as tenant owner.
  - **Path:** Receives yesterday's branded, auto-compiled report for each active site via WhatsApp before he's even opened the app; opens the dashboard to see today's cross-site rollup — labour on-site, materials received/consumed, low-stock flags, machinery locations, open issues.
  - **Climax:** He spots that Site B flagged a cement shortage in yesterday's DSR, before the supervisor would have called to ask for more.
  - **Resolution:** He initiates a godown→site transfer to Site B directly from the app.
  - **Edge case:** If a site's DSR wasn't submitted the previous day, the dashboard surfaces it as a gap, not a silent blank. `[ASSUMPTION]`

- **UJ-3. Suresh partially recovers a labour advance, on his own schedule.**
  - **Persona + context:** A mason took a ₹10,000 advance three weeks ago; Suresh has decided, unprompted by the system, that this week is a good week to recover part of it.
  - **Entry state:** Authenticated as owner, on the Team member's profile.
  - **Path:** Opens the mason's advance history, sees ₹10,000 outstanding, records a ₹2,000 adjustment against this week's payment with a one-line note.
  - **Climax:** The system shows ₹8,000 still outstanding — no automatic deduction was applied, no approval step blocked him.
  - **Resolution:** The adjustment is logged in the mason's payment history, timestamped, attributed to Suresh.

- **UJ-4. The founder onboards contractor #2 as a new tenant.**
  - **Persona + context:** The pilot went well; a second contractor wants in.
  - **Entry state:** Founder authenticated as platform operator.
  - **Path:** Creates a new tenant, uploads the new contractor's logo and company details, defines their material catalog (different sizes/specs than the pilot's), invites their first admin user.
  - **Climax:** The new tenant logs in and sees only their own sites, materials, and team — nothing from the pilot contractor.
  - **Resolution:** Two contractors now run on the same platform, fully isolated, realizing the core white-label multi-tenant premise (FR-52, FR-53).

## 3. Glossary

- **Tenant** — One contractor company's fully isolated instance of the platform: its own branding, sites, materials, team, vendors, and data. No cross-tenant access, ever.
- **Contractor / Company** — The tenant-owning business (the pilot, or any future client).
- **Site / Project** — A single construction contract/location the contractor manages. Has its own activity, stock, labour, and expense records, all rolled up to the Contractor level.
- **Godown** — The tenant's central warehouse where purchased material is stored before being sent to a Site.
- **Material** — A configurable inventory item (e.g., Cement, RCC Pipe). Belongs to an admin-defined Category, may have multiple Sizes/Specifications, tracked in a defined Unit.
- **Size / Specification** — A configurable variant of a Material (e.g., RCC Pipe 300mm vs 450mm). Not hardcoded.
- **Unit (of Measure)** — Configurable measurement unit (Bags, Cubic metres, Tonnes, etc.) attached to a Material.
- **Stock** — Quantity of a Material (at a given Size) currently held, tracked separately as **Godown Stock** and **Site Stock**.
- **Purchase** — A recorded acquisition of Material from a Vendor, destined for either the Godown or directly to a Site.
- **Material Movement** — Any transaction that moves Material: Godown→Site, Site→Site. Reduces source Stock, increases destination Stock.
- **Consumption** — Material recorded as used at a Site against an activity, reducing Site Stock.
- **Wastage / Return** — Material recorded as lost, damaged, or returned, distinct from Consumption.
- **Machinery** — A tracked piece of equipment (JCB, mixer, etc.) with a current Site/location and usage/maintenance history.
- **Vehicle** — A tracked transport asset (truck, dumper, etc.) with a current Site/location, driver, and usage/maintenance history.
- **Team Member** — A person in the tenant's shared labour pool. Not permanently assigned to a Site.
- **Work Record** — A Team Member's recorded attendance/activity at a specific Site on a specific date.
- **Advance** — Cash given to a Team Member ahead of earned pay. Has a running Outstanding Balance.
- **Advance Adjustment** — An owner-initiated, manually-sized reduction of an Advance's Outstanding Balance against a Payment. Never automatic.
- **Payment** — A recorded amount paid to a Team Member (weekly, monthly, or daily-wage), net of any Advance Adjustment applied.
- **RMC (Ready-Mix Concrete)** — Concrete purchased from an external vendor, tracked by volume (m³), grade, and cost, separate from Material inventory.
- **Daily Site Report (DSR)** — The Site Supervisor's once-daily structured log of a Site's activity, labour, material, RMC, machinery/vehicle use, expenses, issues, and photos.
- **Vendor** — A supplier of Material, RMC, or services, with purchase and payment history.
- **Expense** — Any recorded cost not otherwise captured as a Purchase (fuel, repairs, transport, misc.), tied to a Site and Category.
- **Role** — **Owner/Admin** (full tenant access, configuration, all sites) and **Site Supervisor** (mobile DSR entry, scoped to assigned Site(s) day-to-day, not permanently bound to one) are the only in-app roles — there is no in-app "Platform Operator" role (see below). `[ASSUMPTION — exact permission granularity between these two roles not confirmed, see §10, Open Question 6]`
- **Platform Operator** — not an application role. Per the architecture spine (`architecture-AzentisFieldOS-2026-08-11`, AD-11), each Tenant is a fully separate deployment, so no running instance of the product ever has visibility across Tenants for a role to exist within. "Tenant provisioning" is a capability held by whoever has credentials to the provisioning tooling and underlying cloud accounts (Vercel, database provider, auth provider, storage) — a human/ops concern secured by MFA on those accounts (NFR-8), not a screen or permission inside the product.
- **Custom Field** — An admin-defined additional data field attached to a Material, Machine, Vehicle, or other configurable entity.

## 4. Features

### 4.1 Multi-Site & Project Management

**Description:** The contractor creates and manages multiple Sites under their Tenant, each carrying its own activity, stock, labour, and expense trail, rolled up into a consolidated Contractor-level view. Realizes UJ-2.

#### FR-1: Create and maintain Sites
Owner/Admin can create a Site with name, location, status (active/completed/on-hold), and contract reference details.

**Consequences (testable):**
- A new Site appears immediately in the Site list and in the Contractor-level dashboard rollup.
- Site status changes are timestamped and visible in Site history.

#### FR-2: Individual Site view
Owner/Admin (and Site Supervisor, scoped to their current activity) can view a single Site's complete activity: DSRs, stock, labour, machinery/vehicles present, expenses, RMC usage, and photos, in chronological order.

**Consequences (testable):**
- Every record type (DSR, stock movement, labour work record, expense, RMC entry) tagged to a Site appears in that Site's view with no manual filtering required.

#### FR-3: Consolidated contractor-wide view
Owner/Admin can view a rollup across all active Sites — see §4.10 Dashboard for the specific rollup content.

**Consequences (testable):**
- Adding a new Site automatically includes it in the consolidated view with no separate configuration step.

**Notes:** Machinery/vehicle/material *transfer between* Sites is specified as its own FR under the relevant feature (§4.3, §4.4), not duplicated here.

### 4.2 Inventory & Material Catalog Configuration

**Description:** Nothing about the material catalog is hardcoded. Admin defines categories, materials, sizes/specifications, and units, and can extend all of them at any time without a code change.

#### FR-4: Configurable material categories and materials
Owner/Admin can add, edit, and disable Material Categories and Materials within a category.

**Consequences (testable):**
- A newly added Material is immediately available for selection in Purchase, Movement, and Consumption forms.
- A disabled Material no longer appears in new-entry dropdowns but remains visible/intact in historical records.

#### FR-5: Configurable sizes/specifications per material
Owner/Admin can define one or more Sizes/Specifications per Material (e.g., RCC Pipe: 300/450/600/900mm, plus custom), and add new sizes at any time.

**Consequences (testable):**
- Stock, Purchase, Movement, and Consumption records for a Material always carry a Size where the Material has sizes defined.
- Adding a new Size does not alter or require re-entry of existing Stock records for other sizes of the same Material.

#### FR-6: Configurable units of measure
Owner/Admin can define Units (Bags, Pieces, Cubic metres, Cubic feet, Tonnes, Kg, Running feet, Litres, Numbers, custom) and assign a Unit to each Material.

**Consequences (testable):**
- A Material's Unit is enforced consistently across every transaction type for that Material (no mixing Bags and Kg for the same Material without an explicit conversion step, which is out of scope — see Out of Scope below).

#### FR-7: Custom fields on materials
Owner/Admin can add Custom Fields to a Material definition.

**Out of Scope:**
- Cross-tenant shared material libraries or a marketplace of predefined catalogs — each Tenant's catalog is independent. `[ASSUMPTION]`

### 4.3 Inventory Lifecycle & Movement

**Description:** Every unit of Material is tracked through Opening Stock → Purchase → Godown Stock → Site Transfer → Site Stock → Consumption → Return/Wastage → Closing Stock, as a transaction history, not a single overwritten quantity. Supports all four real movement patterns the founder specified: Vendor→Godown, Godown→Site, Vendor→Site (direct), Site→Site. Realizes UJ-2.

#### FR-8: Record a Purchase (to Godown or direct to Site)
Owner/Admin can record a Purchase specifying Vendor, Material, Size, quantity, Unit, rate, total amount, invoice/challan number, payment status, delivery location, vehicle details, notes, and destination (Godown or a specific Site), with optional photos/documents.

**Consequences (testable):**
- A Purchase destined for Godown increases Godown Stock for that Material/Size by the recorded quantity; a Purchase destined for a Site increases that Site's Stock directly and never touches Godown Stock.
- Every Purchase is individually retrievable later — no merging into a running total that loses the original entry.

#### FR-9: Godown → Site material movement
Owner/Admin can record a transfer of a Material/Size/quantity from Godown to a Site, capturing vehicle, person responsible, and received quantity (which may differ from sent quantity).

**Consequences (testable):**
- Godown Stock decreases by the sent quantity at the moment the transfer is recorded; Site Stock increases by the *received* quantity once receipt is confirmed.
- A shortage/damage gap (sent minus received) is captured as its own recorded value, not silently dropped.

#### FR-10: Direct Vendor → Site purchase
Owner/Admin (or Site Supervisor, if permitted — see §10 Open Question 6 on role granularity) can record a Purchase delivered straight to a Site, bypassing Godown entirely, capturing the same field set as FR-8 (Vendor, Site, Material, Size, quantity, Unit, rate, total amount, purchase date, invoice/challan, delivery details, vehicle details, receiver/person who received it, notes, documents/photos).

**Consequences (testable):**
- This transaction never appears in, or affects, Godown Stock.
- It increases the destination Site's Stock identically to how a Godown→Site transfer would.

#### FR-11: Site → Site material transfer
Owner/Admin can record a transfer of Material/Size/quantity from one Site to another, capturing vehicle, person responsible, notes, and received quantity (which may differ from sent quantity) — the same field discipline as the Godown→Site transfer in FR-9.

**Consequences (testable):**
- Source Site Stock decreases by the sent quantity and destination Site Stock increases by the *received* quantity; both Sites' histories show the linked transaction, including any shortage/damage gap.

#### FR-12: Record Consumption
Site Supervisor (via DSR, §4.8) or Owner/Admin can record Material consumed at a Site against an activity reference.

**Consequences (testable):**
- Consumption reduces Site Stock and is retrievable by date, Material, and activity reference.
- Consumption can be compared against total received at that Site to compute a variance, surfaced in Reports (§4.13).

#### FR-13: Record Return/Wastage
Owner/Admin or Site Supervisor can record Material as returned or wasted, distinct from Consumption.

**Consequences (testable):**
- Return/Wastage is tracked as its own transaction type and does not silently reduce Stock as if it were Consumption — Reports can distinguish the two.

#### FR-14: Full lifecycle visibility per Material/Site/Godown
Owner/Admin can view, for any Material (and Size), current Godown Stock, current Site Stock (per Site and totaled), total purchased, transferred, consumed, returned, wasted, and remaining — derived from the transaction history, not a manually maintained running total.

**Consequences (testable):**
- The sum of (Opening + Purchased + Transferred In) − (Transferred Out + Consumed + Returned/Wasted) reconciles to displayed current Stock at all times; any mismatch is a defect, not an accepted state.

**Feature-specific NFRs:**
- No transaction in FR-9, FR-11, or FR-12 may reduce a Godown Stock or Site Stock value below zero for a given Material/Size — the system rejects (or requires an explicit, separately recorded negative-stock override for) any transfer or consumption that would do so. `[ASSUMPTION — reject-vs-override policy not confirmed; see §10 Open Questions. Physical stock genuinely can go negative on paper when consumption is logged before a delayed receipt is recorded — a hard reject may be too strict for that real case, which is exactly why this is flagged rather than silently decided.]`

**Cross-reference:** All transactions in this feature are subject to the Audit & Transaction History requirements in §4.16 — none of them are ever silently overwritten.

### 4.4 Machinery & Vehicle Registers

**Description:** The contractor maintains a register of owned/managed Machinery and Vehicles, always knowing current location and availability, with maintenance and movement history.

#### FR-15: Machinery register
Owner/Admin can add a Machine with name, type, asset/registration number, model, ownership, operator, and see its current Site.

**Consequences (testable):**
- A Machine's current Site updates when a movement is recorded (FR-17) and is visible from both the Machine's record and the Site's view (FR-2).

#### FR-16: Vehicle register
Owner/Admin can add a Vehicle with number, type, ownership, driver, and see its current Site/usage.

**Consequences (testable):**
- Same visibility guarantee as FR-15, for Vehicles.

#### FR-17: Machinery/Vehicle movement between Sites
Owner/Admin can record a Machine or Vehicle moving from its current Site to another (or to/from a Maintenance state).

**Consequences (testable):**
- Movement history (Available → Site A → Site B → Maintenance → Available, per the founder's own lifecycle framing) is retained in full, not just the latest state.

#### FR-18: Fuel, maintenance, and repair logging
Owner/Admin can log fuel use, maintenance, and repair events against a Machine or Vehicle.

**Consequences (testable):**
- Logged maintenance events are retrievable as a service history list per asset, ordered by date.

**Notes:** GPS-based real-time tracking is explicitly deferred (§5 Non-Goals) — "current Site" here means the last manually recorded location, not live position.

### 4.5 Labour & Team Management

**Description:** A single, tenant-wide Team Member database. Nobody is permanently assigned to a Site — the same person may work different Sites on different days, and the system records *where they actually worked*, not where they're "assigned." Realizes UJ-1.

#### FR-19: Team Member records
Owner/Admin can add a Team Member with name, role/designation, contact details, and employment/payment type (monthly, weekly, or daily-wage).

**Consequences (testable):**
- A Team Member is not bound to any single Site at creation and never becomes bound to one — Site association only ever comes from Work Records (FR-20).

#### FR-20: Daily Work Record
Site Supervisor (via DSR) or Owner/Admin can record which Team Members worked at a given Site on a given date, with attendance, optional hours, and overtime.

**Consequences (testable):**
- A Team Member can have Work Records at two different Sites on two different dates within the same week with no conflict or warning — this is expected behavior, not an edge case.
- A Team Member cannot have two Work Records at two *different* Sites on the *same* date — the system rejects the second entry rather than silently allowing it, to prevent payroll double-counting. `[ASSUMPTION — same-day split-site work (e.g., half-day at each of two Sites) is real in this industry but was not confirmed as a v1 requirement; disallowing it is the safer default until confirmed. See §10 Open Questions.]`
- Entry is fast enough for mobile use: attendance for a known/recent crew defaults from the previous day's entry rather than requiring re-selection of every name. `[ASSUMPTION — "fast enough" not quantified, see NFR-2]`

#### FR-21: Site-wise work history per Team Member
Owner/Admin can view any Team Member's full history of which Sites they worked, when.

**Consequences (testable):**
- History is queryable by Team Member (across all Sites) and by Site (across all Team Members who worked there).

### 4.6 Labour Advances & Payments

**Description:** Cash advances and payments are tracked with complete flexibility — the owner decides when and how much of an outstanding Advance to recover against any given Payment. The system never auto-deducts. No mandatory approval workflow exists anywhere in this feature. Realizes UJ-3.

#### FR-22: Record an Advance
Owner/Admin can record an Advance to a Team Member: amount, date, reason/notes, payment method.

**Consequences (testable):**
- Recording an Advance immediately updates that Team Member's Outstanding Balance (Total Advance − Total Adjusted) with no approval step blocking the entry.

#### FR-23: Record an Advance Adjustment
Owner/Admin can record an Advance Adjustment of any amount, at any time, against any Payment (or standalone).

**Consequences (testable):**
- An Advance's Outstanding Balance changes *only* when an explicit Adjustment is recorded — it is mathematically impossible for a Payment to reduce it without one.
- Adjustment history is a full log (date, amount, linked Payment if any), not a single "amount adjusted" field.
- An Adjustment amount cannot exceed the Advance's current Outstanding Balance — the system rejects an over-adjustment rather than allowing the balance to go negative. `[ASSUMPTION — reject-on-overage was not confirmed with the founder; the alternative is allowing it with a visible warning, which some owners might actually want for messy real-world reconciliation. See §10 Open Questions.]`

#### FR-24: Record a Payment
Owner/Admin can record a Payment to a Team Member (weekly, monthly, or daily-wage) composed of Base Pay + Additional Amounts − Actual Deductions − Advance Adjustment (if any) = Net Payable.

**Consequences (testable):**
- Payment Status (paid/pending) and full Payment History are retained per Team Member; no payment record is overwritten by a later one.
- Omitting an Advance Adjustment on a Payment is valid and does not trigger any warning or requirement — matches the founder's explicit "never automatic" principle.

#### FR-25: Outstanding advance visibility
Owner/Admin can see, at a glance, total outstanding Advances across all Team Members and drill into any individual's balance and history.

**Consequences (testable):**
- Total outstanding figure reconciles exactly to the sum of individual Team Members' (Total Advance − Total Adjusted).

### 4.7 RMC (Ready-Mix Concrete) Tracking

**Description:** RMC sourced from an external Vendor is tracked as its own cost/volume category, separate from Material inventory.

#### FR-26: Record RMC delivery
Owner/Admin or Site Supervisor (via DSR) can record RMC used at a Site: Vendor, date, quantity (m³), grade/type, rate/m³, total amount, invoice/challan.

**Consequences (testable):**
- RMC entries are queryable by day, Site, and Vendor, with quantity and cost totals.

#### FR-27: RMC consumption reporting
Owner/Admin can view daily, Site-wise, and Vendor-wise RMC consumption and cost, historically.

**Consequences (testable):**
- Site-wise RMC total for a date range matches the sum of that Site's individual RMC entries in the range.

### 4.8 Daily Site Report (DSR)

**Description:** The single most important daily workflow. A Site Supervisor logs one structured report per Site per day — work done, labour, material received/consumed, RMC, machinery/vehicles used, expenses, issues, and photos — fast enough from a phone that it becomes a habit, not a chore. Must work with no or poor connectivity. Realizes UJ-1.

#### FR-28: Submit a Daily Site Report
Site Supervisor can create one DSR per Site per date containing: work completed, work in progress, planned work, labour present (linked to Work Records, FR-20), materials received/consumed (linked to FR-9/FR-10/FR-12), RMC used (FR-26), machinery/vehicles used (linked to FR-17), expenses (FR-32), issues/blockers/delays, safety observations, notes, and photos.

**Consequences (testable):**
- Submitting a DSR creates or updates the linked underlying records (Work Record, Consumption, RMC entry, Expense) rather than duplicating data entry — the DSR is the entry surface, not a separate silo.
- A DSR form's required fields are minimal; every list-selection field (Material, Team Member, Machinery) uses search/dropdown/recently-used defaults, never free-typing from scratch. `[ASSUMPTION — exact "minimal required fields" set not specified, see §11]`

#### FR-29: Offline DSR entry and sync
Site Supervisor can complete and submit a DSR with no network connectivity; the entry queues on-device and syncs automatically when connectivity returns.

**Consequences (testable):**
- A DSR completed fully offline is never lost due to app close, phone lock, or connectivity never returning within the same session — it persists locally until synced.
- The Supervisor receives clear on-device confirmation of "saved, pending sync" vs. "synced" states.

**Out of Scope:**
- Real-time collaborative editing of the same DSR by two Supervisors simultaneously.

#### FR-30: Multiple photos per DSR
Site Supervisor can attach multiple photos to a DSR, each automatically associated with Site, date, DSR, and uploader.

**Consequences (testable):**
- Photos remain queryable later as a chronological Site progress gallery (FR-31), not just embedded in the DSR record.

#### FR-31: Site photo/progress history
Owner/Admin can browse a Site's photos chronologically across all its DSRs as a running progress diary.

**Consequences (testable):**
- Photo gallery view requires no manual tagging beyond what FR-30 already captured automatically.

### 4.9 Automated Report Generation & Delivery

**Description:** At the end of each day, the system compiles a branded, presentable report per Site from that day's DSR and delivers it to the owner without the owner asking for it.

#### FR-32: Auto-generate branded daily report
System compiles a per-Site daily report containing company branding/logo, project info, date, and the full DSR content (work summary, labour, materials, RMC, machinery, vehicles, expenses, issues, progress, photos, remarks).

**Consequences (testable):**
- Report branding (logo, company name, colors) reflects the Tenant's own configuration (§4.14), never another Tenant's, and never a generic default once branding is configured.

#### FR-33: Automated delivery via WhatsApp/Email/in-app
System delivers the generated daily report to the Owner/Admin automatically, through configured channels.

**Consequences (testable):**
- Delivery is attempted without any manual "send" action by the Supervisor or Owner once a DSR is submitted for the day.
- A failed delivery (e.g., WhatsApp API error) is retried and, if that fails, surfaced as a visible failure in-app, never silently dropped. `[ASSUMPTION — retry policy and exact WhatsApp delivery mechanism not specified, see addendum.md technical notes and §8]`

### 4.10 Contractor Dashboard

**Description:** A centralized rollup giving the owner both high-level visibility and detailed drill-down, across Projects, Today's Activity, Inventory, Team, and Machinery/Vehicles. Realizes UJ-2.

#### FR-34: Projects summary
Dashboard shows total/active/completed Sites and per-Site progress at a glance, where "progress" is defined as the recency and volume of DSR activity logged against the Site rather than a percent-complete figure — no budget, schedule baseline, or BOQ exists in v1 (§5 Non-Goals) to compute completion percentage against. `[ASSUMPTION — "per-Site progress" was undefined by the founder; this activity-based proxy is the simplest v1 interpretation, not a confirmed one.]`

**Consequences (testable):**
- A Tenant with zero Sites shows an explicit empty state ("no Sites yet") rather than a blank or broken dashboard. `[ASSUMPTION]`
- Per-Site progress updates the same day a DSR is logged against that Site, with no manual refresh step.

#### FR-35: Today's activity summary
Dashboard shows, for the current date across all Sites: activities logged, labour working, materials received/consumed, RMC used, machinery/vehicles in use, expenses, photos, and open issues — and flags any Site with no DSR yet for today. `[ASSUMPTION — "flags missing DSR" inferred from UJ-2, not explicitly specified]`

#### FR-36: Inventory summary
Dashboard shows Godown stock, Site-wise stock, low-stock materials (against an admin-defined threshold), and recent purchases/transfers/consumption.

**Consequences (testable):**
- A Material dropping below its configured low-stock threshold appears on the dashboard without a manual report run.

#### FR-37: Team summary
Dashboard shows total Team Members, today's working headcount, weekly/monthly payment totals, and total outstanding Advances.

**Consequences (testable):**
- Today's working headcount reconciles exactly to the count of distinct Team Members with a Work Record (FR-20) dated today, across all Sites.

#### FR-38: Machinery & Vehicle summary
Dashboard shows available vs. in-use counts, per-Site allocation, and assets flagged for maintenance.

**Consequences (testable, applies to FR-34 through FR-38):**
- Every summary tile supports drill-down into the underlying detailed records (FR-2, §4.13 Reports) — the dashboard is a view, not a dead end.

### 4.11 Vendor Management

**Description:** A simple Vendor database supporting the Purchase and RMC workflows.

#### FR-39: Vendor records
Owner/Admin can add a Vendor with name, contact person, phone, email, address, and materials/services supplied.

#### FR-40: Vendor purchase history
Owner/Admin can view, per Vendor, the full chain: Purchases → Materials → Quantity → Amount, and payment status.

**Consequences (testable):**
- A Vendor's total purchase amount displayed matches the sum of that Vendor's individual Purchase records exactly.

### 4.12 Expense Tracking

**Description:** Simple, Site-linked expense capture across categories the founder specified: material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, and misc.

#### FR-41: Record an Expense
Owner/Admin or Site Supervisor (via DSR) can record an Expense: date, Site, category, amount, description, payment method, person/vendor, optional supporting document/photo.

**Consequences (testable):**
- Expense Categories are admin-configurable (§4.14), not a hardcoded list.

### 4.13 Reports

**Description:** A defined set of useful, non-overwhelming reports across Site, Inventory, Labour, Machinery, Vehicle, and Financial domains — not open-ended analytics.

#### FR-42: Site reports
Daily Site Report history, progress report, activity history, photo history — per Site, filterable by date range.

#### FR-43: Inventory reports
Current/Godown/Site stock, consumption, purchase, movement, wastage, and low-stock reports, matching the lifecycle data model in §4.3.

#### FR-44: Labour reports
Attendance, work history, weekly/monthly payments, advance outstanding, and advance adjustment history.

#### FR-45: Machinery & Vehicle reports
Usage, Site movement history, maintenance/repair history.

#### FR-46: Financial reports
Site expenses, and cost breakdowns by Material, Labour, RMC, Machinery, and Vehicle, rolled up per Site and per Contractor.

**Consequences (testable, applies to FR-42 through FR-46):**
- Every report is scoped to the requesting user's Tenant only — no report can surface another Tenant's data under any filter combination.

### 4.14 Admin Configuration

**Description:** The system's core differentiator: nothing structural is hardcoded. Owner/Admin configures Company branding, Users/Roles, Sites, Inventory (categories/materials/sizes/units/custom fields, §4.2), Labour (employee types/payment structures), Machinery/Vehicle types, Expense/Vendor categories, Report templates/recipients, and Notification channels — all without a code deployment.

#### FR-47: Company/branding configuration
Owner/Admin can set company name, logo, address, contact details, GST details, brand colors, and report branding.

**Consequences (testable):**
- Changing the logo/colors updates FR-32's generated reports on the next report generated, with no separate "publish" step.

#### FR-48: Users, roles, and permissions
Owner/Admin can invite/manage Users and assign Roles within their Tenant (§3 Glossary).

#### FR-49: Labour, machinery, vehicle, and expense-category configuration
Owner/Admin can define/edit Employee types and payment structures, Machine/Vehicle types with custom fields, and Expense/Vendor categories.

#### FR-50: Notification channel configuration
Owner/Admin can configure which channels (WhatsApp/Email/in-app) receive automated reports and to whom.

#### FR-51: Report configuration
Owner/Admin can configure report templates, frequency, and recipients for the report set in §4.13, independent of the daily-DSR delivery configured in FR-50.

**Consequences (testable, applies to FR-47 through FR-51):**
- Every configuration change takes effect for that Tenant only and is retrievable/auditable (who changed what, when) per §4.16.

### 4.15 Multi-Tenant / White-Label Platform

**Description:** The architectural and business precondition for everything above: multiple Contractor companies run on one platform, each fully isolated, each independently branded. Realizes UJ-4. **Architecture note (post-PRD):** isolation is achieved by *deployment*, not by a shared app with logical tenant-scoping — each Tenant is a fully separate, independently deployed instance (own frontend, own database, own auth, own storage), provisioned from one shared codebase. The requirements below describe the guarantee the product must provide; the architecture spine (AD-1, AD-2, AD-11) defines how that guarantee is actually built.

#### FR-52: Tenant provisioning
A new Tenant can be provisioned with its own branding, initial Owner/Admin user, and empty (independently configurable) catalog — as a scripted deployment procedure (create the Tenant's dedicated infrastructure, apply its config, deploy), not an in-app action performed by any user role.

**Consequences (testable):**
- A newly provisioned Tenant starts with zero visibility into any other Tenant's Sites, Materials, Team, Vendors, Expenses, Reports, Documents, or financial data — true by construction, since a Tenant's deployment has no network path to another Tenant's infrastructure, not merely enforced by an application-layer check.

#### FR-53: Tenant-scoped everything
Every feature in §4.1–§4.14 operates within a single Tenant's boundary; no cross-tenant read or write path exists anywhere in the product.

**Consequences (testable):**
- This is the single hardest requirement in the PRD to get wrong quietly if built as a shared app — see NFR-1. Under the deploy-per-tenant architecture actually chosen, it holds structurally (each Tenant's code and data are physically separate), which is a stronger guarantee than application-layer scoping would have provided, at the cost of provisioning being a real deployment step (FR-52) rather than a database insert.

### 4.16 Audit & Transaction History

**Description:** Cross-cutting, but explicit enough in the founder's spec to warrant its own feature: Material, Advance, Machinery/Vehicle, and Payment transactions are never silently overwritten. Every state change is an appended event, not a mutation.

#### FR-54: Append-only transaction history
For Material movement/consumption, Advances/Adjustments, Machinery/Vehicle location changes, and Payments, the system retains every individual transaction, not just a current-state field.

**Consequences (testable):**
- The current-state values shown anywhere in the product (Stock levels, Outstanding Balance, current Machine/Vehicle location, Payment status) are always derivable by replaying the transaction history — if the derived value and a stored "current" value ever disagree, that is a defect.
- No UI path exists to edit or delete a past transaction; corrections are new, linked, transactions (e.g., a correcting entry), preserving the original.
- A correcting transaction requires a reason field to be filled before it can be submitted — an append-only log that permits unlimited unexplained "corrections" is auditable in form only, not in substance, and would not hold up against the government-audit scenario in Open Question 4 if that becomes real.

## 5. Non-Goals (Explicit)

- **No native mobile app in v1.** Responsive web only, per platform decision (§8, Constraints). `[Founder-confirmed]`
- **No formal billing, invoicing, BOQ management, or GST/invoicing workflow.** Expense and cost data exists for the owner to view; no invoice generation or accounting-system integration.
- **No purchase-order workflow, project costing/budgeting module, or approval chains anywhere** — matches the founder's explicit "keep it simple, no unnecessary approval processes" principle.
- **No GPS-based tracking** for vehicles, machinery, or attendance — location is manually recorded, not live.
- **No formal equipment-maintenance-management workflow** beyond the logging in FR-18 — no scheduling/predictive maintenance.
- **No document/drawing management system**, beyond the photos/documents already attached to Purchases, DSRs, and RMC/Expense records.
- **No client portal** for the government/private client side of a contract.
- **No WhatsApp chatbot** — WhatsApp is used one-way for automated report *delivery* (FR-33), not as a conversational input channel.
- **No AI-generated summaries, cost/progress forecasting, or predictive analysis.**
- **No accounting/GST software integration.**

*(All of the above are named in the founder's own "future modules" list and are Phase 2+ candidates, not rejected ideas — see brief `addendum.md` §26.)*

## 6. MVP Scope

**Note on scope philosophy:** the founder explicitly rejected a phased/stripped MVP in favor of taking the pilot contractor the full functional scope below, accepting that it will be tested and refined against live use rather than a truncated first cut. "MVP Scope" here means **v1 scope** — everything in §4 — not a reduced subset. Internal build sequencing (which parts must be structurally correct first — tenancy, the inventory data model, the DSR pipeline) is an engineering/architecture concern, addressed downstream, not a re-litigation of this scope decision.

### 6.1 In Scope (v1)

All of §4.1 through §4.16: multi-site management, configurable material catalog and full inventory lifecycle across all four movement patterns, machinery/vehicle registers, shared labour pool with flexible advances and payments, RMC tracking, the mobile-first offline-capable DSR, automated branded report delivery, the contractor dashboard, vendor management, expense tracking, the core report set, full admin configuration, and multi-tenant white-label architecture with hard tenant isolation.

### 6.2 Out of Scope for v1

Everything listed in §5 Non-Goals. Additionally:
- Regional-language UI (Hindi/other) for the Site Supervisor surface — not requested, but flagged as a real risk given the end-user population; see §10, Open Question 7.
- Native app / installable PWA — explicit platform decision for v1 (§6 below has the NFR detail).

## 7. Cross-Cutting Non-Functional Requirements

- **NFR-1 (Tenant isolation, hard requirement):** No API endpoint, query, report, or UI state may return data belonging to a Tenant other than the authenticated user's, under any input including malformed or adversarial requests. **Resolved by Architecture:** enforced by deployment isolation, not application-layer scoping — each Tenant runs its own separate deployment with its own database, so there is no shared database or shared running instance for a bug to leak across (architecture spine AD-1). This is a stronger guarantee than the RLS/app-layer options originally considered here, at the cost of provisioning being a real per-Tenant deployment rather than a row insert (FR-52).
- **NFR-2 (Mobile DSR performance):** The DSR form must remain fully usable on a low-end Android phone over a 2G/3G-equivalent connection — this is the actual operating environment implied by "offline-capable" (§4.8) and the founder's mobile-first principle. `[ASSUMPTION — no specific device/network target given; recommend confirming a minimum supported device/OS baseline before UX/architecture.]`
- **NFR-3 (Offline sync reliability):** Data queued offline (FR-29) must survive app close, phone restart, and OS-level storage pressure until successfully synced; sync failures must be visible to the Supervisor, not silent.
- **NFR-4 (Notification delivery):** Automated report delivery (FR-33) should have a defined retry policy for transient failures and a visible in-app fallback if WhatsApp/Email delivery ultimately fails, so "the owner never needs to call the supervisor" doesn't silently break.
- **NFR-5 (Auditability):** Every state-changing transaction in §4.16's scope is timestamped and attributed to a User; this is a hard requirement given the product handles other people's money (labour advances, payments) and materials.
- **NFR-6 (Availability):** `[ASSUMPTION]` A specific uptime target (e.g., 99.5%) has not been agreed with the pilot contractor; recommend setting one explicitly once the payment/contract terms (brief, Business Model) are settled — a paying client will have expectations here whether or not they're written down.
- **NFR-7 (Modularity/extensibility):** The founder's own architectural mandate — "API-driven + Modular + Configurable + Scalable + Multi-tenant" — is treated as a hard system-wide constraint, not aspiration: new modules from the Phase 2+ list (§5 Non-Goals) must be addable without rewriting existing modules, and every configuration surface in §4.14 must not require a code deployment to extend.
- **NFR-8 (Provisioning-credential security):** There is no cross-tenant Platform Operator *role* in the product (see §3 Glossary) — but the provisioning capability (FR-52) that spans every Tenant by design still exists, held by whoever has credentials to the provisioning tooling and the underlying cloud accounts (Vercel, database provider, auth provider, storage). Those credentials require multi-factor authentication, are limited to named individuals rather than a shared login, and every provisioning action is logged. A compromised provisioning credential is the single highest-impact breach this product can have, given NFR-1's guarantee is meaningless if the thing that creates Tenants isn't independently secured.

## 8. Constraints and Guardrails

### Timeline and Execution Risk
- The founder's stated timeline is "as soon as possible," stacked against full v1 scope (§6) and multi-tenant architecture from day one (§4.15). That combination is treated honestly, per the brief, as an execution bet rather than a technology moat: the differentiation this product claims over incumbents (§1 Vision) only holds if build quality keeps pace with scope and timeline pressure. This PRD does not resolve that tension — it's named here so Architecture and Epics/Stories sequencing treat it as a real constraint, not an incidental detail.

### Monetization — Pilot Arrangement
- Distinct from the general per-Tenant pricing assumption below: the pilot contractor specifically has agreed to pay based on the quality of the delivered product, not a fixed spec-and-price contract agreed up front. This is a real constraint on "done" for the pilot engagement — quality bar and scope completeness matter contractually, not just as good practice — separate from what a second Tenant's pricing might look like.

### Platform
- Responsive web only for v1, both Owner/Admin and Site Supervisor surfaces. No native app, no installable PWA. `[Founder-confirmed]`
- Offline-capable DSR entry (FR-29) is required despite the "responsive web only" choice — this is a real technical tension (offline queuing typically implies service-worker/local-storage machinery similar to a PWA even without formally shipping one) that architecture needs to resolve explicitly, not something this PRD can resolve on its own.

### Privacy / Data Governance
- Tenant data isolation (NFR-1) is the primary governance concern. Team Member personal data (contact details, wage/advance history) and Site photos (which may capture people) should be handled with basic access-scoping (only that Tenant's Owner/Admin and relevant Supervisors) even though no formal regulatory framework (e.g., India's DPDP Act) has been confirmed as in-scope. `[ASSUMPTION — flagged for legal/compliance confirmation, not assumed resolved.]`

### Cost
- Hosting/storage cost scales with Tenant count and photo volume (DSRs are photo-heavy by design). Given the pricing model itself is unresolved (brief, Business Model open question), cost-per-tenant should be estimated during architecture so it can inform that pricing decision rather than the other way around.

### Integration Dependencies
- Automated report delivery (FR-33) depends on a WhatsApp delivery mechanism (WhatsApp Business API vs. simpler alternatives) and an email delivery service — mechanism choice is a technical/cost decision for `addendum.md`/architecture, not fixed here.
- No integration with accounting, GST, or government-portal systems in v1 (§5 Non-Goals).

### Monetization — Pricing Model
- Unresolved — carried forward from the brief's Business Model open question. `[ASSUMPTION]` Comparable products in this space price per-user or per-Tenant subscription; this PRD assumes a per-Tenant model is likely but does not treat it as decided. This affects whether certain admin-configuration or reporting features should eventually be tier-gated — out of scope to design for that now, but worth flagging before Architecture locks a billing-adjacent data model.

## 9. Success Metrics

### Primary
- **SM-1:** % of active Sites with a DSR submitted for the previous calendar day, measured daily. Target `[ASSUMPTION — not set by founder; recommend ≥90% as a "habit actually formed" bar]`. Validates FR-28, FR-29.
- **SM-2:** Median time to complete and submit a DSR from the mobile surface. Target `[ASSUMPTION — recommend <5 minutes given "must be extremely simple"]`. Validates FR-28, NFR-2.
- **SM-3:** Owner reports (qualitatively, via pilot check-in) that they no longer need to phone supervisors for a same-day status update. Validates FR-32, FR-33, FR-35.

### Secondary
- **SM-4:** Second Tenant successfully onboarded and using the platform independently, tenant-isolation-verified. Validates FR-52, FR-53. Target timeframe `[ASSUMPTION — not set by founder]`.
- **SM-5:** Stock-reconciliation variance (recorded Stock vs. physical spot-check) trends toward zero over the pilot period. Validates FR-14, §4.3.

### Counter-Metrics (Do Not Optimize)
- **SM-C1:** DSR submission rate (SM-1) should not be driven up by supervisors rushing low-quality/inaccurate entries just to hit the number — a fast-but-wrong DSR is worse than a slightly-late accurate one. Counterbalances SM-1, SM-2.
- **SM-C2:** Do not optimize inventory data-entry speed at the expense of accuracy — a fabricated or guessed Stock figure is worse than an honestly-flagged unknown. Counterbalances SM-5.

## 10. Open Questions

1. **Specific pain points behind "manual process causing multiple issues"** were never itemized by the founder despite being asked directly during the brief. Carried forward as unresolved; a validated list from the pilot contractor would sharpen several FR priorities (especially around Advances and Inventory variance reporting).
2. **Payment/pricing model** is unresolved (brief, Business Model). Affects NFR-6 (availability target), the Cost constraint (§8), and whether any features need future tier-gating.
3. **WhatsApp delivery mechanism** (Business API vs. simpler integration) is undecided — cost, approval lead time, and reliability differ significantly between options. Needs resolution before FR-33/NFR-4 can be architected.
4. **Government-specific compliance** (RA bills, progress certification, audit trail for a government audit) — the domain vocabulary (RMC, godown, challan) strongly implies government contract work, but no requirement was confirmed. Currently out of scope; needs an explicit yes/no from the founder before Architecture, since it could imply new FRs (formal report certification, immutable audit export) rather than just NFR tightening.
5. **Offline conflict resolution and sync reliability rule** (UJ-1 edge case, FR-29, NFR-3) — three related gaps, not fully specified: (a) what happens when a DSR is edited twice before syncing, or started on two devices for the same Site/date; (b) what happens on a *partial* sync, where a DSR's core fields sync but a linked photo or Consumption record fails; (c) whether a retry after a failed sync is idempotent (won't create a duplicate DSR/Consumption/Expense record). Low-likelihood individually, but this is the core daily workflow — worth an explicit rule before implementation, not an assumed one.
6. **Exact Role/permission granularity** (§3 Glossary Role entries, FR-48) — e.g., can a Site Supervisor record a direct Vendor→Site purchase (FR-10) unassisted, or does that require Owner/Admin? Assumed permissive for now; needs confirmation.
7. **Regional-language support** for the Site Supervisor UI — not requested by the founder, but a real adoption risk given the likely end-user population for a DSR tool in this segment. Flagged, not assumed either way.
8. **Low-stock threshold ownership** (FR-36) — is this a global per-Material default, a per-Tenant setting, or configurable per-Material-per-Tenant? Assumed per-Material-per-Tenant but not confirmed.
9. **Multi-tenant expansion pipeline is directional, not committed** (carried from the brief's Open Questions Log): the founder has "a few more contractors" they could approach if the pilot succeeds, but no leads are confirmed. SM-4's second-Tenant target and the multi-tenant-from-day-one architecture decision (§4.15, NFR-1) both lean on this being real; worth revisiting if the pipeline doesn't materialize post-pilot.
10. ~~**Tenant-isolation enforcement mechanism** (NFR-1)~~ — **Resolved** by the architecture spine (AD-1): deployment-level isolation (separate deployment + database per Tenant), not RLS or app-layer scoping. See NFR-1's updated text.
11. **Tenant offboarding and data retention** — no requirement exists for what happens if a Tenant (or Team Member, or the pilot itself) leaves the platform: data export, deletion timeline, or retention period. Not urgent for the pilot's launch but should be decided before a second Tenant's contract is signed, since it's a real term a paying client may ask about.
12. **User deactivation** — no explicit requirement covers removing an Owner/Admin's or Site Supervisor's in-app access when they leave the organization (assumed to be a natural extension of FR-48/49 Admin Configuration but not separately specified), nor the ops-level procedure for revoking a departing team member's provisioning-credential access (NFR-8) across Vercel/database/auth/storage accounts.
13. **NFR-2's mobile/network target vs. photo-heavy DSRs** — NFR-2 targets a low-end phone on a 2G/3G-equivalent connection, but FR-30 has Supervisors attaching multiple photos per DSR daily. These two requirements are in tension (large photo uploads over a poor connection) and neither this PRD nor the addendum's cost/sizing notes resolve it — client-side compression helps but Architecture needs to size the actual target explicitly.
14. **Success Metrics (§9) are PRD-authored, not founder-ratified** — worth flagging because the pilot's payment is explicitly quality-contingent (§8, Monetization — pilot arrangement): if "quality" ends up measured against SM-1 through SM-5, those targets should be reviewed and agreed with the founder (and ideally the pilot contractor), not left as this document's inferred defaults.

## 11. Assumptions Index

- §2.2 — Labourers/Team Members are data records, not app users, in v1.
- §2.3 UJ-1 — Offline conflict rule for duplicate/edited DSR entries before sync is unconfirmed.
- §2.3 UJ-2 — Dashboard surfaces a missing DSR as an explicit gap rather than a blank.
- §3 Glossary — In-app Role set (Owner/Admin, Site Supervisor) and exact permission granularity between them are inferred, not confirmed. Platform Operator is no longer a Role assumption — resolved as a credential-level concern by the architecture spine (AD-11).
- §4.2 FR-7 — No cross-tenant shared material catalog/marketplace assumed.
- §4.5 FR-20 — "Fast enough" DSR labour entry is qualitative; no quantified target confirmed (see NFR-2, SM-2 for proposed targets).
- §4.5 FR-20 — Same Team Member at two different Sites on the same date is disallowed (rejected) as the safer v1 default; same-day split-site work was not confirmed as a real requirement.
- §4.3 (Feature-specific NFR) — Negative Stock is rejected rather than allowed-with-override; the alternative (allow with a flag, for delayed-receipt scenarios) was not confirmed.
- §4.6 FR-23 — An Advance Adjustment exceeding the Outstanding Balance is rejected rather than allowed-with-warning; not confirmed with the founder.
- §4.8 FR-28 — Exact "minimal required fields" set for the DSR is inferred, not specified field-by-field.
- §4.9 FR-33 — Retry policy and exact WhatsApp delivery mechanism unresolved (also Open Question 3).
- §4.10 FR-34 — "Per-Site progress" is defined as a DSR-activity proxy (no budget/BOQ exists to compute true percent-complete); zero-Site Tenant empty state is inferred, not specified.
- §4.10 FR-35 — "Flags missing DSR" dashboard behavior is inferred from UJ-2, not explicitly specified by the founder.
- §7 NFR-2 — No specific minimum device/network baseline confirmed for mobile performance.
- §7 NFR-6 — No availability/uptime target agreed with the pilot contractor.
- §8 — Data-governance handling of personal/photo data assumed to need basic access-scoping pending legal/compliance confirmation; no regulatory framework (e.g., DPDP Act) confirmed in-scope.
- §8 — Monetization assumed likely per-Tenant subscription, not confirmed (also brief's Business Model open item).
- §9 SM-1, SM-2, SM-4 — Numeric/timeframe targets are recommended defaults, not founder-set targets.
