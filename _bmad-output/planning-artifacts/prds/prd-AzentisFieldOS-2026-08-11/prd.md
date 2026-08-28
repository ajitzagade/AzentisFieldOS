---
title: "AzentisFieldOS"
created: 2026-08-11
updated: 2026-08-28
status: final
---

# PRD: AzentisFieldOS
*Working title — confirm against the brief's flagged name assumption before this circulates.*

## 0. Document Purpose

This PRD is for the founder/PM driving the build, the engineers implementing it, and the downstream BMad workflows (UX, Architecture, Epics & Stories) that consume it. It builds on `brief.md` and `addendum.md` in `_bmad-output/planning-artifacts/briefs/brief-AzentisFieldOS-2026-08-11/` — the brief's Executive Summary, Problem, and Business Model are not repeated here; this document translates that brief plus the founder's full 30-section functional specification (preserved in the brief's addendum) into testable requirements. Vocabulary is Glossary-anchored (§3); every Functional Requirement (FR) is globally numbered and stable; `[ASSUMPTION]` tags are inline where this draft inferred without explicit confirmation, indexed in §11. This is a Fast-path draft — assumptions should be corrected in review, not treated as settled.

### 0.1 Implementation Status (as of 2026-08-28)

This PRD was drafted 2026-08-11/12, before a single line of code existed. It has now been reconciled against everything actually built — all 14 planned epics, 58 implementation stories (`_bmad-output/implementation-artifacts/`) — so every FR below carries its real delivery status, not just its original intent. Three kinds of change came out of that reconciliation, and they're marked differently throughout:

- **`[RESOLVED — ...]`** tags close out an original `[ASSUMPTION]` or Open Question with what was actually decided/built during implementation (e.g., the negative-stock policy, the offline-sync conflict rule).
- **`[SUPERSEDED — ...]`** tags mark a place where a later, deliberate product decision reversed something this PRD originally stated as settled (e.g., the "no installable PWA" non-goal).
- **`[GAP — ...]`** tags mark a place where the shipped product falls short of what this PRD describes, and no downstream story has picked it up yet — these are real, current shortfalls, not just unconfirmed assumptions, and are also tracked in §10.

**Headline status:** Epics 1–14 are all marked `done` in the sprint tracker (`sprint-status.yaml`, last updated 2026-08-26) except Epic 7 (Advances & Payments), whose four stories are functionally complete and tested but still sit at `review`, not `done`. `apps/api` boots and serves against a real local Postgres; Clerk-backed auth and role-based access (Owner/Admin vs. Site Supervisor) are live. Three integration points remain unverified against real external accounts (Cloudinary, Resend email, and the Clerk→Svix webhook), tenant-provisioning automation (FR-52) is still a script skeleton with no provider calls implemented, and Playwright e2e coverage doesn't exist yet. See `AGENTS.md` at the repo root for the hand-maintained, most-current version of this status list.

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
  - **Edge case:** If Ramesh submits a second DSR for the same site/date before the first has synced, the app treats it as an edit to the queued entry, not a duplicate. `[RESOLVED, see §10 Open Question 5 / FR-29]` upserts per sub-record via client-generated idempotency keys.

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
- **Advance** — Cash given to a Team Member ahead of earned pay. `[RESOLVED — Outstanding Balance is pooled per Team Member, not per individual Advance]` a Team Member with several Advances has one running balance across all of them; an Adjustment reduces that pooled balance, and still names one specific Advance only for audit traceability, never by automatic FIFO allocation across Advances.
- **Advance Adjustment** — An owner-initiated, manually-sized reduction of a Team Member's pooled Outstanding Balance against a Payment. Never automatic.
- **Payment** — A recorded amount paid to a Team Member (weekly, monthly, or daily-wage), net of any Advance Adjustment applied.
- **RMC (Ready-Mix Concrete)** — Concrete purchased from an external vendor, tracked by volume (m³), grade, and cost, separate from Material inventory.
- **Daily Site Report (DSR)** — The Site Supervisor's once-daily structured log of a Site's activity, labour, material, RMC, machinery/vehicle use, expenses, issues, and photos.
- **Vendor** — A supplier of Material, RMC, or services, with purchase and payment history.
- **Expense** — Any recorded cost not otherwise captured as a Purchase (fuel, repairs, transport, misc.), tied to a Site and Category.
- **Role** — **Owner/Admin** (full tenant access, configuration, all sites) and **Site Supervisor** (mobile DSR entry, scoped to assigned Site(s) day-to-day, not permanently bound to one) are the only in-app roles — there is no in-app "Platform Operator" role (see below). `[RESOLVED — exact role set]` confirmed as exactly these two (Story 14.2); the first-ever User created in a Tenant auto-bootstraps as Owner/Admin, every subsequent first-seen user defaults to Site Supervisor until an Owner/Admin changes it. `[GAP — permission granularity]` beyond that role split, per-endpoint authorization is only actually enforced for the Users-admin screens (FR-48) and the Category Configuration screens (FR-49) — every other epic's write endpoints require a valid session but are not yet role-gated, so a dedicated pass applying `@Roles()` checks where the FR text implies an Owner/Admin-only action (e.g., FR-10's "or Site Supervisor, if permitted") is still real, unstarted work.
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
- `[RESOLVED — verification status]` at the time this FR was implemented (Story 4.2), `Material.unitId` was the only Unit reference anywhere in the schema, so there was structurally nothing yet for drift to occur against. This guarantee should be re-verified now that Epic 5's transaction tables exist, since that's the first point real drift becomes possible.

#### FR-7: Custom fields on materials
Owner/Admin can add Custom Fields to a Material definition. `[RESOLVED — shape]` a Material's `customFields` is a JSON array of up to 20 `{ label, type }` entries, where `type` is a closed 3-value enum (`TEXT` / `NUMBER` / `DATE`) — this shape was left fully unspecified by the original PRD and is now the implemented contract. `[GAP]` only the field *definition* is persisted — rendering a Material's Custom Fields on the actual Purchase/Movement/Consumption entry forms (so a value can be captured against them) has not been built.

**Out of Scope:**
- Cross-tenant shared material libraries or a marketplace of predefined catalogs — each Tenant's catalog is independent. `[ASSUMPTION]`

### 4.3 Inventory Lifecycle & Movement

**Description:** Every unit of Material is tracked through Opening Stock → Purchase → Godown Stock → Site Transfer → Site Stock → Consumption → Return/Wastage → Closing Stock, as a transaction history, not a single overwritten quantity. Supports all four real movement patterns the founder specified: Vendor→Godown, Godown→Site, Vendor→Site (direct), Site→Site. Realizes UJ-2.

#### FR-8: Record a Purchase (to Godown or direct to Site)
Owner/Admin can record a Purchase specifying Vendor, Material, Size, quantity, Unit, rate, total amount, invoice/challan number, payment status, delivery location, vehicle details, notes, and destination (Godown or a specific Site), with optional photos/documents.

**Consequences (testable):**
- A Purchase destined for Godown increases Godown Stock for that Material/Size by the recorded quantity; a Purchase destined for a Site increases that Site's Stock directly and never touches Godown Stock.
- Every Purchase is individually retrievable later — no merging into a running total that loses the original entry.
- `[RESOLVED — correction mechanism]` a correcting Purchase's quantity is a **signed delta** applied to the running balance, not a restated total — this is now the standard correction shape for every transaction-history model in §4.16 except Payment and Machinery/Vehicle movement (see FR-24, FR-17).

#### FR-9: Godown → Site material movement
Owner/Admin can record a transfer of a Material/Size/quantity from Godown to a Site, capturing vehicle, person responsible, and received quantity (which may differ from sent quantity).

**Consequences (testable):**
- Godown Stock decreases by the sent quantity at the moment the transfer is recorded; Site Stock increases by the *received* quantity once receipt is confirmed.
- A shortage/damage gap (sent minus received) is captured as its own recorded value, not silently dropped.
- `[RESOLVED — receipt confirmation vs. append-only]` confirming receipt is implemented as the one narrow, deliberate exception to §4.16's append-only rule: it sets `receivedQuantity` exactly once (from null), which is treated as *completing* one event rather than *revising* history, and a race-safe guard blocks a second confirmation on the same Movement. `[GAP]` confirming receipt on a *correcting* Movement (a negative-quantity correction row) is unaddressed — no story has specified what "receiving" a correction means.

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
- `[GAP]` Consumption-vs-total-received variance reporting is not built — no story has implemented this comparison anywhere in Reports (§4.13).

#### FR-13: Record Return/Wastage
Owner/Admin or Site Supervisor can record Material as returned or wasted, distinct from Consumption.

**Consequences (testable):**
- Return/Wastage is tracked as its own transaction type and does not silently reduce Stock as if it were Consumption — Reports can distinguish the two.
- `[RESOLVED — direction]` both Return and Wastage decrease Site Stock identically; "Return" here means material leaving the Site back to a Vendor, not back to Godown. `[GAP]` a Site→Godown return has no transaction type at all — Material sent back to Godown from a Site currently has no recorded path back into Godown Stock.

#### FR-14: Full lifecycle visibility per Material/Site/Godown
Owner/Admin can view, for any Material (and Size), current Godown Stock, current Site Stock (per Site and totaled), total purchased, transferred, consumed, returned, wasted, and remaining — derived from the transaction history, not a manually maintained running total.

**Consequences (testable):**
- The sum of (Opening + Purchased + Transferred In) − (Transferred Out + Consumed + Returned/Wasted) reconciles to displayed current Stock at all times; any mismatch is a defect, not an accepted state. `[RESOLVED]` proven directly by an integration test that independently re-sums every transaction table via `aggregate()` and asserts it matches the materialized Stock balance.
- `[GAP]` the ₹-value stat tiles (Godown Stock Value, Site Stock Value) implied by the UX mockup render as an honest `—` placeholder — no "current unit cost" concept exists in the data model (Purchase rate varies purchase-to-purchase), so there is no defensible valuation formula yet.

**Feature-specific NFRs:**
- No transaction in FR-9, FR-11, or FR-12 may reduce a Godown Stock or Site Stock value below zero for a given Material/Size — the system rejects (or requires an explicit, separately recorded negative-stock override for) any transfer or consumption that would do so. `[RESOLVED — reject, no override]` implemented as a race-safe hard reject (an atomic conditional update, not read-then-write) with no override path. This was flagged as a real product-risk tradeoff in the original draft (delayed-receipt scenarios can make paper stock legitimately go negative) and remains worth a founder confirmation — an override path is unbuilt, not rejected as an idea.

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
- `[RESOLVED — correction mechanism]` unlike Purchase/Material corrections (signed delta), a correcting Machinery/Vehicle movement is a **full restatement** of the movement's fields — the second of two distinct correction-payload shapes now in use (see FR-24 for the third).

#### FR-18: Fuel, maintenance, and repair logging
Owner/Admin can log fuel use, maintenance, and repair events against a Machine or Vehicle.

**Consequences (testable):**
- Logged maintenance events are retrievable as a service history list per asset, ordered by date.

**Notes:** GPS-based real-time tracking is explicitly deferred (§5 Non-Goals) — "current Site" here means the last manually recorded location, not live position.

### 4.5 Labour & Team Management

**Description:** A single, tenant-wide Team Member database. Nobody is permanently assigned to a Site — the same person may work different Sites on different days, and the system records *where they actually worked*, not where they're "assigned." Realizes UJ-1.

#### FR-19: Team Member records
Owner/Admin can add a Team Member with name, role/designation, contact details, and employment/payment type (monthly, weekly, or daily-wage). `[RESOLVED]` Employment Type is admin-configurable master data (an `EmploymentType` table, not a hardcoded enum), seeded with these three as day-one defaults — realizing FR-49 ahead of Epic 14.

**Consequences (testable):**
- A Team Member is not bound to any single Site at creation and never becomes bound to one — Site association only ever comes from Work Records (FR-20).

#### FR-20: Daily Work Record
Site Supervisor (via DSR) or Owner/Admin can record which Team Members worked at a given Site on a given date, with attendance, optional hours, and overtime.

**Consequences (testable):**
- A Team Member can have Work Records at two different Sites on two different dates within the same week with no conflict or warning — this is expected behavior, not an edge case.
- A Team Member cannot have two Work Records at two *different* Sites on the *same* date — the system rejects the second entry rather than silently allowing it, to prevent payroll double-counting. `[ASSUMPTION — same-day split-site work (e.g., half-day at each of two Sites) is real in this industry but was not confirmed as a v1 requirement; disallowing it is the safer default until confirmed. See §10 Open Questions.]` `[RESOLVED — mechanism]` enforced via a Postgres advisory lock, not a database unique constraint — the constraint was deliberately relaxed to let a DSR correction (§4.16) insert a new Work Record sharing a crew member/date with the report it corrects; the rejection guarantee itself is unchanged.
- Entry is fast enough for mobile use: attendance for a known/recent crew defaults from the previous day's entry rather than requiring re-selection of every name. `[ASSUMPTION — "fast enough" not quantified, see NFR-2]` `[RESOLVED — default source]` "previous day" means the most recent date that Site has any attendance recorded, not literally `date − 1`.

#### FR-21: Site-wise work history per Team Member
Owner/Admin can view any Team Member's full history of which Sites they worked, when.

**Consequences (testable):**
- History is queryable by Team Member (across all Sites) and by Site (across all Team Members who worked there).

### 4.6 Labour Advances & Payments

**Description:** Cash advances and payments are tracked with complete flexibility — the owner decides when and how much of an outstanding Advance to recover against any given Payment. The system never auto-deducts. No mandatory approval workflow exists anywhere in this feature. Realizes UJ-3.

#### FR-22: Record an Advance
Owner/Admin can record an Advance to a Team Member: amount, date, reason/notes, payment method.

**Consequences (testable):**
- Recording an Advance immediately updates that Team Member's Outstanding Balance (Total Advance − Total Adjusted) with no approval step blocking the entry. `[RESOLVED — pooling]` this balance is materialized on the Team Member (`outstandingAdvanceBalance`), pooled across all of that Team Member's Advances, not tracked per individual Advance — see §3 Glossary.

#### FR-23: Record an Advance Adjustment
Owner/Admin can record an Advance Adjustment of any amount, at any time, against any Payment (or standalone).

**Consequences (testable):**
- An Advance's Outstanding Balance changes *only* when an explicit Adjustment is recorded — it is mathematically impossible for a Payment to reduce it without one.
- Adjustment history is a full log (date, amount, linked Payment if any), not a single "amount adjusted" field.
- An Adjustment amount cannot exceed the Team Member's current pooled Outstanding Balance — the system rejects an over-adjustment rather than allowing the balance to go negative. `[RESOLVED — reject, no override]` implemented as a race-safe hard reject (same atomic-conditional-update pattern as the negative-stock guard, §4.3), with an inline UI hint showing the cap before submission. As with the stock override, a founder confirmation that reject (not warn-and-allow) is the right call for messy real-world reconciliation is still worth getting.

#### FR-24: Record a Payment
Owner/Admin can record a Payment to a Team Member (weekly, monthly, or daily-wage) composed of Base Pay + Additional Amounts − Actual Deductions − Advance Adjustment (if any) = Net Payable.

**Consequences (testable):**
- Payment Status (paid/pending) and full Payment History are retained per Team Member; no payment record is overwritten by a later one. `[RESOLVED — status lifecycle]` `pending → paid` is a one-directional, non-reversible transition, not routed through the append-only correction mechanism (same reasoning as FR-9's receipt confirmation).
- Omitting an Advance Adjustment on a Payment is valid and does not trigger any warning or requirement — matches the founder's explicit "never automatic" principle.
- `[RESOLVED — correction mechanism]` a correcting Payment is a **complete new Payment row** (all four inputs re-entered, `netPayable` recomputed), not a signed delta — the third and last of the three correction-payload shapes now in use across the product (delta: Purchase/Material/RMC/Expense/Advance/Adjustment; full restatement: Machinery/Vehicle movement; complete-new-row: Payment).

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
- A DSR form's required fields are minimal; every list-selection field (Material, Team Member, Machinery) uses search/dropdown/recently-used defaults, never free-typing from scratch. `[ASSUMPTION — exact "minimal required fields" set not specified, see §11]` `[GAP — partially met]` this holds for Materials (Epic 4 shipped its list endpoint); reference-data pickers for Team Members, Vendors, Expense Categories, and Machinery/Vehicles should be re-verified against their now-shipped list endpoints, since they originally fell back to plain ID-entry text inputs pending those epics.

#### FR-29: Offline DSR entry and sync
Site Supervisor can complete and submit a DSR with no network connectivity; the entry queues on-device and syncs automatically when connectivity returns.

**Consequences (testable):**
- A DSR completed fully offline is never lost due to app close, phone lock, or connectivity never returning within the same session — it persists locally until synced. `[RESOLVED — mechanism]` implemented via Dexie (IndexedDB), not a service worker — direct browser-local persistence, triggered by both the `online` browser event and a 20-second poll fallback (mobile browsers don't reliably fire `online`).
- The Supervisor receives clear on-device confirmation of "saved, pending sync" vs. "synced" states.
- `[RESOLVED — offline conflict rule, closes §10 Open Question 5]` a second submission for the same Site/date (online or offline-retried) upserts rather than rejecting or duplicating — idempotency is keyed per sub-record (a client-generated id on each Consumption/RMC Entry/Expense row, set at queue-write time), matching architecture spine AD-8. Retries are proven idempotent by a live-database integration test. `[GAP]` if the DSR submission itself falls into the offline queue, any photos staged in the same form do not auto-upload once that queued submission later syncs — the Supervisor must re-attach them once back online with the now-synced report open. A fully offline-durable photo queue is real, unimplemented follow-up work.

**Out of Scope:**
- Real-time collaborative editing of the same DSR by two Supervisors simultaneously.

#### FR-30: Multiple photos per DSR
Site Supervisor can attach multiple photos to a DSR, each automatically associated with Site, date, DSR, and uploader.

**Consequences (testable):**
- Photos remain queryable later as a chronological Site progress gallery (FR-31), not just embedded in the DSR record.
- `[RESOLVED — storage mechanism]` photos upload directly from the browser to Cloudinary via a signed direct-upload request (`apps/api` mints the signature, never proxies the bytes — NFR-5/AD-3); delivery is a public CDN URL. `[GAP]` this round-trip has never been exercised against a real Cloudinary account in any environment — only mocked in tests. Client-side photo compression before upload (recommended in the original addendum, given NFR-2's low-end-device target) has not been implemented.

#### FR-31: Site photo/progress history
Owner/Admin can browse a Site's photos chronologically across all its DSRs as a running progress diary.

**Consequences (testable):**
- Photo gallery view requires no manual tagging beyond what FR-30 already captured automatically.

### 4.9 Automated Report Generation & Delivery

**Description:** At the end of each day, the system compiles a branded, presentable report per Site from that day's DSR and delivers it to the owner without the owner asking for it.

#### FR-32: Auto-generate branded daily report
System compiles a per-Site daily report containing company branding/logo, project info, date, and the full DSR content (work summary, labour, materials, RMC, machinery, vehicles, expenses, issues, progress, photos, remarks).

**Consequences (testable):**
- Report branding (logo, company name, colors) reflects the Tenant's own configuration (§4.14), never another Tenant's, and never a generic default once branding is configured. `[RESOLVED]` the report's content is a JSON snapshot frozen at generation time, so a later branding change never silently retroactively alters an already-delivered report.
- `[GAP]` this auto-compile/deliver mechanism covers only the one daily per-Site report — weekly/monthly *auto-scheduled* delivery of the Site/Inventory/Labour/Machinery/Financial report set (§4.13) was not built under FR-32/33; Story 14.5 built a separate, admin-configurable multi-cadence scheduler for that instead (see FR-51).

#### FR-33: Automated delivery via WhatsApp/Email/in-app
System delivers the generated daily report to the Owner/Admin automatically, through configured channels.

**Consequences (testable):**
- Delivery is attempted without any manual "send" action by the Supervisor or Owner once a DSR is submitted for the day.
- A failed delivery (e.g., WhatsApp API error) is retried and, if that fails, surfaced as a visible failure in-app, never silently dropped. `[RESOLVED — retry policy]` up to 3 attempts via a dedicated retry-sweep cron job (not in-process backoff); after the 3rd failure the delivery is marked `FAILED` and surfaced via an in-app status badge, no further retry. `[GAP — WhatsApp mechanism still open, see §10 Open Question 3]` **In-App and Email channels are live** (Email via a direct Resend API integration — never yet exercised against a real Resend account); **WhatsApp is not** — it's wired behind a delivery-channel adapter interface but the underlying sender is a placeholder that fails every attempt with an honest "BSP not yet selected" error, since the WhatsApp Business API vendor decision is still unmade. `[GAP]` the daily compile/delivery cron's schedule hour and "today" boundary are unconfirmed placeholders (`vercel.json`, computed in UTC) pending an explicit product-owner decision on delivery time and timezone.

### 4.10 Contractor Dashboard

**Description:** A centralized rollup giving the owner both high-level visibility and detailed drill-down, across Projects, Today's Activity, Inventory, Team, and Machinery/Vehicles. Realizes UJ-2.

**Delivery status:** `[GAP]` the epic that built this section (Epic 12) scoped itself to FR-34/FR-35 only — FR-36 through FR-38 as dedicated dashboard sections were **not built**. A differently-framed "Overall" rollup (Active Sites, Inventory low-stock count, Outstanding Advances, Pending Payments — 4 cards, not the FR-36/37/38 structure below) covers fragments of FR-36/37 only. Team and Machinery/Vehicle summaries (FR-37, FR-38) have no dashboard presence at all. This is a real, current scope gap against this PRD's Contractor Dashboard description, not a stylistic difference — treat FR-36 through FR-38 below as not-yet-built until a follow-up story picks them up.

#### FR-34: Projects summary
Dashboard shows total/active/completed Sites and per-Site progress at a glance, where "progress" is defined as the recency and volume of DSR activity logged against the Site rather than a percent-complete figure — no budget, schedule baseline, or BOQ exists in v1 (§5 Non-Goals) to compute completion percentage against. `[ASSUMPTION — "per-Site progress" was undefined by the founder; this activity-based proxy is the simplest v1 interpretation, not a confirmed one.]` `[GAP]` no progress proxy of any kind is computed or displayed — the Sites preview grid shows only status badges (Active/On Hold/Completed) and name, not the DSR-activity signal this FR describes.

**Consequences (testable):**
- A Tenant with zero Sites shows an explicit empty state ("no Sites yet") rather than a blank or broken dashboard. `[RESOLVED]` built as a single whole-page empty state (replacing Today/Overall/Sites content) with a "Create your first Site" call to action.
- Per-Site progress updates the same day a DSR is logged against that Site, with no manual refresh step. *(Not testable yet — see the progress-proxy gap above.)*

#### FR-35: Today's activity summary
Dashboard shows, for the current date across all Sites: activities logged, labour working, materials received/consumed, RMC used, machinery/vehicles in use, expenses, photos, and open issues — and flags any Site with no DSR yet for today. `[RESOLVED — "flags missing DSR" behavior]` built exactly as described: one `GapFlag` per missing Site (never a combined message). All seven same-day figures are computed in the deployment's local calendar day (`Asia/Kolkata` by default via `Intl.DateTimeFormat`), not UTC, closing a real day-boundary bug caught during implementation.

#### FR-36: Inventory summary `[GAP — not built as a dashboard section, see status note above]`
Dashboard shows Godown stock, Site-wise stock, low-stock materials (against an admin-defined threshold), and recent purchases/transfers/consumption.

**Consequences (testable):**
- A Material dropping below its configured low-stock threshold appears on the dashboard without a manual report run. `[PARTIAL]` a low-stock *count* appears on the "Overall" rollup card; the full stock/recent-activity breakdown this FR describes is not on the dashboard (it exists as a dedicated Inventory Reports view, §4.13).

#### FR-37: Team summary `[GAP — not built as a dashboard section, see status note above]`
Dashboard shows total Team Members, today's working headcount, weekly/monthly payment totals, and total outstanding Advances.

**Consequences (testable):**
- Today's working headcount reconciles exactly to the count of distinct Team Members with a Work Record (FR-20) dated today, across all Sites. `[PARTIAL]` this exact computation exists (Epic 6's team-summary endpoint, reused by other screens) and an outstanding-Advances total appears on the "Overall" rollup card, but none of it is surfaced as a Team dashboard section.

#### FR-38: Machinery & Vehicle summary `[GAP — not built at all, see status note above]`
Dashboard shows available vs. in-use counts, per-Site allocation, and assets flagged for maintenance.

**Consequences (testable, applies to FR-34 through FR-38):**
- Every summary tile supports drill-down into the underlying detailed records (FR-2, §4.13 Reports) — the dashboard is a view, not a dead end. Holds for the tiles that exist (FR-34, FR-35, and the "Overall" card fragments of FR-36/37).

### 4.11 Vendor Management

**Description:** A simple Vendor database supporting the Purchase and RMC workflows.

#### FR-39: Vendor records
Owner/Admin can add a Vendor with name, contact person, phone, email, address, and materials/services supplied. `[RESOLVED — shape]` "materials/services supplied" is a list of discrete tags, not free text. `[RESOLVED]` a Vendor is immediately available in every Purchase/RMC picker across the product — this required retrofitting a real Vendor picker into forms that Epic 5 had shipped earlier with a free-text `vendorId` stopgap.

#### FR-40: Vendor purchase history
Owner/Admin can view, per Vendor, the full chain: Purchases → Materials → Quantity → Amount, and payment status.

**Consequences (testable):**
- A Vendor's total purchase amount displayed matches the sum of that Vendor's individual Purchase records exactly.
- `[RESOLVED — outstanding-amount framing]` shown as "₹X not marked Paid" (sum of all non-Paid Purchase totals), not an exact "amount due" — the schema has no field tracking partial-payment amounts on a `PARTIAL`-status Purchase, so an exact remaining balance can't be honestly computed yet. An append-only Vendor payment ledger (analogous to Team Member Payments, §4.6) would close this; not built, no FR currently asks for it.

### 4.12 Expense Tracking

**Description:** Simple, Site-linked expense capture across categories the founder specified: material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, and misc.

#### FR-41: Record an Expense
Owner/Admin or Site Supervisor (via DSR) can record an Expense: date, Site, category, amount, description, payment method, person/vendor, optional supporting document/photo.

**Consequences (testable):**
- Expense Categories are admin-configurable (§4.14), not a hardcoded list. `[RESOLVED]` seeded with the founder-specified defaults: Material, Labour, Machinery & Vehicle, Fuel, Repairs, Transportation, Site Expenses, RMC, Misc.
- `[GAP]` the "optional supporting document/photo" is not implemented — no shared file-upload primitive exists outside the DSR photo flow's bespoke Cloudinary integration; the Expense form ships without it.
- `[GAP]` `Expense.purchaseId` exists in the schema, reserved for reconciling an Expense against a Purchase (so Financial Reports, FR-46, doesn't double-count), but no picker or reconciliation logic uses it yet.

### 4.13 Reports

**Description:** A defined set of useful, non-overwhelming reports across Site, Inventory, Labour, Machinery, Vehicle, and Financial domains — not open-ended analytics.

#### FR-42: Site reports
Daily Site Report history, progress report, activity history, photo history — per Site, filterable by date range.

#### FR-43: Inventory reports
Current/Godown/Site stock, consumption, purchase, movement, wastage, and low-stock reports, matching the lifecycle data model in §4.3. `[GAP]` no combined all-Site stock view exists when no single Site is selected — Site Stock is exposed one Site at a time (Godown stock, low-stock, and transaction history all still work unfiltered).

#### FR-44: Labour reports
Attendance, work history, weekly/monthly payments, advance outstanding, and advance adjustment history.

#### FR-45: Machinery & Vehicle reports
Usage, Site movement history, maintenance/repair history.

#### FR-46: Financial reports
Site expenses, and cost breakdowns by Material, Labour, RMC, Machinery, and Vehicle, rolled up per Site and per Contractor. `[GAP — structural, not a bug to fix]` Labour and Machinery/Vehicle costs cannot be attributed per-Site: `Payment` has no `siteId` (Team Members aren't Site-bound, per FR-19) and Machinery/Vehicle service logs belong to the asset, not a Site visit. Per-Site rows show these two categories as an explicit "not tracked per-Site" state, never a fabricated ₹0; only Material, RMC, and Expenses are genuinely Site-attributable. Contractor-level totals are correct and reconcile for all five categories — the gap is Site-level attribution for two of the five, and it's a data-model boundary the current schema can't close without a design change (e.g., binding Payments/service logs to a Site somehow), not an oversight to patch.

**Consequences (testable, applies to FR-42 through FR-46):**
- Every report is scoped to the requesting user's Tenant only — no report can surface another Tenant's data under any filter combination. `[RESOLVED]` proven for Site/Inventory reports by an automated test asserting no cross-tenant-scoping code exists at all (AD-1's deploy-per-tenant isolation makes this true by construction, not by an application-layer filter).

### 4.14 Admin Configuration

**Description:** The system's core differentiator: nothing structural is hardcoded. Owner/Admin configures Company branding, Users/Roles, Sites, Inventory (categories/materials/sizes/units/custom fields, §4.2), Labour (employee types/payment structures), Machinery/Vehicle types, Expense/Vendor categories, Report templates/recipients, and Notification channels — all without a code deployment.

#### FR-47: Company/branding configuration
Owner/Admin can set company name, logo, address, contact details, GST details, brand colors, and report branding. `[RESOLVED]` no GSTIN checksum validation — length-bounded only.

**Consequences (testable):**
- Changing the logo/colors updates FR-32's generated reports on the next report generated, with no separate "publish" step. `[RESOLVED]` confirmed — singleton config row, no draft/publish state.

#### FR-48: Users, roles, and permissions
Owner/Admin can invite/manage Users and assign Roles within their Tenant (§3 Glossary). `[RESOLVED]` built on Clerk's Invitations API (invitation state lives in Clerk, not a new Postgres table) plus a `user.created`/`user.updated` webhook as the authoritative role source. `[GAP]` `user.deleted` is a deliberate no-op (preserves foreign-key history on past transactions) — full deprovisioning of a departing user's access is unaddressed; see §10 Open Question 12.

#### FR-49: Labour, machinery, vehicle, and expense-category configuration
Owner/Admin can define/edit Employee types and payment structures, Machine/Vehicle types with custom fields, and Expense/Vendor categories. `[GAP]` Machine/Vehicle Types got the add/edit/disable lifecycle this FR describes, but **not** custom fields — no custom-fields mechanism exists for Machinery/Vehicle Types (unlike Materials, FR-7). `[GAP]` "Vendor categories" was never built — only Expense Categories exist; Vendors themselves (§4.11) have no category concept in the current schema.

#### FR-50: Notification channel configuration
Owner/Admin can configure which channels (WhatsApp/Email/in-app) receive automated reports and to whom. `[RESOLVED — build status]` fully configurable per-channel enable/disable + recipient list; seeded to match the pre-existing hardcoded defaults (Email + In-App enabled, WhatsApp disabled) so day-one behavior didn't silently change when this shipped. Toggling WhatsApp "on" here does not make delivery work — see FR-33's gap note.

#### FR-51: Report configuration
Owner/Admin can configure report templates, frequency, and recipients for the report set in §4.13, independent of the daily-DSR delivery configured in FR-50. `[RESOLVED]` built as a genuinely separate scheduler (its own Cron job, own model) — a dedicated automated test asserts the two delivery paths never touch each other's data, structurally (not just conventionally) satisfying the "independent of FR-50" requirement. `[GAP]` delivered scheduled-report content is a branded notification envelope (report type + date window), not a fully-rendered per-type email body — richer per-type templates are named follow-up work.

**Consequences (testable, applies to FR-47 through FR-51):**
- Every configuration change takes effect for that Tenant only and is retrievable/auditable (who changed what, when) per §4.16. `[GAP]` the "auditable" half of this is not built for any config model in this section (Branding, Notification Channels, Report Schedules, the four Category-config tables, or User role changes) — every one is a plain in-place update with no change-history table. Configuration changes take effect correctly; only the audit trail this PRD promises is missing.

### 4.15 Multi-Tenant / White-Label Platform

**Description:** The architectural and business precondition for everything above: multiple Contractor companies run on one platform, each fully isolated, each independently branded. Realizes UJ-4. **Architecture note (post-PRD):** isolation is achieved by *deployment*, not by a shared app with logical tenant-scoping — each Tenant is a fully separate, independently deployed instance (own frontend, own database, own auth, own storage), provisioned from one shared codebase. The requirements below describe the guarantee the product must provide; the architecture spine (AD-1, AD-2, AD-11) defines how that guarantee is actually built.

#### FR-52: Tenant provisioning
A new Tenant can be provisioned with its own branding, initial Owner/Admin user, and empty (independently configurable) catalog — as a scripted deployment procedure (create the Tenant's dedicated infrastructure, apply its config, deploy), not an in-app action performed by any user role. `[GAP]` `pnpm provision <tenant-slug>` (`infra/provisioning/provision.ts`) is a skeleton only — the actual provider API calls (Vercel, Neon, Clerk, Cloudinary) are not implemented. Provisioning a real second Tenant today would still require hand-driving each provider's console, which AD-2 explicitly says never to do. This is the single largest gap between this PRD's multi-tenant premise (§1 Vision, UJ-4) and what's actually automatable right now — directly blocks SM-4.

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
- The current-state values shown anywhere in the product (Stock levels, Outstanding Balance, current Machine/Vehicle location, Payment status) are always derivable by replaying the transaction history — if the derived value and a stored "current" value ever disagree, that is a defect. `[RESOLVED]` these values are materialized (written once at transaction time, e.g. `outstandingAdvanceBalance`, `GodownStock`/`SiteStock`), not recomputed on every read — proven consistent with the replayed history via dedicated reconciliation tests, per FR-14/FR-25.
- No UI path exists to edit or delete a past transaction; corrections are new, linked, transactions (e.g., a correcting entry), preserving the original. `[RESOLVED — three correction-payload shapes now exist]` (1) **signed delta** — Purchase, Movement, Consumption, Return/Wastage, RMC Entry, Expense, Advance, Advance Adjustment; (2) **full restatement** — Machinery/Vehicle movement; (3) **complete new row, all fields re-entered** — Payment. Which shape applies to a given model is now a settled implementation decision, documented inline in each model's story, not left to the PRD's abstract "corrections are new, linked transactions" framing alone. Two narrow, deliberate exceptions exist where a field is set exactly once rather than corrected: Movement's `receivedQuantity` (FR-9) and Payment's `pending→paid` status (FR-24).
- A correcting transaction requires a reason field to be filled before it can be submitted — an append-only log that permits unlimited unexplained "corrections" is auditable in form only, not in substance, and would not hold up against the government-audit scenario in Open Question 4 if that becomes real. `[GAP — narrower scope than the FR implies]` this holds for the transaction-history models named above. It does **not** extend to admin-configuration changes (Branding, Notification Channels, Report Schedules, Category configs, User role assignment) — see FR-47–51's audit-trail gap, and to Work Records, which were deliberately excluded from this pattern (attendance correction has no audit-trail requirement unless a future story raises one explicitly).

## 5. Non-Goals (Explicit)

- **No native mobile app in v1.** Responsive web only, per platform decision (§8, Constraints). `[Founder-confirmed]` `[SUPERSEDED — installable PWA, 2026-08-26]` the "no installable PWA" half of this decision was explicitly reversed by a later, human-approved product direction (Story 1.9): the app now ships a real manifest, service worker, and Android/iOS "Add to Home Screen" flow, for both roles, framed as fixing field use that felt "fragile and non-app-like" without it. "No *native* app" (i.e., no App Store/Play Store binary) still holds — only the installable-PWA half changed.
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
- ~~Native app / installable PWA~~ — `[SUPERSEDED, see §5]` installable PWA shipped 2026-08-26; only a native (App/Play Store) app remains out of scope.
- End-to-end (Playwright) test coverage — not built yet; add when there's a real cross-app flow worth testing.

## 7. Cross-Cutting Non-Functional Requirements

- **NFR-1 (Tenant isolation, hard requirement):** No API endpoint, query, report, or UI state may return data belonging to a Tenant other than the authenticated user's, under any input including malformed or adversarial requests. **Resolved by Architecture:** enforced by deployment isolation, not application-layer scoping — each Tenant runs its own separate deployment with its own database, so there is no shared database or shared running instance for a bug to leak across (architecture spine AD-1). This is a stronger guarantee than the RLS/app-layer options originally considered here, at the cost of provisioning being a real per-Tenant deployment rather than a row insert (FR-52).
- **NFR-2 (Mobile DSR performance):** The DSR form must remain fully usable on a low-end Android phone over a 2G/3G-equivalent connection — this is the actual operating environment implied by "offline-capable" (§4.8) and the founder's mobile-first principle. `[ASSUMPTION — no specific device/network target given; recommend confirming a minimum supported device/OS baseline before UX/architecture.]`
- **NFR-3 (Offline sync reliability):** Data queued offline (FR-29) must survive app close, phone restart, and OS-level storage pressure until successfully synced; sync failures must be visible to the Supervisor, not silent. `[RESOLVED]` see FR-29 — Dexie/IndexedDB-backed, per-sub-record idempotent upsert.
- **NFR-4 (Notification delivery):** Automated report delivery (FR-33) should have a defined retry policy for transient failures and a visible in-app fallback if WhatsApp/Email delivery ultimately fails, so "the owner never needs to call the supervisor" doesn't silently break. `[RESOLVED]` see FR-33 — 3 retry attempts via a dedicated cron, in-app status badge on final failure.
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
- Responsive web only for v1, both Owner/Admin and Site Supervisor surfaces. No native app. `[Founder-confirmed]` `[SUPERSEDED — see §5]` an installable PWA (manifest + service worker + Add to Home Screen) shipped 2026-08-26, superseding the original "no installable PWA" half of this constraint.
- Offline-capable DSR entry (FR-29) is required despite the "responsive web only" choice — this is a real technical tension (offline queuing typically implies service-worker/local-storage machinery similar to a PWA even without formally shipping one) that architecture needs to resolve explicitly, not something this PRD can resolve on its own. `[RESOLVED]` implemented via Dexie/IndexedDB directly, independent of the (now also shipped) PWA service worker — see FR-29.
- **In-app shell/navigation** (not originally named as a Platform constraint, added here since it became a real decision): the original UX spec (`EXPERIENCE.md`) specified sidebar navigation for Owner/Admin and a minimal top bar for Site Supervisor as a *role* distinction, never a viewport breakpoint. As of 2026-08-27/28, this has been superseded by a "every role gets the same sidebar-driven shell" direction (the only remaining role difference is that the Settings nav item is Owner/Admin-only, since it 404s server-side for a Site Supervisor). **Status note:** this change is present in the working tree but was not yet a committed change as of this PRD's last reconciliation (2026-08-28) — confirm it has landed before treating it as final.

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

*Renumbered items keep their original number for traceability; resolved ones are struck through with a pointer to where the resolution lives. New items found during the 2026-08-28 implementation reconciliation (§0.1) are appended at the end.*

1. **Specific pain points behind "manual process causing multiple issues"** were never itemized by the founder despite being asked directly during the brief. Carried forward as unresolved; a validated list from the pilot contractor would sharpen several FR priorities (especially around Advances and Inventory variance reporting).
2. **Payment/pricing model** is unresolved (brief, Business Model). Affects NFR-6 (availability target), the Cost constraint (§8), and whether any features need future tier-gating.
3. **WhatsApp delivery mechanism** (Business API vs. simpler integration) is undecided — cost, approval lead time, and reliability differ significantly between options. Still genuinely open: the delivery channel is fully wired end-to-end except for this one vendor decision (a placeholder adapter fails every attempt honestly). Needs resolution before WhatsApp delivery (FR-33) can go live.
4. **Government-specific compliance** (RA bills, progress certification, audit trail for a government audit) — the domain vocabulary (RMC, godown, challan) strongly implies government contract work, but no requirement was confirmed. Currently out of scope; needs an explicit yes/no from the founder before Architecture, since it could imply new FRs (formal report certification, immutable audit export) rather than just NFR tightening.
5. ~~**Offline conflict resolution and sync reliability rule**~~ — **Resolved**, see FR-29: upsert-per-sub-record with client-generated idempotency keys, proven idempotent by integration test.
6. **Exact Role/permission granularity** (§3 Glossary Role entries, FR-48) — e.g., can a Site Supervisor record a direct Vendor→Site purchase (FR-10) unassisted, or does that require Owner/Admin? `[PARTIAL]` the role *set* is now settled (see §3 Glossary), but per-endpoint enforcement of exactly which actions need Owner/Admin is only built for Users-admin and Category-config screens — everywhere else, still assumed permissive pending a dedicated authorization pass.
7. **Regional-language support** for the Site Supervisor UI — not requested by the founder, but a real adoption risk given the likely end-user population for a DSR tool in this segment. Flagged, not assumed either way.
8. ~~**Low-stock threshold ownership**~~ — **Resolved**, see FR-36/FR-43: per-Material, nullable (no threshold set means never flags), summed across all of a Material's Sizes.
9. **Multi-tenant expansion pipeline is directional, not committed** (carried from the brief's Open Questions Log): the founder has "a few more contractors" they could approach if the pilot succeeds, but no leads are confirmed. SM-4's second-Tenant target and the multi-tenant-from-day-one architecture decision (§4.15, NFR-1) both lean on this being real — and is currently blocked regardless by FR-52's unimplemented provisioning automation; worth revisiting if the pipeline doesn't materialize post-pilot.
10. ~~**Tenant-isolation enforcement mechanism** (NFR-1)~~ — **Resolved** by the architecture spine (AD-1): deployment-level isolation (separate deployment + database per Tenant), not RLS or app-layer scoping. See NFR-1's updated text.
11. **Tenant offboarding and data retention** — no requirement exists for what happens if a Tenant (or Team Member, or the pilot itself) leaves the platform: data export, deletion timeline, or retention period. Not urgent for the pilot's launch but should be decided before a second Tenant's contract is signed, since it's a real term a paying client may ask about.
12. **User deactivation** — `[PARTIAL]` FR-48 built role assignment/management, but removing a departing user's in-app access is a deliberate no-op (`user.deleted` preserves foreign-key history, doesn't revoke anything) — full deprovisioning is still unaddressed, as is the ops-level procedure for revoking provisioning-credential access (NFR-8) across Vercel/database/auth/storage accounts.
13. **NFR-2's mobile/network target vs. photo-heavy DSRs** — NFR-2 targets a low-end phone on a 2G/3G-equivalent connection, but FR-30 has Supervisors attaching multiple photos per DSR daily. Still unresolved: client-side photo compression (the addendum's own recommended mitigation) has not been implemented, and no explicit device/network baseline has been set.
14. **Success Metrics (§9) are PRD-authored, not founder-ratified** — worth flagging because the pilot's payment is explicitly quality-contingent (§8, Monetization — pilot arrangement): if "quality" ends up measured against SM-1 through SM-5, those targets should be reviewed and agreed with the founder (and ideally the pilot contractor), not left as this document's inferred defaults.

### New, from the 2026-08-28 implementation reconciliation

15. **No audit trail for admin-configuration changes** — FR-47–51 promise every config change is "retrievable/auditable (who changed what, when)"; no change-history mechanism exists for any of Branding, Notification Channels, Report Schedules, the four Category-config tables, or User role changes. Real, unaddressed gap — needs either a lightweight audit-log table or an explicit founder sign-off that it's not needed for the pilot.
16. **Dashboard scope (FR-36–38) vs. what Epic 12 actually built** — the epic that implemented the Contractor Dashboard scoped itself to FR-34/FR-35 only; Team and Machinery/Vehicle dashboard summaries don't exist, and Inventory summary is only a fragment (a low-stock count) on a differently-shaped "Overall" card. Needs a decision: commission a follow-up story to build FR-36–38 as originally specified, or formally narrow the PRD's Dashboard scope to match what shipped.
17. **Financial Reports (FR-46) structurally can't attribute Labour or Machinery/Vehicle cost per-Site** — `Payment` and Machinery/Vehicle service logs aren't Site-scoped in the data model (Team Members aren't Site-bound; service history belongs to the asset). Contractor-level totals are correct; per-Site breakdowns for those two categories show an explicit "not tracked per-Site" state. Closing this would need a data-model change (e.g., an optional Site attribution on Payment/service logs) — worth a founder call on whether it's worth the schema change or whether Contractor-level is good enough.
18. **FR-49's "Machine/Vehicle types with custom fields" and "Vendor categories"** were never built — only the type/category add-edit-disable lifecycle exists, with no custom-fields mechanism for Machinery/Vehicle Types and no category concept for Vendors at all.
19. **App-shell navigation direction (see §8, Platform)** — the "every role gets the same sidebar" change was in the working tree but uncommitted as of this reconciliation (2026-08-28). Confirm it has landed as intended before treating §8's description as final.
20. **Epic 7 (Advances & Payments) is functionally complete but not formally closed** — all four stories are tested and working but still sit at `review` status in the sprint tracker, unlike every other epic (`done`). Worth a formal close-out pass, if only for tracker hygiene.
21. **Return/Wastage has no Site→Godown direction** (FR-13) — Material sent back to Godown from a Site has no transaction type; only Site→Vendor-direction returns are modeled.
22. **Three integration points remain unverified against real external accounts**: Cloudinary (photo upload round-trip, FR-30), Resend (report email delivery, FR-33), and the Clerk→Svix user webhook (FR-48) — all are implemented and unit-tested against mocks, but none has run against a live account/secret in any environment yet.

## 11. Assumptions Index

*Still-open assumptions first; resolved ones (with what they resolved to) follow, kept for traceability rather than deleted.*

### Still open
- §2.2 — Labourers/Team Members are data records, not app users, in v1.
- §3 Glossary — Exact permission granularity beyond the two-role split is still inferred for most of the product (only Users-admin and Category-config screens are actually role-gated); see §10 Open Question 6.
- §4.5 FR-20 — "Fast enough" DSR labour entry is qualitative; no quantified target confirmed (see NFR-2, SM-2 for proposed targets).
- §4.5 FR-20 — Same Team Member at two different Sites on the same date is disallowed (rejected) as the safer v1 default; same-day split-site work was not confirmed as a real requirement.
- §4.3 (Feature-specific NFR) — Negative Stock is rejected rather than allowed-with-override, now actually implemented this way; the alternative (allow with a flag, for delayed-receipt scenarios) still hasn't been confirmed with the founder as the *wrong* call, just implemented as the default. Same status for §4.6 FR-23's Advance Adjustment cap.
- §4.8 FR-28 — Exact "minimal required fields" set for the DSR is inferred, not specified field-by-field.
- §4.9 FR-33 — WhatsApp delivery mechanism unresolved (Open Question 3); retry policy is resolved (see FR-33).
- §7 NFR-2 — No specific minimum device/network baseline confirmed for mobile performance; client-side photo compression (the addendum's suggested mitigation) not implemented.
- §7 NFR-6 — No availability/uptime target agreed with the pilot contractor.
- §8 — Data-governance handling of personal/photo data assumed to need basic access-scoping pending legal/compliance confirmation; no regulatory framework (e.g., DPDP Act) confirmed in-scope.
- §8 — Monetization assumed likely per-Tenant subscription, not confirmed (also brief's Business Model open item).
- §9 SM-1, SM-2, SM-4 — Numeric/timeframe targets are recommended defaults, not founder-set targets. SM-4 (second Tenant onboarded) is additionally blocked by FR-52's unimplemented provisioning automation regardless of target.

### Resolved during implementation (2026-08-28 reconciliation)
- §2.3 UJ-1 — Offline conflict rule: **resolved**, see FR-29 (upsert, per-sub-record idempotency keys).
- §2.3 UJ-2 / §4.10 FR-35 — Dashboard surfaces a missing DSR as an explicit `GapFlag` per Site: **resolved**, see FR-35.
- §3 Glossary — Platform Operator: **resolved** as a credential-level concern (AD-11), confirmed no in-app cross-tenant role/screen was built.
- §3 Glossary / §4.6 — Advance Outstanding Balance is **resolved** as pooled per Team Member, not per individual Advance.
- §4.2 FR-7 — No cross-tenant shared material catalog/marketplace: holds, confirmed unchanged. Custom Fields shape (array of `{label, type}`, 3 closed types, max 20) is now **resolved** as new information not in the original draft.
- §4.10 FR-34 — "Per-Site progress" as a DSR-activity proxy: **not resolved, actually a gap** — no proxy of any kind was built (see §10 Open Question 16); zero-Site Tenant empty state **is resolved**, built as specified.
