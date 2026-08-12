# Rubric Walk — ARCHITECTURE-SPINE.md (AzentisFieldOS, initiative altitude)

**Reviewer lens:** good-spine checklist (`.claude/skills/bmad-architecture/references/reviewer-gate.md`)
**Reviewed against:** PRD `_bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md` (FR-1..FR-54, NFR-1..NFR-8) + spine's `.memlog.md`
**Mechanical lint:** `lint_spine.py` → 0 findings (clean: no placeholders, AD IDs monotonic/unique, every AD has Binds/Prevents/Rule, no empty Stack version cells)
**Repo state:** confirmed greenfield (no existing app code under the repo root) — the "ratifies rather than contradicts a brownfield codebase" checklist item is N/A. No parent/companion spine is inherited (`companions: []`) — the "no new AD weakens an inherited one" item is also N/A.

## Verdict

**Conditional pass.** The paradigm (deploy-per-tenant) is a strong, well-reasoned answer to the PRD's highest-stakes risk (NFR-1), and 9 of 10 ADs are sharp, enforceable, and correctly scoped. But the checklist's specific warning — "a whole dimension left silent is a finding, especially the operational/environmental envelope a domain-focused draft skips" — is exactly what happened here. This spine is thorough on data-model and UI-consistency invariants and genuinely thin on deployment/environments, infra-provider commitment, and operations, which matters more than usual because this is launch-grade build substrate for a paying pilot client, not a prototype. Fix the Critical + High items below before this goes to Finalize handoff; the spine does not need a structural redo.

## Findings by severity

### Critical (2)

**C1 — Operations (monitoring, backup/DR, incident response) is entirely unaddressed — not decided, not deferred, not an open question.**
The paradigm puts a paying client's append-only financial and stock history (AD-9) into N independently managed Postgres databases, one per tenant, operated by what the memlog describes as "a small/AI-agent-built team." Nowhere in the spine — not in Stack, not in Consistency Conventions, not in Deferred — is there any mention of: automated backups / point-in-time recovery for tenant databases, error tracking / APM (e.g. Sentry-class tooling), uptime/alerting, or an incident-response path if a tenant's deployment goes down or a provider has an outage. NFR-6 (availability) is flagged `[ASSUMPTION]` in the PRD and the spine doesn't pick it up at all, even to defer it explicitly. AD-9's core promise ("current-state values are always derivable by replaying the transaction history") is only as strong as that history surviving an operational incident — and the spine says nothing about how it would. This is the single dimension the checklist calls out by name, and it's silent.
*Disposition:* discuss with founder, then add either a new AD or a scoped, reasoned Deferred entry (e.g., "backup: rely on provider's built-in PITR, decided at provisioning time" + "monitoring: deferred to post-pilot, minimum bar = Vercel/provider default alerting only").

**C2 — No async/background job execution model is named, despite two PRD capabilities structurally depending on one.**
FR-32/33 (daily report compile + WhatsApp/email delivery, with NFR-4's retry requirement) and AD-8's own "background sync process drains the queue against the API" both require something that runs outside a request/response cycle. The chosen hosting paradigm is Vercel serverless functions (per-tenant project) — which have execution-time ceilings and no default persistent worker/queue. The spine never says what runs this: Vercel Cron + a queue (Upstash QStash, Inngest, etc.), a small dedicated worker service, or something else. This is exactly the kind of structural choice where two engineers building FR-33's delivery job and AD-8's sync drain independently would reach for different, likely incompatible, mechanisms — the checklist's definition of a real divergence point the spine should fix and didn't.
*Disposition:* needs an AD (or at minimum a named, reasoned Deferred entry acknowledging the serverless-vs-background-job tension the way the PRD itself flagged the PWA-vs-responsive-web tension in §8 Constraints).

### High (4)

**H1 — Postgres provider is left ambiguous ("Neon or Supabase") without being named in Deferred.**
Every other genuinely open vendor choice in this spine is explicitly parked under Deferred with a stated rationale (WhatsApp BSP: Gupshup/Interakt/AiSensy). The Postgres provider isn't — it's just written as "17.x, via Neon or Supabase" in the Stack table, which reads as still-undecided but isn't flagged as such. This matters more than a typical vendor swap: Neon and Supabase differ in connection-pooling behavior (Prisma + serverless pooling is a known sharp edge with Neon specifically), backup/PITR mechanics, and branching features that AD-2's provisioning script would need to target concretely. If AD-2's `infra/provisioning/` script has to "create the managed Postgres instance," it needs one answer, not two — otherwise tenant 1 and tenant 2 could end up on different providers with different operational behavior by accident of who provisioned them and when.
*Disposition:* pick one (or move to Deferred with the same rigor as the WhatsApp BSP entry, stating why either choice is safe given no provider-specific feature is relied on).

**H2 — AD-9 (append-only transactions), the highest-consequence invariant in the document, is enforced only by convention, not by a technical control.**
The Rule states "no `UPDATE`, no `DELETE`, from application code" — but the enforcement mechanism described is entirely "the application code doesn't do it." For the invariant explicitly named as preventing "silent overwrites of money- or material-moving state" on a paying client's data, this is the one Rule in the whole spine that most warrants a DB-level backstop (e.g., `REVOKE UPDATE, DELETE` on the transaction-history tables for the app's runtime role, or a blocking trigger) rather than relying purely on code review and Prisma-layer discipline never being bypassed by a migration, hotfix script, or console query. Every other AD in the document either has a structural enforcement path (AD-1's "no `tenant_id` column exists" is enforced by schema absence, AD-3 is enforceable via import boundaries) or is an acknowledged soft convention (AD-5, AD-6). AD-9 reads as though it has structural enforcement but doesn't.
*Disposition:* strengthen the Rule to name a DB-level control, or explicitly acknowledge it's code-discipline-only and accept that risk.

**H3 — NFR-8 (Platform Operator MFA, flagged by the PRD's own adversarial review as the single highest-impact breach vector) has no home after the paradigm pivot removed the role it was written for.**
AD-1/AD-2 correctly dissolve the in-app "Platform Operator" role into a deployment/provisioning process — the Deferred section even names this explicitly ("PRD FR-52/53 wording reconciliation"). But that note only addresses *wording*, not *carrying NFR-8's actual security requirement to its new home*. Under this paradigm, "Platform Operator" access is now: whoever has push access to `infra/provisioning/`, whoever has console/API access to Vercel, and whoever has console/API access to each tenant's Postgres/R2 account. NFR-8 demanded MFA on the role that could touch every tenant — that role still exists, it's just human/infra access now instead of an app role, and the spine never says GitHub org access, Vercel team membership, or DB console access must be MFA-gated. This is a hard security requirement the PRD called out by name, and it appears to have been dropped rather than relocated during the pivot.
*Disposition:* add a line to AD-1, AD-2, or a new AD stating the infra-access-control equivalent of NFR-8 (MFA required for anyone with `infra/provisioning` merge rights / Vercel / DB console access).

**H4 — No environment/staging strategy for validating a release (especially a schema migration) before it touches a live tenant's production database.**
`infra/prisma/` migrations are described as "identical schema, run per tenant deployment," and CD is "one run per tenant on release" — but nothing describes a pre-production gate: is there a staging tenant, a shared dev database, or any validation step between "migration merged" and "migration applied to the pilot's live, paying, append-only financial data"? For a product whose core trust guarantee is data integrity (AD-9) and whose only customer today is a paying pilot, shipping an untested migration straight to production is a real, nameable operational risk that the spine doesn't decide, defer, or flag as open.
*Disposition:* minimum viable answer — even "a shared non-production tenant config runs every migration first, promotion is manual" — needs to be stated or explicitly deferred with rationale.

### Medium (5)

**M1 — Two of PRD Open Question 5's three offline-sync gaps aren't addressed by AD-8 or named in Deferred.**
AD-8 covers idempotent retry (sub-question c: "a retried sync can never create a duplicate server-side record") well. It doesn't address (a) a DSR edited/resubmitted from the same or a second device before the first sync completes, or (b) a partial sync where a DSR's core record syncs but a linked photo or Consumption record fails. Both are real divergence points for the single most important daily workflow (UJ-1) — two engineers building the sync drain could resolve "half-synced DSR" differently. The PRD flagged all three sub-issues together as one open question; the spine silently resolves one and drops the other two.
*Disposition:* extend AD-8's Rule to cover last-write-wins vs. merge semantics for (a) and atomicity/retry-unit for (b), or add both explicitly to Deferred with the same care given to photo compression.

**M2 — Email delivery (an explicit FR-33/FR-50 channel alongside WhatsApp) has zero architectural coverage.**
The Stack table names a WhatsApp BSP and defers the specific vendor. It never names an email delivery provider (Resend, SES, Postmark, etc.), nor is email mentioned in Deferred. Given FR-50 explicitly configures WhatsApp/Email/in-app as parallel channels, this reads as an oversight rather than an intentional deferral — unlike WhatsApp, which got real treatment.

**M3 — Where Role/permission data lives is unaddressed, despite FR-48 being an explicit capability that touches two existing ADs directly.**
AD-10 delegates identity fully to Clerk; AD-3 makes `apps/api` the sole DB client. FR-48 ("Owner/Admin can invite/manage Users and assign Roles") sits exactly at the seam between those two ADs, and the spine doesn't say which side owns Role/permission storage (Clerk org roles/metadata vs. an app-owned Role table via Prisma). Given the Glossary's own Role section is flagged `[ASSUMPTION]` in the PRD (Open Question 6), this is a case where the architecture should at least fix *where* the answer will live, even if not *what* the answer is.

**M4 — FR-7's admin-configurable Custom Fields is in unstated tension with the "identical schema... run per tenant deployment" premise.**
If the schema must stay identical across all tenant deployments (Structural Seed), but Owner/Admin can add arbitrary Custom Fields to Materials/Machinery/Vehicles per tenant (FR-7, FR-49), the data-modeling pattern that reconciles those two facts (a JSONB column, an EAV side-table) needs to be named — otherwise the two facts are quietly incompatible, and an engineer under deadline pressure might resolve it by drifting a tenant's schema, which would break AD-2's "identical schema" premise and AD-1's clean deployment story.

**M5 — Migration rollout failure across N tenants (partial fan-out failure) isn't decided or named in Deferred.**
The "CI/CD fan-out mechanics" Deferred entry explicitly scopes itself to *tool choice* ("GitHub Actions matrix... or a dedicated release tool"), not to failure-mode semantics: if 3 of 10 tenants migrate successfully and 7 fail mid-rollout, is that a hard stop, a per-tenant independent retry, or silent partial deployment? Worth a line even if the answer is "deferred, tolerable pre-scale."

### Low (3)

**L1 — pnpm is pinned as "latest stable," not an exact version.** For a Turborepo monorepo, lockfile determinism and remote-cache correctness depend on every machine (dev + CI) using the same package-manager version — normally pinned via a `packageManager` field + Corepack. "Latest stable" passes the mechanical lint (non-empty cell) but isn't a real pin in spirit; it's the kind of Stack entry that will quietly drift between two developers' machines over the project's life.

**L2 — The shadcn/ui claim ("current, July 2026 Base UI migration") is unusually specific and consequential to independently verify.** shadcn/ui rebuilding on Base UI instead of Radix is a significant, recent claim (dated one month before this spine) that AD-5 leans on directly. Worth one more freshness check given how load-bearing it is, rather than accepting "web-verified" at face value from the memlog.

**L3 — NFR-2's core tension (2G/3G-capable low-end phones vs. photo-heavy DSRs, PRD Open Question 13) has no stated target, even directionally.** Deferring the *compression library* is fine (an implementation detail); deferring the *target* entirely (no rough KB/photo ceiling, no bundle-size budget) leaves the actual tension the PRD flagged as unresolved as it was before the spine existed.

## What the spine got right (for calibration, not a finding)

- AD-1 doesn't just satisfy NFR-1's defense-in-depth bar, it exceeds it — physical deployment separation is a stronger guarantee than any application-layer defense-in-depth logic could be, and the Rule ("no `tenant_id` column exists anywhere") is about as enforceable as a Rule can get: a PR introducing tenant-scoping logic is definitionally visible in review or a trivial grep-based CI check.
- AD-9's data-model discipline (append-only + required reason field on corrections) maps cleanly onto FR-54's testable consequences almost clause-for-clause.
- The Deferred section is mostly excellent where it engages at all — WhatsApp BSP, photo compression, CI/CD fan-out tooling, and billing consolidation are all correctly identified as *not* architectural and each carries a one-line reason, which is exactly the discipline the checklist wants ("nothing under Deferred could let two units diverge"). The gaps above are about dimensions that never made it into that section at all, not about how the section is written where it exists.
- Capability → Architecture Map covers all 16 PRD feature sections with a specific governing AD or explicit Deferred pointer — no section is silently unmapped.

## Summary table

| Severity | Count |
| --- | --- |
| Critical | 2 |
| High | 4 |
| Medium | 5 |
| Low | 3 |
| **Total** | **14** |
