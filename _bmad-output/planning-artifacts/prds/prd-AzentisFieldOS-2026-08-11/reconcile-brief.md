---
title: "Reconciliation: PRD vs. Brief (content/substance check)"
input: brief.md
target: prd.md
created: 2026-08-11
---

# Reconciliation: prd.md vs. brief.md

Scope of this check: content/substance only (no prose/structure review). Looking specifically for qualitative material from the brief — tone, "why now"/competitive framing, honesty about execution risk, and any claim/nuance — that the PRD's FR-driven structure dropped, contradicted, or weakened.

## Gaps Found

### 1. The brief's explicit "execution risk, not a technology moat" admission is dropped entirely
Brief, "What Makes This Different" (¶28, final sentence): *"Being honest about the risk: multi-tenant, fully configurable, 'full mature product' scope delivered to a real paying client on an 'as soon as possible' timeline is an execution bet, not a technology moat — the differentiator only holds if the build quality matches the ambition."*

This is the single most pointed piece of qualitative honesty in the brief — it directly undercuts the "What Makes This Different" pitch with a risk caveat. The PRD's Vision (§1) reproduces the differentiation claim (white-label, multi-tenant, fit-and-integration) but never carries forward the risk caveat. It doesn't appear in Constraints (§8), Open Questions (§10), or the NFRs (§7) either — the closest analogues (NFR-1 tenant isolation, NFR-6 availability) are about technical risk, not the "this is an execution bet, not a moat" framing. This is exactly the kind of self-aware risk narrative the brief goes out of its way to state and the PRD silently loses.

### 2. The "as soon as possible" timeline pressure is never mentioned in the PRD
Tied to gap #1, the brief names a concrete delivery-pressure fact: the pilot is being delivered on an "as soon as possible" timeline. Timeline/urgency is a real constraint that would normally show up in §8 Constraints and Guardrails or §10 Open Questions, but neither section mentions timeline at all. Given the PRD explicitly assembled a Constraints section (Platform, Privacy, Cost, Integration, Monetization), the absence of a timeline entry — when the brief flagged timeline as central to the risk narrative — is a substantive drop, not just a stylistic one.

### 3. The pilot's quality-contingent (not fixed-price) payment arrangement is dropped
Brief, Business Model (¶40): *"The pilot contractor has agreed to pay based on the quality of the delivered product rather than a fixed spec-and-price arrangement confirmed up front."* This is a distinct fact from "what will the future per-tenant pricing model be" — it describes how the current, first paying engagement is structured, and it raises the stakes on execution quality (ties directly back to gap #1's risk narrative).

PRD §8 Constraints → Monetization only discusses the unresolved *future* per-tenant subscription pricing model; it never mentions that the pilot itself is being paid for on a quality-contingent basis rather than a fixed spec/price. This nuance — which materially affects how "done" and "quality" should be defined for the founder/PM driving the build — has no home anywhere in the PRD (not in Vision, not in Open Questions, not in Constraints).

### 4. The pilot's annual site volume ("roughly 70+ sites over a year") is dropped, only concurrent count survives
Brief, Executive Summary: *"the pilot contractor behind this brief runs 10+ sites concurrently and roughly 70+ over a year."* PRD Vision (§1) and UJ-2 (§2.3) both carry forward only "10+ concurrent sites" — the "70+ over a year" annual-throughput figure is gone. This matters as more than color: it's a scale signal (site churn/turnover rate, historical data volume, reporting/archival needs) that could reasonably inform NFR-6 (availability) or general data-volume assumptions, and it isn't referenced or substituted anywhere else in the PRD.

### 5. (Minor/contextual) Named competitors dropped from the differentiation narrative
Brief, The Problem: names specific competitors and how each falls short — Procore, HCSS (enterprise, wrong scale), Site Setu, Powerplay, buildcontrol, Yojo (India-specific, each covering only a slice). PRD Vision (§1) keeps the "WhatsApp and Excel... split across point tools" framing but drops all six competitor names. This is lower-severity than the others because the PRD's own §0 explicitly states it does not repeat the brief's Problem section — so this appears to be a deliberate, declared exclusion rather than a silent drop. Flagged for completeness only; the "why now"/competitive-differentiation *narrative* itself (fit-and-integration moat, fragmented point-tools) does survive in the Vision, just without the concrete competitor evidence.

## Not Gaps (verified preserved)
- Founder's unitemized "manual process is leading to multiple issues" — preserved verbatim as PRD Open Question 1.
- "No stripped MVP" sequencing decision — preserved near-verbatim in PRD §6 scope philosophy note.
- Future-modules roadmap (billing, GPS, client portal, AI summaries) as Phase 2+, not rejected — preserved in PRD §5 Non-Goals closing note.
- Full explicit out-of-scope list (POs, billing/GST, costing/budgeting, GPS tracking, maintenance workflows, document management, approval chains, client portal, WhatsApp chatbot, AI forecasting) — all present in PRD §5.
- Primary/secondary/future user segmentation and the "if DSR isn't fast, the habit breaks" stakes — preserved in JTBD and NFR-2/SM-2.
- Success criteria (daily operations off paper, DSR without training, second-tenant proof) — preserved in Success Metrics (SM-1 through SM-5).
