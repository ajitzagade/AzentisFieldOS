---
title: Addendum — AzentisFieldOS Product Brief
related_brief: brief.md
created: 2026-08-11
---

# Addendum

This addendum preserves depth that belongs in downstream documents (PRD, architecture) rather than in the 1–2 page brief itself. It is the source of truth for detailed feature scope — the brief's Scope section summarizes and sequences it; this document is the full inventory.

## Full Functional Specification (verbatim from founder input, 2026-08-11)

The following is the complete, unedited feature specification as provided by the founder. It should be treated as the primary input to the PRD workflow — every module, field list, and workflow named here needs a home in the PRD's requirements, not just the brief.

### 1. Contractor & Multi-Site Management
Create multiple projects/sites; maintain complete info per project; track status/progress; record daily activities per site; track site-wise material consumption, labour/work activity, machinery/vehicle usage, expenses, RMC consumption; view consolidated info across all sites; transfer materials/machinery/vehicles between sites; maintain complete history of site activities. Provide both an Overall Contractor View and an Individual Site View.

### 2. Inventory & Raw Material Management
Materials purchased in advance, stored in a central godown/warehouse (Aggregate/Grit/Rabbit, Bricks, Crush Sand, Cement, RCC Covers, RCC Round Pipes, Steel, concrete-related materials, electrical/plumbing materials, etc.). Fully configurable by Admin: add/edit/disable material categories and materials, define sizes/specifications and units, add new sizes anytime, maintain different specs for same material, add custom fields. E.g. RCC Cover: 300/450/600/900mm; RCC Pipe: 300/450/600/900mm + custom. Sizes must not be hardcoded — different contractors/projects need different materials.

### 3. Inventory Units
Configurable units: Bags, Pieces, Cubic metres, Cubic feet, Tonnes, Kg, Running feet, Litres, Numbers, custom units. Admin can add new units.

### 4. Complete Inventory Lifecycle
Track full lifecycle: Opening Stock → Purchase → Godown Stock → Site Transfer → Site Stock → Consumption → Return/Wastage → Closing Stock. Owner always sees current godown stock, current site stock, total purchased, transferred, consumed, returned, wasted, remaining. Maintain full transaction history, not just a final quantity.

### 5. Material Purchase Management
Record vendor, purchase date, material, size/spec, quantity, unit, rate, total amount, invoice/challan number, payment status, delivery location, vehicle details, notes, supporting documents/photos. Purchase links to destination: Godown or Directly to Site.

### 6. Godown → Site Material Movement
Record date, material, size/spec, quantity, unit, source godown, destination site, vehicle used, person responsible, received quantity, shortage/damage, notes. Automatically reduces godown stock and increases site stock.

### 7. Direct Vendor → Site Purchase
Separate workflow for Vendor → Site delivery bypassing godown. Record vendor, site, material, size/spec, quantity, unit, rate, total amount, purchase date, invoice/challan, delivery details, vehicle details, receiver, notes, documents/photos. Directly increases site stock/consumption without touching godown inventory.

### 8. Site Material Consumption
Track actual consumption per site: date, site, material, size/spec, quantity, unit, activity/work reference, person entering record, notes. Enables comparing purchased vs. actually consumed.

### 9. Material Transfer Between Sites
Site A → Site B: source site, destination site, material, size/spec, quantity, date, vehicle, person responsible, received quantity, notes. Updates both site inventories.

### 10. Machinery Management
Machinery register: machine name, type, asset/registration number, model, ownership, current location/site, operator, usage, fuel, maintenance, repairs, service history, availability, movement history. Owner can see where each machine is currently used. (JCB, Excavator, Tractor, Concrete Mixer, Concrete Vibrator, Cutting Machine, Drilling Machine, Compactor, Generator, etc.)

### 11. Vehicle Management
Track vehicle number, type, ownership, current location/usage/site, driver, fuel, maintenance, repairs, service history, movement history, availability. Vehicles transferable between sites. (Truck, Dumper, Tractor, Pickup, Tempo, etc.)

### 12. Shared Labour & Team Management
Central employee/team database — do NOT permanently assign employees to a site (same person may work different sites on different days). Maintain: name, role/designation, contact, employment type, monthly/weekly/daily payment structure, attendance/work records, site-wise work history, weekly/monthly payments, advances, advance adjustments, payment history.

### 13. Daily Labour / Team Work Tracking
Record who worked at which site on which day: person/team, date, site, work/activity, attendance, optional hours, overtime, notes. Must be quick enough for mobile entry.

### 14. Employee / Labour Advances
Record employee, date, advance amount, reason/notes, payment method, amount adjusted/recovered, remaining outstanding, adjustment/recovery history. No mandatory approval workflow. Advance recovery is completely flexible/manual — never auto-deducted, owner decides when/how much to adjust each time. Maintain Total Advance → Total Adjusted → Outstanding Balance with adjustment history.

### 15. Labour & Team Payment Management
Support weekly, monthly fixed, daily wage payments, overtime, additional payments, deductions, manual advance adjustments, final payable, payment status/history. No rigid payroll structure — owner decides how/when each person is paid. Payment summary: Base Pay + Additional − Actual Deductions − Advance Adjustment = Net Payable. Advance deductions only happen when explicitly recorded.

### 16. RMC / Ready Mix Concrete Tracking
Record RMC vendor, site, date, quantity (m³), grade/type, rate/m³, total amount, delivery details, invoice/challan, notes, documents. Provide daily/site-wise/vendor-wise consumption, total quantity/cost, historical consumption.

### 17. Daily Site Activity / Daily Site Report (DSR) — most important module
Site supervisors enter daily from mobile: date, site, work completed today, work in progress, planned work, labour present, team members working, materials received/consumed, RMC used, machinery used, vehicles used, expenses, issues/blockers, delays, safety observations, notes, photos, documents. Must be extremely simple to fill.

### 18. Site Photos & Progress Documentation
DSR supports multiple photos, auto-associated with site/date/report/activity/uploader. Maintain chronological site progress history — a digital progress diary per project.

### 19. Automated Daily Report Generation
End of day, auto-generate a professional branded Daily Site Report (company branding/logo, project info, date, work summary, labour, materials received/consumed, RMC, machinery, vehicles, expenses, issues, progress, photos, remarks). Auto-sent via WhatsApp/Email/in-app notification. Goal: owner never needs to call the supervisor to ask what's happening — system proactively delivers the update.

### 20. Contractor Dashboard
Centralized dashboard: Projects (total/active/completed, site-wise progress); Today's Activity (site activities, labour working, materials received/consumed, RMC used, machinery/vehicles used, expenses, photos, issues); Inventory (godown stock, site-wise stock, low-stock materials, recent purchases/transfers/consumption); Team (total members, today's workforce, weekly/monthly payments, outstanding advances); Machinery & Vehicles (available, in use, site-wise allocation, maintenance required). High-level visibility + detailed drill-down.

### 21. Vendors
Vendor database: name, contact person, phone, email, address, materials supplied, purchase history, payment info, notes. View Vendor → Purchases → Materials → Quantity → Amount.

### 22. Expenses
Track material purchases, labour payments, machinery/vehicle expenses, fuel, repairs, transportation, site expenses, RMC, misc. Each expense: date, site/project, category, amount, description, payment method, person/vendor, supporting document/photo.

### 23. Reports
Site Reports (daily site report, progress report, activity history, photo history); Inventory Reports (current/godown/site stock, consumption, purchase, movement, wastage, low-stock); Labour Reports (attendance, work history, weekly/monthly payments, advance outstanding/adjustment history); Machinery Reports (usage, site movement, maintenance, repair history); Vehicle Reports (usage, site movement, fuel, maintenance); Financial Reports (site expenses, material/labour/RMC/machinery/vehicle cost, overall project expenses).

### 24. Admin Configuration
Highly configurable: Company (name, logo, address, contact, GST, branding, colours, report branding); Users (users, roles, permissions); Sites (projects, sites, info, status); Inventory (categories, materials, sizes, specs, units, custom fields); Labour (employee types, roles, payment structures); Machinery (types, custom fields); Vehicles (types, custom fields); Expenses (categories); Vendors (categories); Reports (templates, frequency, recipients); Notifications (WhatsApp, Email, in-app). New components addable without major rework.

### 25. White-Label / Multi-Tenant Architecture
Support multiple contractor companies on one platform, each with own logo/branding/sites/materials/employees/vendors/reports/workflows. Data completely isolated between tenants — no cross-tenant access to users, projects, inventory, employees, vendors, expenses, reports, documents, financial data.

### 26. Modular Architecture
Independent core modules so new modules can be added later without rewriting the app. Potential future modules: Purchase Orders, Vendor Management, Client Management, Billing, Invoicing, BOQ Management, Project Costing/Budgeting, GST/Invoicing, Advanced/GPS-based Attendance, Vehicle GPS tracking, Equipment maintenance, Document management, Drawing/document storage, Work approvals, Client portal, WhatsApp chatbot, AI-generated project summaries, AI-based cost/progress analysis, Forecasting. Architecture must be API-driven + Modular + Configurable + Scalable + Multi-tenant.

### 27. Mobile-First Daily Operations
Site supervisors need to quickly: select site, enter today's activities, record labour/materials received/consumed/RMC/machinery/vehicles, add expenses, upload multiple photos, submit DSR. Minimize form complexity — use dropdowns, search, quick-add, defaults, recently-used values, simple quantity inputs, photo upload, minimal required fields.

### 28. Audit & Transaction History
Maintain history for: Material (Purchase → Transfer → Consumption → Return); Employee Advance (Advance → Adjustment → Remaining Balance); Machinery (Available → Site A → Site B → Maintenance → Available); Vehicle (Available → Site A → Site B); Payments (Created → Paid → History). Never silently overwrite important info.

### 29. Business Principles (constraints the PRD/architecture must honor)
- Keep it simple — no unnecessary approval chains, hierarchies, complex HR workflows, mandatory processes, excessive forms; this is a small contractor's operational tool, not enterprise ERP.
- Everything configurable — never hardcode material types, sizes, units, labour categories, machinery types, vehicle types, expense categories, site structures.
- Shared workforce — employees not permanently assigned to a site.
- Flexible advance recovery — owner decides when/how much to adjust, never automatic.
- Real-world material movement — support Vendor→Godown, Godown→Site, Vendor→Site, Site→Site.
- Daily visibility — owner should always know what happened today.
- Automation — system proactively generates/delivers useful reports instead of the owner having to chase updates.

### 30. Overall Product Objective
Act as a Construction Contractor Operating System bringing together Projects, Sites, Inventory, Godown, Purchases, Material Movement/Consumption, Labour, Team, Advances, Payments, Machinery, Vehicles, RMC, Vendors, Expenses, Daily Activities, Site Photos, and Automated Reports into one centralized platform, so the owner can open the app and immediately know what's happening at every site — without calling anyone.

---

## Competitive Landscape Digest (via research, 2026-08-11)

**Global mid/enterprise players** (mostly too heavy/expensive for small civil contractors): Procore (enterprise suite, ACV pricing, ~$375+/user/mo, sales-cycle-gated), Buildertrend (US residential-focused PM/CRM), HCSS (heavy-civil/DOT estimating & fleet, enterprise-priced), Fieldwire by Hilti (cheap entry ~$39/mo, but narrow — tasks/drawings only, no inventory/labour/RMC), RAKEN (daily-report/photo-log specialist, no inventory or labour-payment depth), Sitemate/Dashpivot (flexible digital-forms platform, $30/user/mo, generic form-builder rather than purpose-built).

**India-specific players**: Powerplay (closest broad analog — progress/inventory/procurement/attendance, ~₹72k+/yr, but generic rather than tuned to government-contractor DPR/billing workflows), Site Setu (DPR-focused: labour/materials/equipment/photos + attendance/payroll), buildcontrol (attendance/labour-vendor tracking + daily reporting), Yojo (offline-first labour management — attendance, wages, advances), Onsite Teams (ERP-style cost tracking), SuperWise/Tactivesoft/BuildFormula (DPR/MIS/billing tools aimed at CPWD/NHAI/DMRC-style mandatory government reporting), traditional ERPs — FirstBit, CONWORX, NYGGS, eresource, Odoo-construction, Tally+add-ons (accounting/GST-first, ₹1L–₹10L+ setup, not mobile-first), Aasaan and Yukti AI (newer AI layers converting WhatsApp chatter into structured reports — implicitly confirms the segment still runs on WhatsApp + Excel).

**The gap**: no player combines DSR/photos + godown-to-site inventory + shared-labour advance tracking + machinery register + RMC tracking + branded automated report delivery + white-label multi-tenancy in one low-friction mobile tool sized for SMB civil/government contractors. The market splits into (a) enterprise suites too costly/complex, (b) India DPR/attendance point tools that skip inventory and RMC, (c) heavy ERPs built for accountants, not site supervisors.

**Pricing patterns observed**: per-user/month ($30–39, Fieldwire/Dashpivot), per-site or ACV-tiered (Procore, Powerplay), flat ERP license + annual maintenance (₹3–10L + ₹1L/yr, FirstBit/CONWORX). SMB-friendly entrants favor low per-user or per-tenant subscriptions over large upfront ERP licenses — relevant reference point for AzentisFieldOS's own pricing, which is not yet decided (see Open Questions).

---

## Open Questions Log

These were raised during brief discovery and explicitly not resolved — carried forward rather than silently assumed. The PRD workflow should either resolve them or continue carrying them as flagged risks.

1. **Specific pain points.** The founder described the pilot's motivation as "manage everything digital, manual process is leading to multiple issues" without itemizing which issues (material/cash traceability, no daily visibility, labour advance disputes, delayed government billing, etc.). The brief's Problem section uses the general framing; a validated, itemized list would materially strengthen the PRD and should be captured directly from the pilot contractor before requirements are finalized.
2. **Payment/pricing model.** Founder stated the pilot "is paying for this based on product quality" — no fixed fee, subscription tier, or discretionary arrangement was confirmed. No revenue model is assumed in the brief; this needs to be nailed down before/alongside the PRD, since it affects what "done" looks like contractually.
3. **Multi-tenant expansion pipeline.** Founder has "a few more contractors" they could approach if the pilot succeeds — not yet confirmed leads, just stated intent. Treated in the brief as directional validation for building multi-tenant from day one, not as a committed pipeline.
4. **Government-specific compliance.** The spec's domain language (RMC, godown, challan, civil/government contracts) strongly implies government contract work, which often carries official reporting obligations (RA bills, progress certification, audit trail for government audits). Not confirmed whether the pilot needs anything specific here for v1 — flagged as a scope question for the PRD, not assumed in or out.
5. **Sequencing within "full scope."** Founder rejected a phased/MVP-first framing in favor of shipping the full 30-section scope to the pilot, accepting it will be tested and iterated live. The brief still recommends the PRD/architecture define an internal build sequence (which modules are structurally load-bearing vs. which can follow) — that's an internal engineering concern, not a re-litigation of the founder's scope decision.
