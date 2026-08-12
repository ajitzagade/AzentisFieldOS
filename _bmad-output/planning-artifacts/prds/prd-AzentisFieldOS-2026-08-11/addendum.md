---
title: Addendum — AzentisFieldOS PRD
related_prd: prd.md
created: 2026-08-11
---

# Addendum

Technical-how, mechanism-level notes, and options-considered material that doesn't belong in the PRD's requirements narrative but should inform Architecture. Does not duplicate the founder's full 30-section functional spec — that source of truth lives in `_bmad-output/planning-artifacts/briefs/brief-AzentisFieldOS-2026-08-11/addendum.md` and should be read alongside this PRD as the field-level detail behind each Feature in §4.

## Mechanism options for unresolved PRD items

These map to PRD §10 Open Questions and are scaffolding for Architecture to resolve, not decisions made here.

**WhatsApp delivery (PRD Open Question 3, FR-33, NFR-4).** Options:

- (a) WhatsApp Business API (Cloud API) — reliable, template-message approval required, per-conversation cost, best fit for automated daily delivery at scale across tenants.
- (b) Simpler "click-to-send" links — no API cost or approval overhead, but requires a human tap per message, breaking the "owner never has to ask" premise.
- (c) Third-party WhatsApp BSP (e.g., Gupshup, Twilio, 360dialog) — abstracts the Business API onboarding, faster to integrate, adds a vendor cost layer.

Recommendation for Architecture to evaluate: (a) via a BSP, given multi-tenant scale is the whole point of the product.

**Offline DSR sync (PRD FR-29, NFR-3, Open Question 5).** "Responsive web only" plus "offline-capable" together imply a service-worker-backed web app with local persistence (IndexedDB or similar), even if never packaged/marketed as an installable PWA — these are the same underlying browser capability, just not surfaced as an "Add to Home Screen" prompt.

Conflict rule not yet decided; two reasonable defaults for Architecture to pick between:

- (a) Last-write-wins per DSR draft (simplest, risk of losing a rare double-edit).
- (b) DSR entries are append-only sub-events (labour, material, photo each as its own queued record) so there's nothing to conflict — aligns naturally with the append-only transaction model already required in FR-54.

**Low-stock threshold (PRD FR-36, Open Question 8).** Simplest model: a per-Material-per-Tenant numeric threshold field, defaulting to unset (no alert) until an Admin configures it — avoids inventing a default that's wrong differently for every material (a threshold that makes sense for cement bags is meaningless for RCC pipes).

**Role/permission granularity (PRD §3 Glossary, FR-48, Open Question 6).** Simplest v1 model consistent with the founder's "keep it simple, no approval chains" principle:

- Owner/Admin — full access.
- Site Supervisor — DSR + linked-record entry, scoped to whichever Site they're actively logging for that day, not a fixed assignment.
- Platform Operator (cross-tenant) — zero business-data access.

Finer-grained permissions (e.g., a Supervisor who can't record direct Vendor→Site purchases) can be added later without restructuring the model, since it's already role-based rather than hardcoded per-feature.

## Cost/sizing notes (informs PRD §8 Cost constraint)

Photo-heavy DSRs across 10+ concurrent Sites × 70+ Sites/year for the pilot alone imply meaningful object-storage volume from day one; multiply by however many Tenants follow. Architecture should size storage (and decide on client-side photo compression before upload) before the Cost constraint can be turned into an actual pricing input for the unresolved Business Model question (brief.md, Business Model section).

## Rejected framing (for the record)

An MVP-first phased build (core DSR + inventory + labour loop live in weeks, machinery/vehicle registers and automated report delivery following) was proposed during brief discovery and explicitly declined by the founder in favor of full-scope v1. Not revisited here — recorded so a future reader doesn't re-propose it without knowing it was already considered and rejected.
