# Preservation Check — AzentisFieldOS SPEC.md

**Method:** Walked the PRD (`prd.md`) and addendum (`addendum.md`) claim by claim — every Vision/JTBD claim, Non-User, User Journey, Glossary term, FR (1–54), feature-level Notes/Out-of-Scope/Cross-reference callouts, Non-Goal, MVP-scope statement, cross-cutting NFR (1–8), Constraint, Success Metric (primary/secondary/counter), Open Question (1–14), and Assumptions Index entry (18 items) — and confirmed each either (a) landed in SPEC.md or a companion (glossary.md, functional-requirements.md, success-metrics.md), (b) was deliberately superseded/routed to ARCHITECTURE-SPINE.md with a correct pointer, or (c) was legitimately dropped as narrative/rationale prose per Spec Law. Also checked addendum.md's mechanism options and the "rejected framing" note.

**Verdict: PASS, with 3 minor genuine gaps.** Coverage is otherwise excellent — all 54 FRs, all 8 NFRs, all Glossary terms, all Non-Goals, all Success Metrics, and 11 of 14 Open Questions land correctly, with several Open Questions correctly shown as resolved by the architecture spine (negative-stock policy, low-stock threshold ownership, offline conflict rule, tenant-isolation mechanism).

## Full coverage confirmed (no issues)

- **Glossary (§3 PRD → glossary.md):** all 24 terms present, definitions preserved near-verbatim, including the Platform Operator non-role explanation and its AD-11 pointer.
- **FR-1 through FR-54:** every FR present in functional-requirements.md under the correct CAP, with testable consequences preserved (reconciliation rules, rejection rules, retrieval guarantees, etc.). Feature-specific NFRs (negative-stock rejection at §4.3, correction-reason requirement at §4.16) carried forward and correctly pointed at AD-9.
- **NFR-1, 3, 4, 5, 7, 8:** captured in SPEC.md Constraints / Capability success criteria, or correctly routed to AD-1/AD-9/AD-10/AD-11.
- **NFR-2:** captured in SPEC.md Constraints (2G/3G, low-end phone); the "no confirmed device/network baseline" residual is correctly carried in ARCHITECTURE-SPINE.md's Deferred section, citing PRD Open Question 13.
- **NFR-6 (no uptime target):** correctly routed to ARCHITECTURE-SPINE.md AD-14 Deferred ("Formal uptime SLA... revisit as tenant count grows").
- **Non-Goals (§5):** all 10 items present in SPEC.md Non-goals, plus the FR-52/53 in-app-Platform-Operator non-goal added by architecture.
- **Success Metrics (§9):** SM-1 through SM-5, SM-C1, SM-C2 all present in success-metrics.md with matching targets and validation links.
- **Open Questions 1, 3, 4, 6, 7, 10, 13, 14:** present in SPEC.md Open Questions or correctly shown as resolved-by-architecture.
- **Open Questions 5, 8:** resolved (not carried as open) — matches addendum.md's recommended defaults (per-sub-record sync/idempotency via AD-8; per-Material-per-Tenant low-stock threshold reflected directly in FR-36's wording). Appropriate resolution, not a drop.
- **Assumptions Index (§11), 15 of 18 items:** present in SPEC.md Assumptions, functional-requirements.md FR text, or correctly resolved into definite spec language (e.g., FR-34's zero-Site empty state, FR-35's missing-DSR flag).
- **Addendum mechanism options:** WhatsApp BSP recommendation reflected in the Stack table; offline sync mechanism (Dexie/IndexedDB, per-sub-record idempotency) reflected in AD-8; low-stock threshold model reflected in FR-36; cost/sizing note reflected in SPEC Constraints and AD-14/Deferred.

## Genuine gaps found

1. **Privacy / Data Governance constraint (PRD §8, Assumptions Index §8) — dropped, not routed.**
   The PRD states: Team Member personal data (contact details, wage/advance history) and Site photos (which may capture people) "should be handled with basic access-scoping (only that Tenant's Owner/Admin and relevant Supervisors)" even though no formal regulatory framework (e.g., India's DPDP Act) has been confirmed as in-scope — flagged `[ASSUMPTION — flagged for legal/compliance confirmation, not assumed resolved]`.
   This does not appear anywhere in SPEC.md (Constraints, Assumptions, or Open Questions), the three companions, or ARCHITECTURE-SPINE.md (checked for "DPDP", "privacy", "access-scop*", "personal data" — no hits). Tenant-level isolation (NFR-1/AD-1) covers cross-tenant leakage but not this distinct within-tenant claim (photos/personal data should be scoped to Owner/Admin + relevant Supervisors, not all in-tenant users indiscriminately). A builder implementing role permissions (FR-48) has no signal this constraint exists. Recommend adding to SPEC.md Constraints or Open Questions.

2. **Open Question 9 — multi-tenant pipeline is directional, not committed — dropped.**
   PRD: "the founder has 'a few more contractors' they could approach if the pilot succeeds, but no leads are confirmed. SM-4's second-Tenant target and the multi-tenant-from-day-one architecture decision... both lean on this being real; worth revisiting if the pipeline doesn't materialize post-pilot."
   SM-4 in success-metrics.md ("A second Tenant successfully onboarded...") and the SPEC.md Success signal ("A second Tenant is successfully onboarded...") both carry the target forward with no caveat that the pipeline behind it is unconfirmed. Since this is exactly the kind of context a reader would need to correctly judge whether SM-4 is a realistic near-term target, its absence is a genuine (if minor) loss. Recommend adding to SPEC.md Open Questions or as a footnote on SM-4.

3. **Open Question 12 (first half) — in-app user deactivation — dropped.**
   PRD: "no explicit requirement covers removing an Owner/Admin's or Site Supervisor's in-app access when they leave the organization." (The second half of OQ-12 — revoking a departing team member's *provisioning-credential* access — is correctly preserved in SPEC.md's Open Questions: "the procedure for revoking a departing team member's provisioning-credential access.")
   The in-app-account-deactivation half is not covered by FR-48 ("Users, Roles... within the Tenant") or by any Open Question/Assumption in SPEC.md. This is a real functional gap a builder could hit (no spec signal that user deactivation needs to exist at all). Recommend adding as its own Open Question or folding into FR-48's description.

## Minor items noted, not flagged as gaps

- **FR-29's "Out of Scope: real-time collaborative editing of the same DSR by two Supervisors simultaneously"** is not restated verbatim in SPEC's Non-goals, but AD-8's per-sub-record, last-synced-write-wins sync model architecturally precludes the scenario anyway — the intent is preserved by construction, just not as an explicit sentence.
- **NFR-7's "new modules addable without rewriting existing modules" framing** isn't restated as a standalone Constraint sentence, but is manifestly what the architecture's package/API separation (AD-3, AD-5, `packages/*`) delivers structurally.
- **Addendum's "defaulting to unset (no alert)" detail for low-stock thresholds** isn't spelled out in FR-36's wording — a minor implementation nuance, reasonably inferable from "admin-defined threshold."
- **PRD §6's "MVP Scope means full v1 scope, not a phased subset" framing** (and addendum's "rejected framing" note about a declined phased-MVP proposal) isn't restated narratively, but is achieved structurally — SPEC.md lists all 16 capabilities as in-scope with no phase markers, which has the same effect.

## Files reviewed

- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/addendum.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/specs/spec-AzentisFieldOS/SPEC.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/specs/spec-AzentisFieldOS/glossary.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/specs/spec-AzentisFieldOS/success-metrics.md`
- `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md`
