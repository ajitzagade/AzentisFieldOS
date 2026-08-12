---
title: "Reconciliation — PRD vs. Founder's 30-Section Functional Spec"
input_a: "prd.md"
input_b: "brief-AzentisFieldOS-2026-08-11/addendum.md (Full Functional Specification, §1–30, plus Competitive Digest and Open Questions Log)"
created: 2026-08-11
scope: "Content/substance gaps only — not prose/structure quality."
---

# Reconciliation: PRD vs. Founder's 30-Section Spec

Method: each of the 30 spec sections was checked against the PRD's Features (§4), Non-Goals (§5), NFRs (§7), Constraints (§8), and Open Questions (§10) for a "home." Field-level lists within each section were checked against the corresponding FR's stated fields, not just the FR's existence. The Competitive Digest and Open Questions Log were checked separately at the end.

## Section-by-section mapping

| # | Founder Section | PRD Home | Verdict |
|---|---|---|---|
| 1 | Contractor & Multi-Site Mgmt | §4.1 FR-1–3 | Full — Overall/Individual Site views both explicitly present |
| 2 | Inventory & Raw Material Mgmt | §4.2 FR-4, FR-7 | Full — configurability principle honored; example materials are illustrative, not required enumeration |
| 3 | Inventory Units | §4.2 FR-6 | Full |
| 4 | Complete Inventory Lifecycle | §4.3 FR-8–14 | Full — lifecycle stages and reconciliation formula match |
| 5 | Material Purchase Mgmt | §4.3 FR-8 | **Partial — see Gap 1** |
| 6 | Godown→Site Movement | §4.3 FR-9 | Full (minor: "notes" field not restated, low severity) |
| 7 | Direct Vendor→Site Purchase | §4.3 FR-10 | **Partial — see Gap 2** |
| 8 | Site Material Consumption | §4.3 FR-12 | Full (minor: "person entering record"/"notes" not restated; covered implicitly by NFR-5 attribution) |
| 9 | Material Transfer Between Sites | §4.3 FR-11 | **Partial — see Gap 3** |
| 10 | Machinery Management | §4.4 FR-15,17,18 | Full |
| 11 | Vehicle Management | §4.4 FR-16,17,18 | Full |
| 12 | Shared Labour & Team Mgmt | §4.5 FR-19,21; §4.6 | Full |
| 13 | Daily Labour/Team Work Tracking | §4.5 FR-20 | Full (minor: explicit "notes" field not restated) |
| 14 | Employee/Labour Advances | §4.6 FR-22,23,25 | Full |
| 15 | Labour & Team Payment Mgmt | §4.6 FR-24 | Full — formula matches founder's exactly |
| 16 | RMC Tracking | §4.7 FR-26,27 | **Partial — see Gap 4 (minor)** |
| 17 | DSR (most important module) | §4.8 FR-28–31 | Full |
| 18 | Site Photos & Progress Doc | §4.8 FR-30,31 | Full |
| 19 | Automated Daily Report Generation | §4.9 FR-32,33 | Full |
| 20 | Contractor Dashboard | §4.10 FR-34–38 | Full |
| 21 | Vendors | §4.11 FR-39,40 | Full |
| 22 | Expenses | §4.12 FR-41 | Full — categories left admin-configurable per founder's own "everything configurable" principle |
| 23 | Reports | §4.13 FR-42–46 | Full — every report category from the founder's list present |
| 24 | Admin Configuration | §4.14 FR-47–50 | **Partial — see Gap 5** |
| 25 | White-Label/Multi-Tenant | §4.15 FR-51,52 | Full |
| 26 | Modular Architecture | §5 Non-Goals (future-modules list only) | **Partial — see Gap 6** |
| 27 | Mobile-First Daily Ops | §4.8 FR-28, §7 NFR-2 | Full |
| 28 | Audit & Transaction History | §4.16 FR-53, §7 NFR-5 | Full — all four lifecycle chains (Material, Advance, Machinery/Vehicle, Payment) match |
| 29 | Business Principles | Woven through Vision, §4, §5 | Full |
| 30 | Overall Product Objective | §1 Vision | Full |

## Gaps found (content/substance only)

**Gap 1 — FR-8 (Purchase) drops two fields the founder explicitly listed in §5.**
Founder's field list for Material Purchase: *vendor, purchase date, material, size/spec, quantity, unit, rate, total amount, invoice/challan number, payment status, delivery location, vehicle details, notes, supporting documents/photos.* FR-8 states: "Vendor, Material, Size, quantity, Unit, rate, total amount, invoice/challan number, payment status, and destination (Godown or a specific Site), with optional photos/documents." Missing from the FR text: **purchase date** (assumed implicit but never stated), **vehicle details**, and **notes**. "Delivery location" is arguably covered by "destination," but vehicle details and notes are genuinely absent — and vehicle details matters here because Purchase is one of only two transaction types where physical delivery happens (the other, Godown→Site, does capture vehicle in FR-9). Recommend adding these fields to FR-8 explicitly.

**Gap 2 — FR-10 (Direct Vendor→Site Purchase) is under-specified relative to founder §7.**
Founder's field list: *vendor, site, material, size/spec, quantity, unit, rate, total amount, purchase date, invoice/challan, delivery details, vehicle details, receiver, notes, documents/photos.* FR-10's text is only: "Owner/Admin (or Site Supervisor...) can record a Purchase delivered straight to a Site, bypassing Godown entirely," with consequences focused solely on stock-routing behavior (never touches Godown, increases Site Stock). No field list is restated or cross-referenced to FR-8. Given FR-8 itself is already missing vehicle details/notes (Gap 1), FR-10 inherits that gap and adds its own ambiguity around whether "receiver" (a field distinct from "person responsible" in FR-9) is captured at all. Recommend FR-10 either explicitly restate its field list or explicitly say "same fields as FR-8, plus receiver at the Site."

**Gap 3 — FR-11 (Site→Site Transfer) omits fields the founder explicitly listed in §9, and is inconsistent with FR-9's treatment of the analogous Godown→Site case.**
Founder's field list for Site→Site: *source site, destination site, material, size/spec, quantity, date, vehicle, person responsible, received quantity, notes.* FR-11's text: "Owner/Admin can record a transfer of Material/Size/quantity from one Site to another," with consequences limited to stock effects (source decreases, destination increases by received quantity, both histories link). Note it does say "received quantity" in the consequence, but never mentions **vehicle**, **person responsible**, or **notes** — even though FR-9 (the structurally identical Godown→Site case) explicitly captures "vehicle, person responsible, and received quantity." This is a direct internal inconsistency: the founder specified the same operational fields for both movement types, and the PRD captured them for one (FR-9) but not the other (FR-11). Recommend aligning FR-11's stated fields with FR-9's.

**Gap 4 (minor) — FR-26 (RMC delivery) drops "delivery details," "notes," and "documents" from founder's §16 list.**
Founder: *RMC vendor, site, date, quantity (m³), grade/type, rate/m³, total amount, delivery details, invoice/challan, notes, documents.* FR-26: "Vendor, date, quantity (m³), grade/type, rate/m³, total amount, invoice/challan" — no mention of delivery details, notes, or supporting documents/photos, even though the structurally similar Purchase FR-8 explicitly allows "optional photos/documents." Low severity (RMC is usually captured via DSR photos anyway) but worth aligning for consistency.

**Gap 5 — Admin Configuration (§4.14) does not cover "Reports (templates, frequency, recipients)" configurability from founder's §24.**
Founder's Admin Configuration section explicitly lists **Reports (templates, frequency, recipients)** as one of the configurable domains, alongside Company, Users, Sites, Inventory, Labour, Machinery, Vehicles, Expenses, Vendors, and Notifications. The PRD's FR-47–50 cover Company/branding, Users/roles, Labour/Machinery/Vehicle/Expense/Vendor categories, and Notification channels (FR-50) — but FR-50 only covers *which channels* deliver the automated daily report (FR-33), not configurable *report templates* or *report frequency* for the broader report set defined in §4.13 (FR-42–46), which today reads as fixed-format/on-demand only. This is a real content gap: the founder asked for report templates and delivery frequency (not just channel) to be admin-configurable, and no FR currently provides that.

**Gap 6 — Founder's §26 explicit architecture mandate has no NFR/Constraint home.**
Founder's §26 states: *"Architecture must be API-driven + Modular + Configurable + Scalable + Multi-tenant."* The PRD's §5 Non-Goals references §26 only for its *future-modules list* (Purchase Orders, Billing, GPS tracking, etc. — correctly deferred as Phase 2+), but the architectural mandate itself — that v1 must be built in a way that *allows* those modules to be added later without rewrites — is not captured anywhere as an NFR or Constraint. §7 NFRs cover tenant isolation, mobile performance, offline sync, notification delivery, auditability, and availability, but nothing about extensibility/modularity of the codebase. This is squarely a "founder wrote it, needs a home" case even though it will ultimately be executed by the Architecture doc — the PRD is the right place to assert it as a requirement/constraint so Architecture is obligated to honor it. Recommend adding a constraint under §8 (e.g., "Modular/API-driven architecture: v1 must expose module boundaries such that future modules (see §5 footnote) can be added without rearchitecting core tenancy, inventory, or DSR data models").

## Open Questions Log cross-check

Addendum's 5 open questions vs. PRD §10:
1. Specific pain points → PRD OQ1. Match.
2. Payment/pricing model → PRD OQ2. Match.
3. **Multi-tenant expansion pipeline** ("a few more contractors" not yet confirmed leads) → **Not carried forward as an explicit PRD open question.** It is implicitly touched by SM-4 ("second Tenant successfully onboarded") as a success metric, but the underlying uncertainty flagged in the addendum — that the pipeline is *intent, not committed* — isn't preserved as a question anywhere in §10 or §11. Low severity since the PRD's multi-tenant-from-day-1 decision doesn't actually depend on the pipeline being confirmed, but the addendum explicitly asked that this be "carried forward rather than silently assumed," and it was silently dropped rather than explicitly resolved or carried.
4. Government-specific compliance → PRD OQ4 (and §2.2, §4.9 notes). Match.
5. Sequencing within "full scope" → Addressed via §6 MVP Scope's "Note on scope philosophy" (treated as resolved: full scope, sequencing deferred to Architecture). Reasonable resolution, not a gap.

## Competitive Digest cross-check

Not a source of requirements, but PRD Vision (§1) explicitly reflects the digest's core finding ("a segment... still running on WhatsApp and Excel, split across point tools that each solve one slice of this and none solve all of it together"). No gap.

## Summary

Six content gaps found, four field-list omissions (Gaps 1–4, ranging from moderate to minor severity) and two structural omissions (Gap 5: report-template/frequency configurability; Gap 6: no NFR/constraint capturing the founder's explicit "API-driven + Modular + Configurable + Scalable + Multi-tenant" architecture mandate). One Open Question (multi-tenant pipeline, addendum item 3) was silently dropped rather than carried forward or explicitly resolved. All other 29 of 30 spec sections, and the remaining 4 of 5 open-questions-log items, have a clear, adequately detailed home in the PRD.
