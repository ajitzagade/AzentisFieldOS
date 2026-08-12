# Edge-Case Review — AzentisFieldOS PRD

**Content:** `/Users/priyanka/Desktop/Development/AzentisFieldOS/_bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md`
**Lens:** edge-case-hunter (only)
**Content class:** docs — a requirements document defining behavior (FRs with testable Consequences), in scope for this behavioral lens.

Findings are unhandled paths/boundaries only — anything the PRD's "Consequences (testable)" already cover was discarded silently, per the lens method.

```json
[
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.1 FR-1 (L102-108)",
    "trigger_condition": "Site status transitions back from completed/on-hold to active (reopening) not addressed",
    "guard_snippet": "define an explicit allowed status-transition matrix for Site.status",
    "potential_consequence": "reopened Site could produce inconsistent rollup/report history"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.1 FR-1/FR-3 (L102-120)",
    "trigger_condition": "A freshly provisioned Tenant (FR-52) with zero Sites — dashboard/rollup state for this window is undefined",
    "guard_snippet": "specify an explicit empty-state for a zero-Site tenant across FR-3/FR-34-38",
    "potential_consequence": "new tenant dashboard could error or show misleading blank rollups right after onboarding"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.2 FR-4 (L127-133)",
    "trigger_condition": "Disabling a Category that still contains non-disabled Materials is not addressed",
    "guard_snippet": "block Category disable while active child Materials exist, or cascade-disable them",
    "potential_consequence": "dropdowns could keep showing materials under a disabled category, or leave them orphaned"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.2 FR-5 (L134-140)",
    "trigger_condition": "No path to disable/retire a Size that still has open Stock",
    "guard_snippet": "block Size disable while Stock>0, or require an explicit override with warning",
    "potential_consequence": "stock becomes untrackable through normal UI once its size is removed"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.2 FR-6 (L141-146)",
    "trigger_condition": "Changing a Material's assigned Unit after transactions already exist in the prior Unit is not addressed",
    "guard_snippet": "lock Unit once first transaction is recorded, or store the Unit per-transaction rather than per-Material",
    "potential_consequence": "historical and new transactions silently mix units, corrupting FR-14 lifecycle totals"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-8 (L157-163)",
    "trigger_condition": "Zero or negative Purchase quantity/rate is not guarded",
    "guard_snippet": "reject qty<=0 or rate<0 at entry validation",
    "potential_consequence": "negative/zero purchases silently corrupt Stock and cost totals"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-9 (L164-170)",
    "trigger_condition": "Received quantity greater than sent quantity (over-receipt) is not addressed — only the shortage direction is",
    "guard_snippet": "validate received<=sent, or record over-receipt as its own flagged anomaly",
    "potential_consequence": "Site Stock could be inflated beyond what was actually shipped"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-9 (L164-170)",
    "trigger_condition": "A transfer recorded as sent but never marked received has no timeout or reconciliation path",
    "guard_snippet": "define a 'pending receipt' state with an aging/exception report",
    "potential_consequence": "destination Stock stays permanently understated, silently stuck in transit"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-9/FR-11 (L164-182)",
    "trigger_condition": "Sending more Material than current Godown/source-Site Stock (driving it negative) is not guarded",
    "guard_snippet": "block send when qty > available stock, or explicitly allow and flag resulting negative stock",
    "potential_consequence": "physically impossible negative stock gets recorded and reconciled as normal"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-11 (L178-182)",
    "trigger_condition": "Site-to-Site transfer where source Site equals destination Site is not guarded",
    "guard_snippet": "reject transfer when source_site_id == destination_site_id",
    "potential_consequence": "a no-op self-transfer pollutes transaction history and skews variance reports"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-12 (L184-189)",
    "trigger_condition": "Consumption exceeding current Site Stock (driving it negative) is not addressed",
    "guard_snippet": "block or explicitly flag consumption > available stock",
    "potential_consequence": "the reconciliation formula in FR-14, defined as a 'defect' if violated, can be broken by Consumption alone"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-13 (L191-195)",
    "trigger_condition": "Return/Wastage quantity exceeding what is currently on-site is not addressed",
    "guard_snippet": "cap return/wastage qty at current site stock or flag the excess",
    "potential_consequence": "stock can go negative through over-reported wastage/return"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.3 FR-14 (L197-201)",
    "trigger_condition": "Two concurrent transactions on the same Material/Site (race between simultaneous movements) are not addressed",
    "guard_snippet": "use atomic increment/decrement or optimistic locking on Stock rows",
    "potential_consequence": "a lost-update race makes displayed Stock diverge from the transaction sum"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.4 FR-17 (L221-225)",
    "trigger_condition": "Two overlapping movement records for the same Machine to two different Sites (double-booking) is not addressed",
    "guard_snippet": "reject a new movement while the asset's current location is already mid-transit/conflicting",
    "potential_consequence": "a Machine could appear 'currently at' two Sites at once"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.4 FR-17 (L221-225)",
    "trigger_condition": "Moving an asset directly Site-to-Site while its state is 'Maintenance' isn't guarded against the stated lifecycle",
    "guard_snippet": "enforce Maintenance→Available transition before allowing a Site-to-Site move",
    "potential_consequence": "an asset under repair could show as in active use at a Site"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.5 FR-19 (L239-244)",
    "trigger_condition": "Deactivating/removing a Team Member who still has an outstanding Advance balance is not addressed",
    "guard_snippet": "block deactivation while Outstanding Balance>0, or keep the balance visible/actionable post-deactivation",
    "potential_consequence": "an outstanding advance becomes untracked and effectively unrecoverable"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.5 FR-20 (L245-250)",
    "trigger_condition": "A Team Member with Work Records at two different Sites on the SAME date — only the two-different-dates case is declared expected behavior",
    "guard_snippet": "explicitly define whether same-day, two-Site attendance is valid, an error, or requires a flag/warning",
    "potential_consequence": "payroll/attendance totals could double-count a person or mask a genuine data-entry mistake"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.5 FR-20 (L245-250)",
    "trigger_condition": "No guard on negative or zero attendance/overtime hours",
    "guard_snippet": "reject hours<0 (and treat 0 distinctly from 'not entered')",
    "potential_consequence": "negative hours corrupt payment and reporting totals"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.6 FR-22 (L262-266)",
    "trigger_condition": "Zero or negative Advance amount is not addressed",
    "guard_snippet": "reject amount<=0 at entry",
    "potential_consequence": "a negative 'advance' could manipulate Outstanding Balance outside the Adjustment mechanism"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.6 FR-23 (L268-274)",
    "trigger_condition": "An Advance Adjustment amount exceeding the Team Member's current Outstanding Balance is not addressed",
    "guard_snippet": "cap Adjustment at Outstanding Balance, or explicitly define/allow a resulting negative balance",
    "potential_consequence": "Outstanding Balance goes negative, breaking FR-25's 'reconciles exactly' guarantee"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.6 FR-23 (L268-274)",
    "trigger_condition": "A negative-amount Adjustment (effectively increasing the advance outside FR-22's entry path) is not guarded",
    "guard_snippet": "reject Adjustment amount<=0",
    "potential_consequence": "Adjustments become a back door to increase an Advance, bypassing FR-22"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.6 FR-24 (L275-280)",
    "trigger_condition": "Net Payable formula can go negative when Deductions + Advance Adjustment exceed Base + Additional; behavior is undefined",
    "guard_snippet": "define explicit handling: block negative Net Payable, or allow and carry forward as a receivable",
    "potential_consequence": "a negative payment could be recorded/paid with no defined meaning"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.8 FR-28 (L308-313)",
    "trigger_condition": "Two different Supervisors submitting/editing the same Site/date DSR concurrently while online (distinct from the offline case in Open Question 5) is unaddressed",
    "guard_snippet": "apply optimistic locking or last-write-wins-with-warning on DSR edits",
    "potential_consequence": "one supervisor's entries can be silently overwritten by a concurrent submission"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.8 FR-29 (L315-320)",
    "trigger_condition": "Partial sync failure — DSR core fields sync but linked photos, Consumption, or Work Record sub-entries fail mid-transaction — is not addressed",
    "guard_snippet": "make DSR sync atomic per-DSR, or track a distinct partial-sync state per sub-record",
    "potential_consequence": "a DSR can show as 'synced' while linked stock/photo records never arrive server-side"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.8 FR-29 / §7 NFR-3 (L315-320, L509)",
    "trigger_condition": "On-device storage insufficient to queue a NEW offline DSR (vs. surviving pressure on already-queued data) is not addressed",
    "guard_snippet": "detect low-storage before accepting an offline submission and warn the Supervisor",
    "potential_consequence": "a DSR entry could silently fail to queue, contradicting the 'never lost' guarantee"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.8 FR-29 (L315-320)",
    "trigger_condition": "Sync retried after an ambiguous network failure (server received it but the ack was lost) risks duplicate records; idempotency not addressed",
    "guard_snippet": "use a client-generated idempotency key per queued entry, deduped server-side",
    "potential_consequence": "retried sync creates duplicate Consumption/Work Record/Expense entries"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.9 FR-32/FR-33 (L341-352)",
    "trigger_condition": "Auto-report generation/delivery when no DSR was submitted for a Site that day — empty-report vs. skip is undefined",
    "guard_snippet": "explicitly skip generation, or send an explicit 'no report today' notice, distinct from a delivery failure",
    "potential_consequence": "owner receives a blank/misleading report or nothing, indistinguishable from a failure"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.9 FR-32/FR-33 (L341-352)",
    "trigger_condition": "A DSR corrected/edited after the day's report was already generated and delivered — whether it's regenerated/resent is unaddressed",
    "guard_snippet": "define a re-send or correction-notice rule for post-delivery DSR edits",
    "potential_consequence": "owner acts on a stale report while a corrected version exists unseen"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.10 FR-35 (L361-362)",
    "trigger_condition": "'Flags any Site with no DSR' doesn't exclude Sites with status on-hold/completed, which legitimately have no daily activity",
    "guard_snippet": "scope the missing-DSR flag to active Sites only",
    "potential_consequence": "constant false-positive flags for inactive Sites erode trust in the dashboard signal"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.10 FR-36 (L364-368)",
    "trigger_condition": "Boundary behavior at exactly the low-stock threshold (>= vs >) is unspecified",
    "guard_snippet": "specify inclusive comparison, e.g. stock <= threshold triggers the flag",
    "potential_consequence": "off-by-one ambiguity suppresses or duplicates the intended low-stock alert"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.14 FR-48 (L434-435)",
    "trigger_condition": "Removing or demoting the Tenant's last remaining Owner/Admin user is not addressed",
    "guard_snippet": "block removal/demotion of the last Owner/Admin in a Tenant",
    "potential_consequence": "a Tenant is left with no admin able to manage users, config, or Sites"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.14 FR-50/FR-51 (L440-444)",
    "trigger_condition": "A configured report/notification recipient who is later deactivated or removed as a User is not addressed",
    "guard_snippet": "validate and clean the recipient list on user deactivation",
    "potential_consequence": "automated deliveries silently fail or error against a stale recipient"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.15 FR-52 (L453-457)",
    "trigger_condition": "No FR covers Tenant deactivation/suspension (e.g., non-payment) — only provisioning is defined",
    "guard_snippet": "define a Tenant status/lifecycle beyond 'created'",
    "potential_consequence": "no mechanism exists to offboard or suspend a Tenant if the commercial relationship ends"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§4.16 FR-54 (L469-474)",
    "trigger_condition": "Correcting a transaction that is itself already a correcting entry (chained corrections) — how 'current' is derived is unaddressed",
    "guard_snippet": "define correction-chain resolution, e.g. only the latest correction in a chain counts toward current state",
    "potential_consequence": "replaying history yields an ambiguous or wrong 'current' value once corrections stack"
  },
  {
    "lens": "edge-case-hunter",
    "location": "prd.md:§3 Glossary Role / §4.5 FR-20 (L93, L245-250)",
    "trigger_condition": "A Site Supervisor recording a Work Record/DSR for a Site they are not currently assigned to is not guarded, despite the Role entry scoping them 'day-to-day'",
    "guard_snippet": "enforce Supervisor DSR/Work-Record entry to their currently-assigned Site(s) only",
    "potential_consequence": "a Supervisor can log activity for a Site they have no current relationship to, undetected"
  }
]
```

## Markdown Report

**Content class:** docs (requirements document with a defined behavioral surface)
**Lens run:** edge-case-hunter only (explicitly requested — `applies_to`/`when` filtering skipped per an explicit lens request)
**Findings:** 34

Every finding below is a path or boundary condition that the PRD's FR-level "Consequences (testable)" section does not cover. Handled paths were discarded silently per the lens method — no editorializing on whether the PRD is otherwise good.

### §4.1 Multi-Site & Project Management
- **FR-1** — Site status transition back to active from completed/on-hold (reopening) is unaddressed.
- **FR-1/FR-3** — Dashboard/rollup state for a Tenant with zero Sites (the window right after FR-52 provisioning) is undefined.

### §4.2 Inventory & Material Catalog Configuration
- **FR-4** — Disabling a Category that still has active child Materials is unaddressed.
- **FR-5** — No path to disable a Size that still has open Stock.
- **FR-6** — Changing a Material's Unit after transactions exist in the prior Unit is unaddressed.

### §4.3 Inventory Lifecycle & Movement
- **FR-8** — Zero/negative Purchase quantity or rate is unguarded.
- **FR-9** — Over-receipt (received > sent) is unaddressed; only shortage is.
- **FR-9** — A transfer sent but never confirmed received has no timeout/reconciliation.
- **FR-9/FR-11** — Sending more than available source Stock (negative stock) is unguarded.
- **FR-11** — Self-transfer (source Site = destination Site) is unguarded.
- **FR-12** — Consumption exceeding available Site Stock is unaddressed.
- **FR-13** — Return/Wastage exceeding what's on-site is unaddressed.
- **FR-14** — Concurrent/racing transactions on the same Material/Site are unaddressed.

### §4.4 Machinery & Vehicle Registers
- **FR-17** — Overlapping/double-booked movement records for the same asset are unguarded.
- **FR-17** — Moving an asset Site-to-Site while it's in "Maintenance" state isn't guarded against the stated lifecycle.

### §4.5 Labour & Team Management
- **FR-19** — Deactivating a Team Member with an outstanding Advance is unaddressed.
- **FR-20** — Work Records at two different Sites on the SAME date — only the two-different-dates case is declared expected; same-day is silent.
- **FR-20** — Negative/zero attendance or overtime hours are unguarded.

### §4.6 Labour Advances & Payments
- **FR-22** — Zero/negative Advance amount is unguarded.
- **FR-23** — Advance Adjustment exceeding the current Outstanding Balance is unaddressed.
- **FR-23** — Negative-amount Adjustment (a back door to increase an advance) is unguarded.
- **FR-24** — Net Payable formula going negative is unaddressed.

### §4.8 Daily Site Report
- **FR-28** — Concurrent online edit/submit of the same Site/date DSR by two Supervisors is unaddressed (distinct from the offline case already flagged as Open Question 5).
- **FR-29** — Partial sync (DSR core succeeds, linked sub-records fail) is unaddressed.
- **FR-29/NFR-3** — Insufficient device storage to queue a *new* offline entry (vs. surviving pressure on already-queued data) is unaddressed.
- **FR-29** — Sync-retry idempotency after an ambiguous network failure is unaddressed — risk of duplicate records.

### §4.9 Automated Report Generation & Delivery
- **FR-32/FR-33** — No-DSR-that-day report generation/delivery behavior (skip vs. empty report) is undefined.
- **FR-32/FR-33** — Whether a post-delivery DSR correction triggers a resend is unaddressed.

### §4.10 Contractor Dashboard
- **FR-35** — Missing-DSR flag doesn't exclude on-hold/completed Sites.
- **FR-36** — Low-stock threshold boundary (>= vs >) is unspecified.

### §4.14 Admin Configuration
- **FR-48** — Removing/demoting a Tenant's last Owner/Admin (lockout) is unaddressed.
- **FR-50/FR-51** — Deactivated User still configured as a report/notification recipient is unaddressed.

### §4.15 Multi-Tenant / White-Label Platform
- **FR-52** — No Tenant deactivation/suspension lifecycle exists — only provisioning.

### §4.16 Audit & Transaction History
- **FR-54** — Correction-of-a-correction (chained corrections) resolution is unaddressed.

### Cross-cutting
- **Glossary Role / FR-20** — A Supervisor logging a Work Record/DSR for a Site outside their current assignment is unguarded.

No deletion-check findings (not applicable — this is a document review, not a diff removing code).
