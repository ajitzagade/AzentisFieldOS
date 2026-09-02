# Functional Requirements

Full FR-level detail behind each capability in SPEC.md. IDs are stable and carried forward verbatim from the source PRD — cite them (`FR-N`) from stories, tests, or code comments.

## CAP-1 — Multi-Site Management

- **FR-1** Owner/Admin creates and maintains Sites: name, location, status (active/completed/on-hold), contract reference. New Site appears immediately in the Site list and consolidated dashboard. Status changes are timestamped.
- **FR-2** Individual Site view: every DSR, stock movement, labour Work Record, expense, RMC entry, and photo tagged to a Site appears there, chronologically, with no manual filtering.
- **FR-3** Consolidated contractor-wide rollup across all active Sites (see CAP-10 for rollup content). A new Site is included automatically, no separate config step.

## CAP-2 — Material Catalog Configuration

- **FR-4** Owner/Admin adds/edits/disables Material Categories and Materials. A disabled Material disappears from new-entry dropdowns but historical records stay intact.
- **FR-5** Owner/Admin defines Sizes/Specifications per Material (e.g., RCC Pipe 300/450/600/900mm + custom), addable anytime without touching existing Stock records for other sizes.
- **FR-6** Owner/Admin defines Units (Bags, Pieces, Cubic metres, Cubic feet, Tonnes, Kg, Running feet, Litres, Numbers, custom); a Material's Unit is enforced consistently across every transaction type.
- **FR-7** Owner/Admin adds Custom Fields to a Material definition. No cross-tenant shared catalog/marketplace — each Tenant's catalog is independent. Implemented as a `customFields JSONB` column (architecture companion, Consistency Conventions) so adding a field is a data change, not a migration.

## CAP-3 — Inventory Lifecycle & Movement

- **FR-8** Record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle details, notes, destination Godown-or-Site, optional photos/documents). Godown-destined Purchases increase Godown Stock; Site-destined Purchases increase that Site's Stock directly and never touch Godown Stock. Every Purchase is individually retrievable, never merged into a running total.
- **FR-9** Godown→Site movement: Material/Size/quantity, vehicle, person responsible, received quantity (may differ from sent). Godown Stock decreases by sent quantity at recording time; Site Stock increases by *received* quantity on confirmation. Shortage/damage gap is its own recorded value.
- **FR-10** Direct Vendor→Site purchase, bypassing Godown, same field set as FR-8 plus receiver. Never touches Godown Stock; increases destination Site Stock identically to a Godown→Site transfer.
- **FR-11** Site→Site transfer: same field discipline as FR-9 (vehicle, person responsible, notes, received quantity). Source Site Stock decreases by sent quantity, destination increases by received quantity; any shortage/damage gap is captured.
- **FR-12** Record Consumption at a Site against an activity reference; reduces Site Stock; comparable against total received to compute variance (CAP-13).
- **FR-13** Record Return/Wastage, distinct from Consumption, its own transaction type.
- **FR-14** Full lifecycle visibility per Material/Size/Site/Godown: current Godown Stock, current Site Stock, total purchased/transferred/consumed/returned/wasted/remaining — derived from transaction history, always reconciling exactly.
- **Feature-level rule:** no transaction in FR-9/FR-11/FR-12 may drive a Stock value below zero for a given Material/Size — rejected, not silently allowed (architecture companion AD-9 defines the enforcement mechanism).

## CAP-4 — Machinery & Vehicle Registers

- **FR-15** Machinery register: name, type, asset/registration number, model, ownership, operator, current Site. Current Site updates on recorded movement (FR-17), visible from both the Machine's record and the Site view.
- **FR-16** Vehicle register: number, type, ownership, driver, current Site/usage. Same visibility guarantee as FR-15.
- **FR-17** Movement between Sites (or to/from Maintenance) for Machinery/Vehicles; full movement history retained (Available → Site A → Site B → Maintenance → Available), not just latest state.
- **FR-18** Fuel, maintenance, and repair logging per Machine/Vehicle, retrievable as a dated service history. (GPS-based live tracking is a non-goal — "current Site" is last manually recorded location.)

## CAP-5 — Labour & Team Management

- **FR-19** Team Member records: name, role/designation, contact, employment/payment type. Never bound to a single Site at creation or ever — Site association only comes from Work Records.
- **FR-20** Daily Work Record: Team Members who worked a given Site on a given date, attendance, optional hours, overtime. A Team Member can work different Sites on different dates freely. A Team Member **cannot** have two Work Records at two different Sites on the *same* date — rejected, to prevent payroll double-counting. Fast-enough-for-mobile entry: attendance defaults from the previous day's crew.
- **FR-21** Site-wise work history per Team Member, queryable by Team Member or by Site.

## CAP-6 — Labour Advances & Payments

- **FR-22** Record an Advance: amount, date, reason, payment method. Updates Outstanding Balance immediately, no approval step.
- **FR-23** Record an Advance Adjustment, any amount at any time against any Payment (or standalone). Outstanding Balance changes *only* via an explicit Adjustment. **An Adjustment cannot exceed the current Outstanding Balance** — rejected, not allowed to go negative. Full adjustment history (date, amount, linked Payment) retained.
- **FR-24** Record a Payment: Base Pay + Additional − Actual Deductions − Advance Adjustment (if any) = Net Payable. Payment Status and full history retained, never overwritten. Omitting an Adjustment on a Payment is valid, no warning.
- **FR-25** Outstanding-advance visibility at a glance, drillable per Team Member; total reconciles exactly to the sum of individual balances.

## CAP-7 — RMC Tracking

- **FR-26** Record RMC delivery: Vendor, date, quantity (m³), grade/type, rate/m³, total, invoice/challan. Queryable by day/Site/Vendor.
- **FR-27** Daily, Site-wise, and Vendor-wise RMC consumption/cost reporting, historically; Site-wise totals reconcile exactly to individual entries.

## CAP-8 — Daily Site Report (DSR)

- **FR-28** One DSR per Site per date: work completed/in-progress/planned, labour present (linked to FR-20), materials received/consumed (linked to FR-9/10/12), RMC used (FR-26), machinery/vehicles used (linked to FR-17), expenses (FR-41), issues/blockers/delays, safety observations, notes, photos. Submitting a DSR creates/updates the linked underlying records rather than duplicating entry. Minimal required fields; every list-selection uses search/dropdown/recently-used defaults, never free-typing.
- **FR-29** Offline entry and sync: a DSR (and its linked sub-records) can be completed and submitted with no connectivity; queues on-device, syncs automatically on reconnect. Never lost due to app close/phone lock/connectivity never returning in-session. Clear on-device "saved, pending sync" vs. "synced" state. **Idempotency key is per sub-record**, not per DSR (architecture companion AD-8) — each queued Consumption/Work Record/Expense/RMC/Photo syncs independently with its own key; a retry can never duplicate a server-side record. Two-device/double-edit conflicts resolve as last-synced-write-wins per sub-record, never a whole-DSR overwrite.
- **FR-30** Multiple photos per DSR, each auto-associated with Site/date/DSR/activity/uploader.
- **FR-31** Chronological Site photo/progress gallery across all DSRs, no manual tagging needed beyond FR-30's automatic association.

## CAP-9 — Automated Report Generation & Delivery

- **FR-32** Auto-compile a branded per-Site daily report (company branding/logo, project info, date, full DSR content) from that day's DSR. Branding always reflects the Tenant's own configuration (CAP-14), never a generic default or another Tenant's.
- **FR-33** Automated delivery via WhatsApp/Email/in-app, no manual send action. Failed delivery is retried and, if that ultimately fails, surfaced as a visible in-app failure — never silently dropped.

## CAP-10 — Contractor Dashboard

- **FR-34** Projects summary: total/active/completed Sites, per-Site "progress" (defined as recency/volume of DSR activity — no budget/BOQ exists to compute true percent-complete). A Tenant with zero Sites shows an explicit empty state. Updates same-day as new DSR activity, no manual refresh.
- **FR-35** Today's activity summary across all Sites (activities, labour, materials, RMC, machinery/vehicles, expenses, photos, issues); flags any Site with no DSR yet today.
- **FR-36** Inventory summary: Godown/Site stock, low-stock materials against an admin-defined per-Material-per-Tenant threshold, recent purchases/transfers/consumption. A Material below threshold appears without a manual report run.
- **FR-37** Team summary: total Team Members, today's working headcount (reconciles exactly to distinct Team Members with a Work Record dated today), weekly/monthly payment totals, total outstanding Advances.
- **FR-38** Machinery & Vehicle summary: available/in-use counts, per-Site allocation, maintenance flags. Every tile (FR-34–FR-38) supports drill-down into underlying records — the dashboard is a view, not a dead end.

## CAP-11 — Vendor Management

- **FR-39** Vendor records: name, contact, phone, email, address, materials/services supplied.
- **FR-40** Per-Vendor Purchase → Material → Quantity → Amount history and payment status; displayed total matches the exact sum of that Vendor's Purchase records.

## CAP-12 — Expense Tracking

- **FR-41** Record an Expense: date, Site, category, amount, description, payment method, person/vendor, optional document/photo. Categories are admin-configurable (CAP-14), never hardcoded.

## CAP-13 — Reports

- **FR-42** Site reports: DSR history, progress report, activity history, photo history, filterable by date range.
- **FR-43** Inventory reports: current/Godown/Site stock, consumption, purchase, movement, wastage, low-stock — matching the CAP-3 lifecycle model.
- **FR-44** Labour reports: attendance, work history, weekly/monthly payments, advance outstanding/adjustment history.
- **FR-45** Machinery & Vehicle reports: usage, Site movement history, maintenance/repair history.
- **FR-46** Financial reports: Site expenses and cost breakdowns by Material/Labour/RMC/Machinery/Vehicle, rolled up per Site and per Contractor. Every report (FR-42–FR-46) is scoped to the requesting Tenant only, under any filter combination.

## CAP-14 — Admin Configuration

- **FR-47** Company/branding config: name, logo, address, contact, GST details, colors, report branding. Change takes effect on the next generated report, no publish step.
- **FR-48** Users, Roles (Owner/Admin, Site Supervisor — see Glossary), and permissions within the Tenant.
- **FR-49** Labour/machinery/vehicle/expense-category configuration: employee types & payment structures, machine/vehicle types with custom fields, expense/vendor categories.
- **FR-50** Notification channel configuration: which channels (WhatsApp/Email/in-app) receive automated reports, and to whom.
- **FR-51** Report configuration: templates, frequency, recipients for the CAP-13 report set, independent of FR-50's daily-DSR delivery. Every configuration change (FR-47–FR-51) is Tenant-scoped and auditable (who changed what, when) per CAP-16.

## CAP-15 — Multi-Tenant / White-Label Platform

- **FR-52** Tenant provisioning: a new Tenant is provisioned with its own branding, initial Owner/Admin user, and empty independently-configurable catalog, as a **scripted deployment procedure** (architecture companion AD-2), not an in-app action by any user role.
- **FR-53** Tenant-scoped everything: every CAP-1–CAP-14 feature operates within a single Tenant's boundary; no cross-tenant read/write path exists anywhere — true by construction under the deploy-per-tenant architecture (AD-1), not merely an application-layer check.

## CAP-16 — Audit & Transaction History

- **FR-54** Append-only transaction history for Material movement/consumption, Advances/Adjustments, Machinery/Vehicle location changes, and Payments — every individual transaction retained, not just a current-state field. Current-state values are always derivable by replaying history; disagreement between derived and stored "current" value is a defect. No UI/API path edits or deletes a past transaction. **A correcting transaction requires a reason field** — a correction submitted without one is rejected.

## CAP-17 — Subcontractor Management

- **FR-55** Owner/Admin creates and maintains Subcontractor records: name, contact person, phone, email, address, work categories/specialties supplied. Soft-deletable like Vendor (CAP-11); disabling/deleting hides it from new-entry pickers, existing Site Contracts and payment history stay intact.
- **FR-56** Owner/Admin creates a Site Contract for a Subcontractor against a specific Site: work category/description, rate type (Fixed Cost, Per Trip, Per Pipe, Per Unit, or Custom with a free-text unit label), agreed rate or fixed amount, optional estimated quantity, start date, optional end date. A Site Contract always belongs to exactly one Site and one Subcontractor — never a cross-Site or cross-Subcontractor entity.
- **FR-57** Site Contract status lifecycle: Draft → Active → Completed or Cancelled, each transition timestamped. A Draft contract may be created with commercial terms (rate/fixed amount) left blank and completed later by Owner/Admin — mirrors the Purchase pricing-completion pattern (CAP-3, AD-9's sanctioned exception); a pending term is never displayed as ₹0, always as an explicit "pending" state.
- **FR-58** Record a Work Entry against an Active Site Contract: quantity, date, optional note. Site Supervisor or Owner/Admin may record it. Append-only — corrected via a new reason-carrying entry, never edited or deleted (CAP-16). The contract's cumulative quantity-completed figure updates immediately.
- **FR-59** Record a Subcontractor Payment (advance or payment, distinguished by a type field) against a Site Contract: amount, date, payment method, optional note. Append-only, corrected per CAP-16. The contract's cumulative amount-paid figure updates immediately. Payments may exceed the amount currently payable (an advance paid ahead of work) — never rejected for that reason alone.
- **FR-60** Per-Site-Contract visibility: quantity/work completed vs. pending (for rate-based contracts), amount payable, amount paid, and outstanding amount — always derived from Work Entry and Subcontractor Payment history, never a manually-editable field.
- **FR-61** Site detail view surfaces every Subcontractor engaged at that Site, their assigned work, and contract status — extending the Site chronological activity feed (FR-2) with Site Contract, Work Entry, and Subcontractor Payment events.
- **FR-62** Subcontractor detail view surfaces that Subcontractor's full history across every Site: all Site Contracts and, per contract, cumulative amount payable/paid/outstanding.
- **FR-63** Dashboard-level total outstanding-amount-to-Subcontractors visibility, drillable per Subcontractor — same reconciliation guarantee as FR-25's Outstanding-advance visibility.
