---
title: "Product Brief: AzentisFieldOS"
status: draft
created: 2026-08-11
updated: 2026-08-11
---

# Product Brief: AzentisFieldOS

*[ASSUMPTION] "AzentisFieldOS" is taken from the project workspace name as the working product name — confirm or replace before this brief circulates externally.*

## Executive Summary

Small and mid-size civil/government contractors run multiple construction contracts at once — the pilot contractor behind this brief runs 10+ sites concurrently and roughly 70+ over a year — and track nearly all of it by hand, in paper books. There is no single place to see what happened at any site today, what material or cash moved where, or who was owed what. AzentisFieldOS is a mobile-first, white-label, multi-tenant "Construction Contractor Operating System": one platform where a contractor manages every site, tracks materials from godown to consumption, runs a shared labour pool with flexible advances, logs machinery and vehicle usage, tracks outsourced RMC, and gets an automatically generated, branded daily report for every site without having to call a supervisor to ask. It's being built to be sold, not just used once — the same core product, reconfigured and rebranded, deployed across multiple contractor clients, with the first paying client already committed to trialing it live.

## The Problem

The pilot contractor's daily reality: dozens of sites over a year, each generating its own paper trail of material receipts, labour attendance, cash advances, and machine usage — recorded manually, reconciled slowly if at all, and invisible to the owner unless they physically call each site or visit in person. The founder's framing is direct: the manual process "is leading to multiple issues." *[ASSUMPTION — not yet itemized by the founder despite being asked directly; carried as an open question rather than invented. Likely candidates, validated against the broader India-market research below, include: no daily visibility without phoning supervisors, material/cash without a clean audit trail, labour advance disputes, and slow reconciliation against paper books — but these should be confirmed with the pilot contractor directly before the PRD locks requirements.]*

This is not a market where digitization has failed to arrive — competitor research shows the segment is still described, in trade sources, as running "on WhatsApp and Excel." The tools that do exist split the problem into fragments: enterprise suites (Procore, HCSS) are priced and built for large general contractors; India-specific tools (Site Setu, Powerplay, buildcontrol, Yojo) each cover a slice — daily reporting, or attendance, or generic inventory — but none combine godown-to-site material movement, flexible labour advances, machinery/vehicle registers, and RMC tracking with a branded automatic daily report in one tool built for this segment's scale and government-contract vocabulary.

## The Solution

AzentisFieldOS gives the contractor owner one app that answers "what happened today, everywhere" without a phone call. Site supervisors log a Daily Site Report from a phone in minutes — work done, labour present, material received and consumed, RMC used, machinery/vehicles used, expenses, photos, issues — and the system compiles this into a branded report the owner receives automatically. Underneath that daily loop, the platform runs the full operational backbone a contractor actually needs: a configurable material catalog (nothing hardcoded — sizes, units, categories all admin-defined) tracked through its full lifecycle from purchase through godown storage, site transfer, consumption, and wastage; and a shared labour pool where people move between sites day to day and advances are recorded but never auto-deducted — the owner decides when and how much to recover. Alongside that: machinery and vehicle registers with current location and maintenance history, vendor and RMC tracking, and a dashboard that rolls all of it up, per site or across the whole business. Every module is built admin-configurable from day one, because the pilot contractor's material list, roles, and workflows will not be the next contractor's.

## What Makes This Different

The moat here is not a novel algorithm — it's fit and integration. Competing tools force a contractor to stitch together a DPR app, a separate attendance/payroll app, and a paper or spreadsheet inventory system, or pay enterprise prices for capability built for a different scale of company. AzentisFieldOS is purpose-built for the SMB civil/government contractor's actual operating pattern: a shared (not site-assigned) workforce, flexible cash advances instead of rigid payroll, godown-plus-direct-site purchasing, and RMC as a distinct tracked cost — combined with multi-tenant white-label architecture so the same product can be resold, rebranded, and reconfigured for the next contractor without rebuilding it. Being honest about the risk: multi-tenant, fully configurable, "full mature product" scope delivered to a real paying client on an "as soon as possible" timeline is an execution bet, not a technology moat — the differentiator only holds if the build quality matches the ambition.

## Who This Serves

**Primary: the contractor owner/admin.** Runs multiple contracts simultaneously, wants daily visibility across all sites without chasing supervisors by phone, and directly manages labour advances and payments without a formal HR process. Success for them looks like opening the app and immediately knowing what happened today, everywhere.

**Secondary: the site supervisor.** Enters the day's activity from a phone, quickly, with minimal typing — dropdowns, recent values, and photo uploads over long forms. If this isn't fast, the daily report habit breaks and the whole system loses its value.

**Future: other contractor clients.** If the pilot succeeds, the founder has other contractors to approach — each becomes a new tenant with their own branding, materials, team, and configuration, sharing the same core platform.

## Business Model

*[ASSUMPTION — flagged as an open question, not resolved in discovery]* The pilot contractor has agreed to pay based on the quality of the delivered product rather than a fixed spec-and-price arrangement confirmed up front. No pricing model (subscription per tenant, per-site, or a negotiated build fee) has been settled. Comparable India/global tools in this space price per-user or per-site subscriptions ($30–39/mo) up through enterprise ACV deals — a useful reference point once pricing is decided, but not a substitute for an explicit agreement with the pilot before this scales to a second tenant.

## Success Criteria

- The pilot contractor's day-to-day operations — site activity, material movement, labour, advances — run through AzentisFieldOS instead of paper books, and the owner can answer "what happened today at every site" from the app alone.
- Site supervisors complete a Daily Site Report from a phone without needing training beyond onboarding — the mobile-first bar: fast enough that it actually gets used every day.
- Tenant isolation and white-label configuration are proven correct with a second tenant onboarded — the real test of the multi-tenant architecture claim, not just the first client.
- *[ASSUMPTION]* Concrete numeric targets (e.g., time-to-daily-report, advance-dispute reduction, number of contractors onboarded within N months) are not yet defined and should be set with the founder before or during PRD.

## Scope

**In for v1** (the full functional spec is preserved in `addendum.md` — this is the shape, not the field-by-field detail): multi-site/project management with overall and per-site views; configurable material catalog, units, and full inventory lifecycle (purchase → godown → site transfer → consumption → wastage), across all four real movement patterns (vendor→godown, godown→site, vendor→site direct, site→site); machinery and vehicle registers with location and maintenance history; a shared (not site-locked) labour pool with attendance, flexible payment structures, and manual (never automatic) advance adjustment; and RMC tracking. Also in scope: the mobile-first Daily Site Report with photos; automated branded daily report generation and delivery (WhatsApp/email/in-app); the contractor dashboard; vendor and expense tracking; and the core report set (site, inventory, labour, machinery, vehicle, financial). Rounding it out: admin configuration across company branding, users/roles, sites, inventory, labour, machinery, vehicles, expenses, vendors, and notification channels; and multi-tenant white-label architecture with hard tenant data isolation, live from the first release rather than retrofitted later.

**Explicitly out for v1**, per the founder's own future-modules list: purchase orders, formal billing/invoicing/BOQ/GST, project costing and budgeting, GPS-based attendance or vehicle tracking, equipment-maintenance workflows beyond a basic log, document/drawing management, formal work-approval chains, a client portal, a WhatsApp chatbot, and any AI-generated summary/cost/progress-forecasting features. These stay on the roadmap in the addendum but are not v1 commitments.

**Sequencing note**, not a scope cut: the founder was explicit that the pilot should see the full-scope product rather than a stripped MVP, and this brief honors that. What remains open — for the PRD and architecture, not for this brief to decide — is the internal build order: which modules are structurally load-bearing (multi-tenancy, the material/inventory model, the DSR pipeline) and must be right first, versus which surface features can be completed in parallel with — or slightly after — the core loop going live so the pilot can start using it.

## Vision

If this works with the pilot, AzentisFieldOS becomes the operating system for a class of contractor the software market has mostly ignored — too small for Procore, underserved by single-purpose DPR or attendance apps, and unwilling to run an accounting-first ERP built for a back office they don't have. Each new contractor client becomes a new tenant on the same core, with the future-modules roadmap (billing, GPS tracking, a client portal, AI-generated project summaries) filled in as the platform matures and the tenant base gives it reason to.
