# Adversarial Review — PRD: AzentisFieldOS

**Target:** `prd.md` (status: draft)
**Lens(es) run:** adversarial (explicitly requested; no other lens selected)
**Content class:** docs (requirements document defining system behavior)

---

## Findings (JSON)

```json
[
  {
    "lens": "adversarial",
    "location": "§7 NFR-1 / §4.15 FR-52, FR-53",
    "trigger_condition": "Tenant isolation is declared a hard, security-critical requirement, but no FR/NFR specifies the enforcement mechanism (e.g., DB-level row-level security keyed off an authenticated session's tenant_id vs. app-layer filtering that trusts a client-supplied tenant/site parameter).",
    "guard_snippet": "Add an FR/NFR mandating that tenant scoping is derived exclusively from server-side authenticated session state, never from client-supplied request parameters, and that this is enforced at the data-access layer (not just query-writer discipline), with automated negative tests attempting cross-tenant reads/writes on every endpoint.",
    "potential_consequence": "Engineers implement tenant filtering ad hoc per query; one forgotten WHERE clause or one endpoint that trusts a client-supplied tenant ID leaks another contractor's sites, labour pay data, or photos — exactly the failure mode NFR-1 exists to prevent, but the PRD never specifies how to prevent it."
  },
  {
    "lens": "adversarial",
    "location": "§3 Glossary (Role: Platform Operator) / §4.15 FR-52, FR-53",
    "trigger_condition": "The Platform Operator role is explicitly cross-tenant by design ('no access to tenant business data' is asserted but not enforced by any FR), yet no FR addresses how Platform Operator credentials are protected, MFA'd, or audited, nor whether Platform Operator actions on a tenant are logged into that tenant's own audit trail.",
    "guard_snippet": "Add an FR requiring Platform Operator actions to be individually audited (who, what, when, which tenant touched) and visible/exportable, plus an NFR requiring elevated-privilege auth hardening (MFA) for this role specifically.",
    "potential_consequence": "A single compromised Platform Operator credential becomes a total cross-tenant breach vector with no detection mechanism — the one account explicitly designed to span tenant boundaries is the least specified from a security-control standpoint."
  },
  {
    "lens": "adversarial",
    "location": "§8 Constraints — Platform",
    "trigger_condition": "The PRD itself flags the 'responsive web only' vs. 'offline-capable DSR' tension as unresolved and defers it to architecture, but assigns no owner, no deadline, and no fallback decision if architecture can't cleanly resolve it before build starts.",
    "guard_snippet": "Add an explicit gate: 'Architecture must produce a written resolution of the offline-storage mechanism before Epic/Story breakdown for §4.8 begins,' with a default fallback (e.g., service-worker + IndexedDB) named now so silence doesn't become the decision by omission.",
    "potential_consequence": "Under 'as soon as possible' timeline pressure (§8), engineering picks whatever is fastest to ship (e.g., a simple localStorage queue) without revisiting it — which will not survive NFR-3's 'survive app close, phone restart, OS-level storage pressure' bar, and the gap surfaces only after supervisors start losing DSRs in the field."
  },
  {
    "lens": "adversarial",
    "location": "§4.3 FR-9 (Godown → Site movement)",
    "trigger_condition": "Godown Stock decreases at the moment of recording; Site Stock increases only once receipt is confirmed. No FR defines an 'in-transit' stock state for the gap between those two events, and no FR defines what happens if receipt confirmation never occurs (truck lost, supervisor forgets to confirm).",
    "guard_snippet": "Add an explicit In-Transit stock state/FR: material leaving Godown enters 'In Transit' (visible, not vanished) until receipt is confirmed, plus a timeout/escalation rule (e.g., flagged as overdue after N days unconfirmed) feeding the dashboard's issue list.",
    "potential_consequence": "FR-14's reconciliation guarantee ('any mismatch is a defect') breaks the moment material is mid-transfer — the sum of Godown + Site stock will legitimately not match total purchased during transit, and with no defined in-transit bucket, every open transfer looks like unexplained shrinkage or a system bug."
  },
  {
    "lens": "adversarial",
    "location": "§4.3 FR-9, FR-11 (shortage/damage gap on transfers)",
    "trigger_condition": "The 'received quantity may differ from sent quantity' gap is captured as data, but nothing in the FR prevents the same person (or a colluding pair) from recording both the sent and received quantities as identical every time, which defeats the entire purpose of tracking shortage/damage.",
    "guard_snippet": "Add a consequence/FR requiring sender and receiver to be distinct recorded fields (already partially true — 'person responsible' is captured) and specify that receipt confirmation should ideally come from a different user/session than the one who initiated the transfer, or at minimum flag same-user send+receive pairs for the variance report (FR-12/FR-43).",
    "potential_consequence": "Theft or leakage in transit becomes structurally undetectable — the exact operational risk (paper-book material 'disappearing' between godown and site) that this product claims to fix (§1 Vision) is left just as exploitable in digital form, just with better-looking reports."
  },
  {
    "lens": "adversarial",
    "location": "§4.6 FR-23, FR-24 (Advance Adjustment / Payment)",
    "trigger_condition": "Advance Adjustments can be recorded 'of any amount, at any time' with zero validation — no FR bounds an Adjustment to the currently Outstanding Balance, and no FR prevents a Payment's Net Payable from going negative.",
    "guard_snippet": "Add a testable consequence: 'An Advance Adjustment amount cannot exceed the Advance's current Outstanding Balance at time of recording — the UI blocks/warns, though the owner retains override authority per the never-automatic principle if truly needed' and define what a negative Net Payable means/displays as.",
    "potential_consequence": "A mistyped adjustment (₹20,000 instead of ₹2,000) silently produces a negative Outstanding Balance or a negative Net Payable with no defined system behavior — for a product whose core differentiator is trustworthy handling of other people's money (NFR-5), an unbounded numeric field is a quiet but serious gap."
  },
  {
    "lens": "adversarial",
    "location": "§4.16 FR-54 (append-only audit / corrections)",
    "trigger_condition": "Corrections to past transactions are 'new, linked transactions,' but no FR requires a mandatory reason/justification on a correcting entry, and no FR limits who can create unlimited correcting entries.",
    "guard_snippet": "Require a mandatory reason field on any correcting transaction, and add a consequence that a Material/Advance/Payment record with more than one correction is surfaced distinctly in reports (e.g., 'amended' flag) so reviewers can spot repeated after-the-fact changes.",
    "potential_consequence": "Append-only in mechanism but not in practice: an Owner/Admin (or a compromised account) can issue unlimited unexplained 'corrections' to functionally erase or launder a prior entry, giving the audit trail the appearance of integrity (NFR-5) without the substance — this is the exact gap a government/RA-bill audit (Open Question 4) would catch and reject."
  },
  {
    "lens": "adversarial",
    "location": "§2.3 UJ-1 edge case vs. §4.16 FR-54",
    "trigger_condition": "UJ-1's offline edge case says a second DSR submission before the first syncs is 'treated as an edit to the queued entry, not a duplicate' — this directly conflicts with FR-54's principle that no UI path exists to edit a past transaction; the PRD never reconciles whether a not-yet-synced DSR is mutable (contradicting append-only) or whether pre-sync edits are themselves a distinct, unaudited category.",
    "guard_snippet": "Explicitly define DSR-in-queue as a distinct pre-commit state exempt from append-only rules (with its own edit history retained locally), and state that once synced/committed, the standard FR-54 append-only rule takes over — resolving Open Question 5 rather than leaving both rules simultaneously true.",
    "potential_consequence": "Without reconciliation, two engineers building against this PRD will make different, incompatible assumptions about whether offline DSR edits are tracked — one preserving edit history, one silently overwriting — and the discrepancy won't surface until a dispute over what a supervisor 'actually' reported."
  },
  {
    "lens": "adversarial",
    "location": "§4.5 FR-20 / §4.8 FR-28 (Site-scoped DSR submission authorization)",
    "trigger_condition": "A Site Supervisor is 'scoped to their current activity' / 'assigned Site(s) day-to-day, not permanently bound' but no FR defines who performs that day-to-day assignment, nor what prevents a Supervisor from submitting a DSR (and associated labour/payment-affecting Work Records) for a Site they were not actually assigned to that day.",
    "guard_snippet": "Add an FR defining the daily Site-assignment mechanism (who sets it, when) and a consequence that DSR/Work Record submission is restricted to a Supervisor's currently assigned Site(s), with any override by Owner/Admin explicitly logged.",
    "potential_consequence": "Because Work Records feed labour Payments (§4.6) and Payments involve real cash, an unscoped submission path lets a Supervisor log attendance/hours at a Site they weren't at — inflating payment claims — with no structural control to prevent or even flag it, undermining the same financial trust NFR-5 is meant to protect."
  },
  {
    "lens": "adversarial",
    "location": "§4.10 FR-35 (missing-DSR flag) vs. undefined day boundary",
    "trigger_condition": "The dashboard flags a Site with 'no DSR yet for today,' and SM-1 (a primary success metric tied to the pilot's pay-for-quality arrangement, §8) is defined as '% of active Sites with a DSR submitted for the previous calendar day' — but no FR/NFR defines what 'day' means (midnight local time? site-specific shift boundary? contractor's business-day cutoff?).",
    "guard_snippet": "Add an explicit definition: 'Day boundary = midnight IST, applied uniformly across all Sites/Tenants regardless of site-local shift patterns,' and note it as a decision point if night-shift sites exist.",
    "potential_consequence": "SM-1 — the metric used to judge whether the paying pilot client is getting a 'quality' product (§8 Monetization) — is ambiguous and gameable at the boundary (a DSR submitted at 12:01am could count for either day depending on undocumented interpretation), risking a metrics dispute baked into the contract itself."
  },
  {
    "lens": "adversarial",
    "location": "§4.8 FR-30 (multi-photo DSR) vs. §7 NFR-2 (2G/3G, low-end Android)",
    "trigger_condition": "DSRs require multiple photos per submission (FR-30) while NFR-2 mandates full usability over 2G/3G-equivalent connections on low-end Android — no FR/NFR addresses photo compression, chunked/background upload, size caps, or deferred-upload-with-immediate-text-sync behavior.",
    "guard_snippet": "Add an NFR: photos are compressed client-side before queuing, upload independently of (and can lag behind) the text/structured DSR data, and a DSR is considered 'synced' for text/structured data even while photo uploads continue in the background — with visible per-photo sync status.",
    "potential_consequence": "A naive implementation makes the primary and 'single most important daily workflow' (§4.8 description) effectively unusable on the exact network conditions it explicitly targets — large photo payloads stall or fail to sync over patchy connections, directly undermining UJ-1's climax ('saved on device — will sync when back online') and NFR-3."
  },
  {
    "lens": "adversarial",
    "location": "§4.2 FR-6 (unit-of-measure consistency)",
    "trigger_condition": "A Material's unit is enforced consistently with no conversion step ('out of scope'), but real vendor deliveries in this domain routinely arrive in a different unit than the catalog default (e.g., cement sometimes billed by bag count, sometimes by bulk tonnage) — the PRD offers no path to record this without violating unit consistency or duplicating the Material under a second unit.",
    "guard_snippet": "Either explicitly document the workaround (admin creates a second Material variant per unit, accepting catalog duplication) as the intended v1 behavior, or add a lightweight FR for a per-Purchase unit override with a stored conversion factor.",
    "potential_consequence": "Site staff hit a real, common transaction they cannot record cleanly in v1, and improvise (miscoding the unit, fudging the quantity) — reintroducing exactly the 'reconciling paper receipts against what's physically at each site' problem (§2.1 JTBD) the product exists to eliminate."
  },
  {
    "lens": "adversarial",
    "location": "§4.15 FR-52 / general — tenant offboarding",
    "trigger_condition": "Tenant provisioning (FR-52) and isolation (FR-53) are specified in detail, but no FR addresses tenant deprovisioning, churn, or data deletion/export if a contractor stops paying or the relationship ends.",
    "guard_snippet": "Add an FR for tenant offboarding: data export on request, a defined retention/deletion timeline post-churn, and confirmation this doesn't silently break the multi-tenant resale model's other active tenants.",
    "potential_consequence": "As a resale SaaS business (§1 Vision, 'the operating system for the next contractor client, and the one after that'), the absence of an offboarding story is a gap that will surface at the worst time — a churning client's data (including their labourers' PII and photos) has no defined disposition, which is also a live legal exposure once DPDP Act applicability (§8) gets confirmed."
  },
  {
    "lens": "adversarial",
    "location": "§4.14 FR-48 (Users, roles, permissions) — offboarding",
    "trigger_condition": "No FR addresses deactivating/revoking a User's access when a Site Supervisor or Owner/Admin user leaves the contractor's employment.",
    "guard_snippet": "Add a consequence to FR-48: a deactivated User immediately loses all access (including any already-issued session tokens) and is excluded from future assignment while their historical attributed records remain intact.",
    "potential_consequence": "A departed employee with knowledge of labour payment data, advance records, and site photos retains live access indefinitely — a straightforward, foreseeable insider-risk gap for a system explicitly handling other people's money and PII."
  },
  {
    "lens": "adversarial",
    "location": "§4.9 FR-33 / §8 Privacy-Data Governance",
    "trigger_condition": "Automated report delivery pushes DSR content — including site photos that 'may capture people' (§8's own privacy note) — through WhatsApp/Email, i.e., third-party infrastructure, but the privacy constraint in §8 only discusses in-app access-scoping, not the implications of transmitting the same PII off-platform via WhatsApp Business API/email providers.",
    "guard_snippet": "Extend the §8 privacy constraint to explicitly cover third-party transmission: confirm what the WhatsApp Business API / email provider's data handling terms permit for PII-containing photos, and whether consent/notice to Team Members photographed is needed before automated external delivery.",
    "potential_consequence": "The product ships a data flow (labourer photos leaving the platform via a third-party API on every DSR) that was never evaluated against the very compliance question (DPDP Act, §8) the PRD flags as unconfirmed — turning a flagged-but-deferred risk into a live one on day one of the pilot."
  },
  {
    "lens": "adversarial",
    "location": "§9 Success Metrics, §8 Monetization (pilot pay-for-quality)",
    "trigger_condition": "SM-1, SM-2, and SM-4 targets are explicitly PRD-invented ('[ASSUMPTION — not set by founder]'), yet §8 states the pilot pays based on 'quality of the delivered product' rather than a fixed spec — meaning the metrics most likely to be cited as evidence of quality were never agreed with the paying client.",
    "guard_snippet": "Before build, get the founder/pilot contractor to explicitly ratify (or replace) SM-1/SM-2/SM-4 targets in writing, since they will likely be used as the de facto definition of 'quality' in a payment conversation that has no other fixed spec to anchor to.",
    "potential_consequence": "A payment dispute becomes likely: the team optimizes to metrics it invented, the client judges quality by different (unstated) criteria, and there is no written agreement resolving the gap — a foreseeable consequence of combining an unfixed-price contract with unconfirmed success targets."
  },
  {
    "lens": "adversarial",
    "location": "§7 NFR-6 (Availability) / general — no incident/backup posture",
    "trigger_condition": "NFR-6 flags the uptime target as unset, but the PRD also has no NFR at all for data backup/disaster-recovery, despite the product being the sole system of record for financial (advances/payments) and inventory data replacing paper books.",
    "guard_snippet": "Add an NFR for backup frequency/retention and a recovery-time/recovery-point objective, distinct from the uptime target — 'no downtime' and 'no data loss on failure' are different guarantees and only one is even flagged as missing.",
    "potential_consequence": "If the system is the only record of labour advances and material stock (the paper books it replaces are explicitly being abandoned per §1 Vision), a database failure with no backup posture defined could destroy the sole record of real cash owed to real workers — a severity the PRD doesn't seem to have weighed at all."
  }
]
```

---

## Markdown Report

### Lens: Adversarial (17 findings)

**1. Tenant isolation — no enforcement mechanism specified**
`§7 NFR-1 / §4.15 FR-52, FR-53`
NFR-1 declares tenant isolation security-critical but never says *how* it's enforced (DB row-level security vs. app-layer filtering trusting client input).
*Fix:* Mandate server-derived tenant scoping at the data-access layer plus automated cross-tenant negative tests per endpoint.
*Consequence:* One forgotten WHERE clause leaks another tenant's data — the exact failure this NFR exists to prevent.

**2. Platform Operator is the least-controlled cross-tenant account**
`§3 Glossary / §4.15`
Cross-tenant-by-design role has no audit, MFA, or logging requirement.
*Fix:* Require per-action audit logging and elevated-auth hardening for this role.
*Consequence:* A single compromised credential is a total cross-tenant breach vector with no detection.

**3. Offline vs. responsive-web-only tension has no resolution owner or deadline**
`§8 Constraints — Platform`
PRD names the tension but doesn't force a decision before build.
*Fix:* Gate story breakdown on an architecture decision, with a default fallback named now.
*Consequence:* Timeline pressure picks the fastest option, which may not meet NFR-3.

**4. No "in-transit" stock state for Godown→Site transfers**
`§4.3 FR-9`
Stock leaves Godown before it's confirmed received at Site — vanishing in the gap.
*Fix:* Add an explicit In-Transit state with a confirmation-timeout escalation.
*Consequence:* FR-14's reconciliation guarantee breaks for every open transfer, reading as a defect that isn't one.

**5. Shortage/damage tracking is self-defeatable**
`§4.3 FR-9, FR-11`
Nothing stops the same person recording identical sent/received quantities every time.
*Fix:* Require distinct sender/receiver identities or flag same-user send+receive pairs.
*Consequence:* In-transit theft stays structurally undetectable — digitizing the exact paper-era risk this product claims to fix.

**6. Advance/Payment fields are financially unbounded**
`§4.6 FR-23, FR-24`
No FR bounds an Adjustment to the Outstanding Balance or prevents negative Net Payable.
*Fix:* Bound adjustments to outstanding balance (with owner override) and define negative-payable handling.
*Consequence:* A typo silently corrupts real wage records with no defined system response.

**7. Append-only audit has no mandatory reason on corrections**
`§4.16 FR-54`
Unlimited, unexplained "correcting" transactions are allowed.
*Fix:* Require a reason field and surface repeat-corrected records distinctly in reports.
*Consequence:* Audit trail has the form of integrity without the substance — a gap a government audit (Open Q4) would catch.

**8. UJ-1's offline-edit rule contradicts FR-54's append-only rule**
`§2.3 UJ-1 / §4.16 FR-54`
Queued DSR "edits" vs. "no UI path to edit a past transaction" are never reconciled.
*Fix:* Define pre-sync DSR state as explicitly exempt from append-only, with its own local edit history.
*Consequence:* Two engineers will build incompatible assumptions about whether offline edits are tracked.

**9. No control over who can submit a DSR for which Site**
`§4.5 FR-20 / §4.8 FR-28`
No FR defines daily Site-assignment or restricts DSR submission to a Supervisor's assigned Site.
*Fix:* Add assignment mechanism plus submission scoping, with Owner/Admin overrides logged.
*Consequence:* A Supervisor can log attendance/hours at a Site they weren't at, inflating payment claims unchecked.

**10. Undefined "day boundary" undermines the primary success metric**
`§4.10 FR-35 / §9 SM-1`
Neither the missing-DSR flag nor SM-1 define what "day" means across sites/shifts/timezone.
*Fix:* Explicitly define the day-boundary rule (e.g., midnight IST) applied uniformly.
*Consequence:* The metric used to judge pay-for-quality delivery (§8) is ambiguous and gameable at the edges.

**11. Photo-heavy DSR conflicts with the 2G/3G performance target**
`§4.8 FR-30 / §7 NFR-2`
No compression, chunked upload, or deferred-photo-sync behavior specified.
*Fix:* Compress client-side, decouple photo sync from text/data sync, show per-photo status.
*Consequence:* The "single most important daily workflow" becomes unusable on the exact network it targets.

**12. Unit-of-measure rigidity has no real-world escape hatch**
`§4.2 FR-6`
Vendor deliveries commonly arrive in a different unit than catalog default; no conversion or override path exists.
*Fix:* Document the duplication workaround explicitly, or add a per-Purchase conversion override.
*Consequence:* Field staff improvise around a transaction they can't record cleanly, reintroducing the reconciliation problem the product exists to solve.

**13. No tenant offboarding/deprovisioning story**
`§4.15 FR-52`
Provisioning is specified; churn/deletion/export is not, despite a resale business model.
*Fix:* Add an FR for data export and a retention/deletion timeline on tenant offboarding.
*Consequence:* A churning client's PII-laden data has no defined disposition — live legal exposure once DPDP applicability is confirmed.

**14. No user deactivation/offboarding requirement**
`§4.14 FR-48`
Departed employees' access isn't addressed.
*Fix:* Require immediate access revocation on deactivation, including active sessions.
*Consequence:* Ex-employees retain live access to wage and PII data indefinitely.

**15. Third-party WhatsApp/Email delivery of PII-laden photos not covered by the privacy constraint**
`§4.9 FR-33 / §8`
§8's privacy note only covers in-app access-scoping, not off-platform transmission via WhatsApp Business API/email.
*Fix:* Extend the privacy constraint to third-party transmission and consent implications.
*Consequence:* A flagged-but-deferred compliance risk (DPDP) becomes live from day one via an unevaluated data flow.

**16. Invented success metrics anchor a pay-for-quality contract**
`§9 / §8 Monetization`
SM-1/SM-2/SM-4 targets are PRD-recommended defaults, not founder-agreed, in a contract explicitly priced on "quality."
*Fix:* Get explicit founder/client ratification of these targets before build.
*Consequence:* A likely payment dispute with no written definition of "quality" to anchor it.

**17. No backup/disaster-recovery NFR at all**
`§7 NFR-6 / general`
Only uptime is flagged as unset; data-loss protection isn't mentioned anywhere.
*Fix:* Add a backup/retention NFR with RPO/RTO, distinct from the availability target.
*Consequence:* The sole system of record for real cash owed to real workers has no defined protection against data loss.

---

**Total findings: 17** (exceeds the lens's 10-minimum floor; no re-check needed).
