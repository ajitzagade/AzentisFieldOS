---
title: "Architecture Spine — Adversarial Review (Two-Builder Incompatibility Analysis)"
scope: "ARCHITECTURE-SPINE.md — does AD-1..AD-10 constrain FR-1..FR-54 tightly enough that two independent, fully-compliant builders converge on compatible systems?"
method: "For each finding, construct two engineers/agents, each implementing a different PRD feature, each obeying every applicable AD to the letter, and show a concrete divergence in shared-data shape, entity ownership, mutation path, or Deferred-item resolution that the other cannot integrate against without rework."
created: 2026-08-11
related: "reviews/reconcile-prd.md (spine-vs-PRD gap analysis — different lens; this file is spine-vs-spine self-consistency and builder-divergence, not PRD coverage)"
---

# Adversarial Review — ARCHITECTURE-SPINE.md

**Total findings: 12** (3 Critical, 3 High, 4 Medium, 2 Minor/governance)

A finding only counts if both constructed builders can honestly claim "I followed the spine" — divergence caused by one builder simply ignoring an AD is not included.

---

## CRITICAL

### C1 — AD-9's "computed aggregate" contradicts the ERD's mutable Stock entities

AD-9's rule: *"Current-state values (Stock, Outstanding Balance) are always a computed aggregate over these rows, never an independently mutable column that could disagree with its own history."*

The Core Entities ERD names `SITE_STOCK` and `GODOWN_STOCK` as first-class entities and labels the edges into them with mutation verbs: `PURCHASE ||--o{ SITE_STOCK : "increases (direct)"`, `PURCHASE ||--o{ GODOWN_STOCK : "increases (to godown)"`, `MOVEMENT ||--o{ SITE_STOCK : "moves between"`. Nothing disambiguates whether these are Prisma models with a `quantity` column that application code updates in place, or views/derived reads with no storage at all.

- **Builder A (Inventory Lifecycle, §4.3)** reads AD-9 literally: no `SiteStock`/`GodownStock` tables exist at all. Current stock is a SQL aggregate (`SUM` over Purchase + Movement ± Consumption) computed at query time. Ships zero stock-related migrations beyond the transaction tables.
- **Builder B (Multi-Site Management, §4.1, and Contractor Dashboard, §4.10)**, needing a fast "stock at this site right now" read for a dashboard tile, follows the ERD literally: ships `SiteStock`/`GodownStock` Prisma models with a `quantity` column, incremented/decremented by application code on every Purchase/Movement/Consumption insert (a materialized running total).

Builder B's table is precisely the "independently mutable column" AD-9 forbids — yet Builder B can point to the ERD as authorization, since the spine states the ERD shows "attributes that are themselves invariants are ADs above, not this diagram" (implying the entities and their mutation-shaped edges *are* the diagram's job to define). When these two ship, one has no `SiteStock` table for Builder B's dashboard to query; the other has a `SiteStock` table nothing in Builder A's inventory code ever writes to, so it silently reads zero forever, or Builder A's aggregate and Builder B's cached column disagree the first time a correction row (AD-9's required-reason correction) is inserted, since only one of the two implementations knows to re-derive from it.

### C2 — FR-52 "Platform Operator" cannot be satisfied inside AD-1's deployment boundary, and no control plane exists to hold it

The spine's own Deferred section admits: *"FR-52/53 ... were authored assuming a shared app with an in-app Platform Operator role; AD-1/AD-2 satisfy their intent ... through deployment topology instead. The PRD's wording should be updated to match after this spine closes ... offered at Finalize, not resolved here."*

Until that rewrite happens, FR-52 as written is still the binding requirement text a feature-implementing builder works from.

- **Builder A (infra/onboarding)** implements AD-1/AD-2 to the letter: zero in-app cross-tenant code, zero `tenant_id`, provisioning is a script. Ships nothing that could be called a "Platform Operator role."
- **Builder B**, assigned literally "implement FR-52," builds an in-app Platform Operator screen — a cross-tenant tenant list, the ability to switch context between tenants, per NFR-8's MFA-gated cross-tenant action requirement. To render "list of tenants" and "switch to tenant X," this screen necessarily needs a selector value compared against incoming requests — exactly the construct AD-1's rule prohibits by name ("No table, model, query, or API route may reference a 'current tenant' selector... reject it, don't merge it").

Both builders are individually compliant with the AD they were each pointed at (A with AD-1/AD-2, B with the PRD's still-live FR-52 text). There is no `apps/control-plane` or equivalent in the Structural Seed to hold a legitimately cross-tenant admin surface, so Builder B's only compliant home for FR-52 literally does not exist in the architecture — and Builder A's interpretation makes FR-52, as currently worded, unimplementable by construction. Two teams handed this PRD in parallel produce either "no Platform Operator" or "a Platform Operator that violates AD-1," with no spine text steering them to the same answer. (Note: `reviews/reconcile-prd.md` already tracks this as a known PRD-wording gap; this finding is the sharper version — it shows the ambiguity is exploitable by two compliant builders today, not just a documentation debt to clean up later.)

### C3 — MOVEMENT is only wired to SITE_STOCK in the ERD; godown→site transfer has no defined path

`MOVEMENT ||--o{ SITE_STOCK : "moves between"` is the only edge into or out of `MOVEMENT` in the Core Entities diagram. `GODOWN_STOCK` only ever receives from `PURCHASE` ("increases (to godown)"); nothing in the diagram lets material leave a godown and arrive at a site, even though this is a named, central operation of Inventory Lifecycle & Movement (§4.3) — moving stock from central storage to an active site is one of the paradigm's obvious real-world flows.

- **Builder A**, reading the ERD as a complete relationship inventory (the spine explicitly frames it as "names + relationships only," implying completeness), implements `Movement` as strictly site-to-site: `fromSiteId`/`toSiteId`, both required, both referencing `Site`. Godown-to-site transfer is out of scope for this model; Builder A assumes it's handled as a `Purchase` variant (a "purchase" that happens to originate from the tenant's own godown stock rather than a vendor).
- **Builder B**, filling the obvious gap because the feature can't ship without it, implements `Movement` with polymorphic `fromLocationType/fromLocationId` and `toLocationType/toLocationId` covering both `Site` and `Godown`, and wires a `MOVEMENT ||--o{ GODOWN_STOCK` relation that doesn't exist in the spine's diagram.

These are structurally incompatible Movement tables (fixed FK pair vs polymorphic location pair) built to satisfy the same FR range under AD-9. Whichever ships first, the other's Reports/consumption-history code (§4.13, bound to AD-3 "query endpoints") joins against a shape it wasn't written for.

---

## HIGH

### H1 — AD-8's idempotency key: one per DSR, or one per sub-record?

AD-8: *"a DSR and its linked sub-records ... are written to a local Dexie/IndexedDB queue first ... tagging each queued entry with a client-generated idempotency key so a retried sync can never create a duplicate server-side record."* "Each queued entry" is ambiguous between "each DSR queue entry" and "each of the DSR's linked sub-records, individually."

- **Builder A (DSR entry, §4.8)** builds one Dexie row per DSR containing the full nested payload (Consumption[], WorkRecord[], Expense[], RmcEntry[], Photo[]), one idempotency key for the whole bundle, and a single `POST /daily-site-reports` that persists everything in one DB transaction — all-or-nothing sync.
- **Builder B (Inventory/Expense/Labour features, §4.3/§4.5/§4.12)**, building the API resources independently, ships granular endpoints (`POST /consumption`, `POST /expenses`, `POST /work-records`) because that matches how those resources are otherwise created (a Purchase doesn't require a DSR, so `Consumption` shouldn't either); each gets its own idempotency key and independent success/failure.

Whichever gets built first defines the sync contract the other must reverse; if built in parallel, apps/web's queue schema (one key vs many) cannot satisfy both API shapes at once, and the partial-failure semantics genuinely differ (Builder A: a bad Expense blocks the entire DSR from syncing; Builder B: Consumption syncs, Expense doesn't, DSR ends up half-committed with no spine-defined recovery rule — this also reopens `reconcile-prd.md` gap #2, the unresolved concurrent-edit/two-device DSR rule, from a different angle).

### H2 — AD-2's provisioning script omits Clerk and R2, which the topology diagram treats as per-tenant resources

AD-2's Rule enumerates exactly five steps: "create the Vercel project, create the managed Postgres instance, apply that tenant's config file ..., run migrations, deploy." Clerk and R2 are never mentioned. Yet the Deployment Topology diagram shows every tenant box as `"Vercel + Postgres + Clerk + R2"` — implying four provisioned resources, not two.

- **Builder A** treats AD-2's itemized list as the exhaustive spec (the closing sentence — "No tenant is provisioned by clicking through a cloud console by hand" — is read as describing *those five steps*), and sets up each tenant's Clerk application and R2 bucket by hand, once, outside `infra/provisioning/`, because AD-2 never assigned that work to the script.
- **Builder B** treats the topology diagram as authoritative for what "provisioning a tenant" means end-to-end, and extends `infra/provisioning/` to also create the Clerk app (via Clerk's management API) and R2 bucket (via Cloudflare API) so the "no clicking through a console by hand" guarantee actually holds for all four resources.

Both cite the same AD for opposite scopes. This isn't cosmetic: Builder A's world has Clerk secrets and R2 credentials that must be manually minted and dropped into each tenant's env vars out of band — an unscripted, easy-to-skip step the PRD's own risk framing (AD-2's "Prevents" clause: "a missed env var") was written to eliminate. Builder B's world has provisioning code neither Builder A nor the Structural Seed's `infra/provisioning/` description anticipates.

### H3 — Does a local `User` Prisma model exist, or is identity Clerk-only?

The ERD requires `USER ||--o{ DAILY_SITE_REPORT : submits` — a Prisma relation, which requires `User` to be a model in the same schema Prisma can join against. AD-10 says: *"no application code implements password storage, session issuance, or MFA... Clerk owns identity."*

- **Builder A (Admin Configuration, §4.14 — assigning users to sites/roles)** ships a local `User` table (id = Clerk user id, role, phone, assigned sites) because role/site-assignment data has to live somewhere queryable by Postgres joins, and the ERD draws the FK.
- **Builder B (DSR submission, §4.8)**, reading AD-10 maximally ("Clerk owns identity, not this codebase" — full stop), stores only `submittedByClerkUserId: string` on `DailySiteReport` with no FK and no local `User` table at all, resolving role/name via a Clerk API call or JWT claim at read time.

If Builder A ships first, Builder B's field doesn't reference it (orphaned string vs FK — no referential integrity, and reports/audit joins in §4.16 silently return nulls for any B-authored row). If Builder B ships first, Builder A's site-assignment feature has no `User` row to attach a `siteId` array to.

---

## MEDIUM

### M1 — RMC is not wired to Vendor/Purchase in the ERD, so "vendor spend" has two possible definitions

`RMC_ENTRY` only connects to `DAILY_SITE_REPORT`. It has no edge to `VENDOR` or `PURCHASE`, even though RMC is bought from a supplier in the real workflow. §4.7 (RMC Tracking) is governed only by AD-3; §4.11 (Vendor Management) and §4.13 (Reports) are governed by AD-3 alone too — nothing forces RMC spend into the same "vendor total" aggregate as Purchase spend.

- **Builder A (RMC Tracking)** models `RmcEntry` as a DSR line item with a free-text `supplierName` field, no relation to `Vendor`.
- **Builder B (Reports, §4.13)** builds "total spend per vendor" purely from `Purchase` rows joined to `Vendor`, unaware RMC spend exists outside that path — the report is silently incomplete for any tenant that tracks RMC, and there's no spine text either builder violated.

### M2 — AD-6's five states don't include an offline "pending-sync" state that AD-8's flow requires

AD-6 fixes the enumeration: "loading, empty, success, error, or (for forms) validation-failure ... never ad-hoc per-screen conditionals for these states." AD-8 requires DSR data to exist locally, queued, before it has synced. A DSR list screen showing a locally-queued-but-unsynced report is in none of AD-6's five states.

- **Builder A** forces it into `loading` (semantically wrong — it's fully entered data, not "in flight" from the server; blocks whatever "loading" affordances packages/ui attaches, like disabling the retry action).
- **Builder B** adds a sixth shared state component (`pending-sync`) to `packages/ui`, technically breaking AD-6's closed enumeration ("exactly one of ... these states") to make DSR make sense.

Neither can be told they're wrong by the text as written, and packages/ui ends up with two different screens' worth of ad-hoc handling for the exact case AD-6 was written to prevent.

### M3 — AD-3 is scoped to Prisma/Postgres only; it's silent on whether apps/web may talk to R2 directly

AD-3's rule: *"`PrismaClient` is instantiated only inside `apps/api`... No direct database import ever appears under `apps/web`."* R2 is object storage, not "database," so it's textually outside AD-3's scope — but AD-8 requires DSR photos to be part of the local-first queue and eventual sync.

- **Builder A** has `apps/web` request a presigned R2 upload URL from `apps/api` and PUT the photo bytes directly to R2 from the browser/PWA — never touching Prisma, fully AD-3-compliant, minimizes API bandwidth.
- **Builder B** proxies photo bytes through `apps/api` (`POST /daily-site-reports/:id/photos` multipart), treating "the API is the sole client of tenant resources" as the intended spirit, not just the Prisma-specific letter.

Different R2 bucket IAM policy required (public-writable-via-presigned-URL vs API-only-writable), different Dexie queue payload shape (one queues a two-step request, the other queues one blob+metadata post), and a security review of one architecture says nothing about the other's exposure.

### M4 — No valuation/costing method specified for "computed aggregate" values

AD-9 mandates that Stock and Outstanding Balance be computed aggregates but never states the formula — e.g., stock valuation (latest purchase price? weighted average? FIFO?) or whether a correction row (AD-9's required-reason correction mechanism) is netted into the aggregate or the original+correction pair are both summed (double-counting risk if the aggregate query isn't written to recognize the correction-link field).

- **Builder A (Reports, §4.13)** implements "current stock value" as `latest Purchase.unitPrice × SUM(quantity deltas)`.
- **Builder B (Inventory Lifecycle, §4.3)**, building the same figure for a different screen, implements weighted-average cost across all Purchase rows for that MaterialSize.

Same metric name, two numbers, no spine text says which is correct.

---

## MINOR / GOVERNANCE

### G1 — AD-4 has no ownership rule for adding new design tokens

AD-4 fixes that tokens live in one `@theme` block but doesn't say who may add to it. A dashboard-focused builder and a mobile-DSR-focused builder, working in parallel and each needing a token the other doesn't know about (e.g., large touch-target spacing for field use vs dense desktop spacing), can each independently add a new token to the same file under different names for overlapping purposes (`--spacing-touch` vs `--spacing-mobile-lg`) without violating "defined exactly once" — each new token *is* defined exactly once, just redundantly with the other's.

### G2 — AD-7 doesn't pick a NestJS/Zod integration mechanism

AD-7 fixes that one Zod schema per shape is shared front/back, but not whether `apps/api` enforces it via a global `ZodValidationPipe`, a per-controller `.parse()` call, or `nestjs-zod` DTOs. Two controller-builders can each satisfy "the schema is the source of truth" while wiring validation into Nest differently enough that error-response shape (which the Consistency Conventions table *does* fix as one JSON envelope) ends up produced by two different code paths — one going through the global exception filter as intended, one hand-rolling a `BadRequestException` inside the controller because its manual `.parse()` call throws a raw ZodError the global filter wasn't written to catch.

---

## Summary Table

| # | Severity | Two builders | Divergence |
|---|----------|-------------|------------|
| C1 | Critical | Inventory (§4.3) vs Dashboard/Multi-Site (§4.1/4.10) | Stock as pure computed aggregate vs mutable cached table — ERD contradicts AD-9's own rule text |
| C2 | Critical | Infra/onboarding vs "implement FR-52 literally" | No in-app Platform Operator vs one that requires the tenant selector AD-1 bans; no control-plane app exists |
| C3 | Critical | Inventory Movement builders | Site-to-site-only Movement vs polymorphic site/godown Movement — ERD never wires Movement to GodownStock |
| H1 | High | DSR entry (§4.8) vs Inventory/Expense/Labour APIs | One idempotency key per DSR bundle vs one per sub-record — different sync contract & partial-failure behavior |
| H2 | High | Onboarding-script builder vs topology-diagram-literal builder | AD-2's 5 steps omit Clerk/R2; diagram implies they're provisioned too |
| H3 | High | Admin/user-assignment (§4.14) vs DSR submission (§4.8) | Local `User` Prisma model (FK) vs Clerk-only string reference — ERD needs the former, AD-10 arguably forbids it |
| M1 | Medium | RMC Tracking (§4.7) vs Reports (§4.13) | RMC spend excluded from vendor-spend aggregate — no ERD edge to Vendor/Purchase |
| M2 | Medium | Any DSR-offline screen vs AD-6's closed 5-state list | "Pending sync" forced into `loading`, or an unauthorized 6th shared state invented |
| M3 | Medium | Photo upload path builders | Direct browser-to-R2 (presigned URL) vs API-proxied upload — AD-3 only scopes Postgres |
| M4 | Medium | Reports (§4.13) vs Inventory (§4.3) | Different stock-valuation formulas for "the same" computed aggregate |
| G1 | Minor | Dashboard vs mobile-DSR UI builders | Near-duplicate design tokens, no ownership gate |
| G2 | Minor | Any two controller builders | Different Zod/NestJS wiring produces two error-shape code paths |
