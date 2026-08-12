---
title: "Architecture Spine ↔ PRD Reconciliation — AzentisFieldOS"
scope: "ARCHITECTURE-SPINE.md vs prd.md + addendum.md"
created: 2026-08-11
note: "The FR-52/FR-53 deploy-per-tenant reinterpretation is a known, intentional divergence (see spine's own Deferred section and .memlog.md). It is NOT re-flagged below."
---

# Architecture Spine ↔ PRD Reconciliation

Method: walked every PRD Feature (§4.1–§4.16 / FR-1–FR-54), every NFR (§7), and every Constraint (§8) against the spine's Invariants (AD-1..AD-10), Consistency Conventions, Stack, Capability Map, and Deferred section, then checked the addendum.md mechanism notes against what the spine actually adopted.

## Confirmed covered (no gap)

- **AD-9 vs FR-54 "reason required on corrections"** — explicit match: "A correction is a new row, linked to the one it corrects, carrying a required reason field." Fully satisfies FR-54's third consequence.
- **AD-4/AD-5/AD-6 vs core UI-standards list** — design-token single source, zero inline styles, one implementation per primitive (buttons/inputs/forms/modals/dialogs/tables/cards/toasts/loaders/alerts — list matches memlog verbatim), and the five required state patterns (loading/empty/success/error/validation-failure) are all explicitly captured. See Gaps below for the parts of the same standards list that are *not* captured.
- **NFR-2 vs Deferred** — explicitly named ("Photo compression strategy... needed to make AD-8 practical over 2G/3G (PRD NFR-2, Open Question 13)"), correctly deferred rather than silently dropped, though narrower than the full NFR (see Gaps).
- **FR-52/53 reinterpretation** — already tracked in spine's own Deferred section and memlog; not re-litigated here per instructions.

## Gaps found

### 1. WCAG AA and Lighthouse ≥95 targets are absent from the spine entirely
The memlog records these as binding, founder-mandated constraints: *"WCAG AA, Lighthouse >95 across Performance/Accessibility/Best Practices/SEO... semantic HTML + clean TypeScript, no placeholder content in shipped code."* AD-4/AD-5/AD-6/AD-7 cover token-consistency, component-reuse, state-pattern-consistency, and validation-consistency — but none of them, nor any other AD, nor the Deferred section, state an accessibility or performance-budget invariant. This isn't a downstream implementation detail like photo-compression-library choice (correctly deferred) — it's a testable, binding standard the founder set that has no home anywhere in the spine, adopted or deferred. Same gap applies to "no placeholder content in shipped code" and "semantic HTML" — present in the memlog's constraint list, absent from the spine.

### 2. AD-8 doesn't resolve the DSR concurrent-edit conflict rule (PRD Open Question 5a / UJ-1 edge case)
PRD Open Question 5 names three related gaps. AD-8 clearly resolves 5(c) idempotent retries (client-generated idempotency key) and implicitly resolves 5(b) partial sync (each linked sub-record — Consumption, Work Record, Expense, RMC, photo — is queued and presumably synced as its own idempotency-keyed unit, so one failing doesn't block the rest). But 5(a) — "what happens when a DSR is edited twice before syncing, or started on two devices for the same Site/date" — is not addressed by AD-8 or anywhere else in the spine. The addendum explicitly offered two named options for architecture to choose between (last-write-wins vs. append-only sub-events); AD-8's design leans toward the latter but never says so or states a rule for the specific double-edit/two-device scenario. UJ-1's own edge case in the PRD calls this out by name and it remains unresolved.

### 3. Email delivery channel is unaddressed in Stack/Deferred
FR-33 ("Automated delivery via WhatsApp/Email/in-app") and FR-50 (notification channel configuration covering WhatsApp/Email/in-app) both name email as a first-class delivery channel alongside WhatsApp. The Stack table lists "WhatsApp delivery via BSP (Gupshup or Interakt)" and the Deferred section only discusses "WhatsApp BSP contract selection." No transactional email service (e.g., Resend, SES, Postmark) appears anywhere in Stack, Deferred, or the Capability Map's §4.9 row ("Deferred (BSP contract)" — BSP language implies WhatsApp only). Silently dropped rather than deferred.

### 4. NFR-6 (Availability) has no architectural treatment at all
Not present in any AD, the Stack table, or the Deferred section — not even as an acknowledged open item, unlike NFR-2 (explicitly deferred) or the Cost constraint (explicitly, if inadequately, deferred — see #6). This is notable because the deploy-per-tenant pivot makes availability *more* of an architecture concern than it would be under a shared app: there is no shared HA layer to lean on, and each tenant's uptime now depends independently on its own Vercel project + its own managed Postgres instance + its own R2 access, with no stated failover, backup/restore, or multi-region posture for any of them. The PRD itself flags NFR-6 as an open assumption pending a target — the spine had an opportunity to at least name the topic in Deferred (the way it did for NFR-2 and Cost) and didn't.

### 5. NFR-8's Platform-Operator-MFA requirement has no assigned owner post-pivot
AD-10 binds NFR-8 but only describes in-app Clerk-based session/MFA handling for regular application users. NFR-8's actual target is narrower and more specific: *"the cross-tenant Platform Operator role... requires multi-factor authentication, and every Platform Operator action is captured in the same audit trail discipline."* Under AD-2 ("Onboarding is a script, not a workflow"), that role no longer exists as an in-app entity — cross-tenant power now lives with whoever can run `infra/provisioning/`, holds the CI/CD deploy credentials, or has console access to the Vercel/Postgres/R2 accounts. Nothing in AD-2 or AD-10 states that *this* access is MFA-gated or audit-logged. This is distinct from the already-tracked FR-52/53 wording reinterpretation (which is about in-app tenant-scoping semantics) — this is a security control from NFR-8 that had a clear owner in the naive PRD reading and has no stated owner in the new paradigm.

### 6. Cost constraint (§8) — deferred to "Finance," not estimated by Architecture as the PRD assigned, and the pivot's cost-shape change is unacknowledged
PRD §8 Cost constraint explicitly assigns the estimation work to Architecture: *"cost-per-tenant should be estimated during architecture so it can inform [the pricing] decision."* The spine's Deferred bullet reframes this as *"an operational/finance concern for the founder, not a code-level invariant"* and defers it — which both declines the task the PRD assigned to this phase, and never notes that deploy-per-tenant changes the cost curve's *shape*, not just its size: N independent Vercel projects + N independent managed-Postgres instances + N independent R2 buckets is a linear-per-tenant cost structure, materially different from the marginal-cost-per-tenant profile a shared-database app would have had (which is what the PRD's Cost constraint was implicitly written against). Even a rough acknowledgment of that shift — without doing full sizing — would close most of this gap.

## Minor / lower-priority notes (not counted as headline gaps)

- **NFR-5 (Auditability) — actor attribution isn't stated as a schema-level invariant.** AD-9 guarantees immutability + reason-on-correction; Consistency Conventions guarantee a request-id in logs. Neither explicitly states that every transaction row persists a `userId`/actor reference (vs. only being inferable from request logs). Likely intended but not written down as an invariant the way reason-on-correction was.
- **NFR-2's scope in Deferred is narrower than the full NFR.** The Deferred bullet covers photo-compression only; the broader "DSR form fully usable on a low-end Android phone over 2G/3G" (bundle size, code-splitting, image srcset for the photo gallery in FR-31, etc.) isn't named, though AD-8's local-first design does structurally reduce network dependency for the core flow.
- **NFR-7 (modularity/extensibility) is aspirational rather than invariant-backed.** AD-2/AD-3 give some structural support (scripted onboarding, single API surface) but no AD directly states "a new Phase-2 module must be addable without modifying existing modules." Likely acceptable at spine altitude, flagged for awareness only.
