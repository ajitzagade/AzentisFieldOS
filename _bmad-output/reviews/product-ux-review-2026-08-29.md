# AzentisFieldOS — Product & UX Review

**Date:** 2026-08-29 · **Method:** full codebase inspection (4 parallel deep-read agents: backend/data model, owner web UI, supervisor mobile/DSR/offline, reporting/notifications/spec traceability) · **Scope:** every model, endpoint, page, and FR-1..FR-54 traced to code evidence.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Product Assessment (scored)](#2-current-product-assessment)
3. [Top UX Problems (ranked)](#3-top-ux-problems)
4. [Top Product Gaps](#4-top-product-gaps)
5. [The Ideal Owner Experience](#5-owner-experience)
6. [The Ideal Supervisor Experience](#6-supervisor-experience)
7. [Recommended Features (P0–P3, full attributes)](#7-recommended-features)
8. [Quick Wins](#8-quick-wins)
9. [Medium-Term Improvements](#9-medium-term-improvements)
10. [Strategic Roadmap](#10-strategic-roadmap)
11. [Appendices](#11-appendices) — navigation analysis, workflow maps, redundancy list, top-10 owner-needs table, notification tiers, AI classification, north star

---

## 1. Executive Summary

### What is already strong

The **recording engine is genuinely excellent** — better engineered than most shipping construction-tech products:

- **Append-only ledger with reason-carrying corrections** (AD-9) across every transaction table, with race-safe non-negative stock floors (`updateMany` + affected-row-count checks), materialized balances written only inside the same transaction as the causing ledger row, and correction supersedence consistently filtered across ~10 aggregate consumers.
- **The DSR is a real connected hub, not a disconnected form.** One mobile submission atomically writes WorkRecords (attendance), Consumptions (with live stock decrement), RmcEntries, Expenses, equipment tags, and photos — with offline idempotency via client-generated UUIDs, an IndexedDB queue, and difference-only stock re-application on retry. This is exactly the architecture the product philosophy demands, and it already exists.
- **Field-smart touches**: crew pre-populated from the last attendance day, live "80 Bags available at this Site" hints inside the material picker, amount-in-words readback on ₹ fields, unit shown on every material option.
- **Consistent UI system** (AD-5/AD-6 honored — one component per primitive, standardized empty/loading/error states, helpful first-run empty states everywhere).
- **Spec coverage**: ~47 of 54 FRs fully built, 6 partial, 0 missing.

### What is weak

1. **The product records everything and analyzes almost nothing.** No trends, no alerts, no price analysis, no forecasts, no search, no site comparison. Purchase rates are captured on every row and never analyzed. Owner "intelligence" is a handful of counters plus report tables buried three clicks deep.
2. **The headline promise is dormant in production.** "The owner stops phoning supervisors" depends on automated daily report delivery — but no crons are deployed (`apps/api/vercel.json` has no `crons` array; Vercel Hobby limit), Resend has never been exercised against a live account, WhatsApp is a permanent placeholder, and scheduled report emails fetch the data then **discard it**, sending contentless header shells with "Your Company" branding.
3. **Money is the weakest domain.** Vendor payables can never be settled in-system (`Purchase.paymentStatus` is set once and immutable forever; there is no vendor-payment table). Per-site labour cost is structurally impossible (no wage/rate field anywhere; `Payment` has no `siteId`). The financial report double-counts corrected DSRs and restated payments.
4. **Authorization is a sliver.** A SITE_SUPERVISOR can record payments, mark them paid, give advances, edit low-stock thresholds, and PATCH the tenant's branding. Role gating covers only user admin, lookup-table edits, schedules, and notification settings.
5. **Every list page is an unbounded full-table fetch with no search, sort, filter, or pagination.** The product degrades linearly with success.
6. **The offline story is half-built where it matters most**: the DSR queue drains only while `/dsr/new` is open, photos are lost on reload if the submission queued, and there is no draft persistence at all.

### The biggest product opportunity

**Convert the recording engine into a control room.** Nearly all the data an owner needs already lands in the ledger every day — rates, quantities, attendance, expenses, DSR status. The gap is a thin intelligence layer on top: a money-aware dashboard, a deterministic alert engine (missed DSR, low stock, aging receipts, pending payments), site health rollups, price/burn-rate views, and working automated delivery. None of this requires new architecture; most of it doesn't even require new data capture. It requires *surfacing* — plus two targeted schema additions (vendor payments, labour rates) that unlock the two money questions the system currently cannot answer.

---

## 2. Current Product Assessment

Scores are 1–10, grounded in code evidence.

| Area | Score | Why |
|---|---|---|
| **Owner experience** | 5/10 | The dashboard answers "what happened today" well (7 stat tiles, per-site missing-DSR flags — FR-35 done right). But there is no money picture (no vendor dues, no month-to-date spend, no cash exposure), no trends, no charts (`BarChart` exists in `packages/ui`, used nowhere), and the analytical answers that do exist live in Reports tabs 3+ clicks away. Existing live APIs (`/expenses/summary`, `/rmc-entries/stats/this-month`, `/vendors/:id/purchase-summary`, `/reports/financial`) are never surfaced on the dashboard. |
| **Supervisor experience** | 6.5/10 | The DSR hub is strong: connected writes, crew prefill, stock hints, ~30–35 taps / 3–5 min for a full daily update. Points lost: the supervisor gets the identical 13-item admin sidebar (Payments, Reports, all ledgers) instead of a field-focused view; site is re-selected every single day (no assignment, no memory); hours/OT require a second flow re-entering site+date; DSR validation errors collapse to "Something went wrong". |
| **Mobile experience** | 5/10 | Real PWA (hand-authored service worker, install prompts, offline fallback page, branded manifest). But: the offline queue drains only while `/dsr/new` is open; photos vanish if a queued DSR's page reloads; no drafts anywhere; no photo compression (raw multi-MB camera files on 2G/3G); 16px crew checkboxes and caption-size remove links vs the 44px touch guideline; 8-column tables scroll sideways with no card-collapse mode. |
| **Inventory** | 7.5/10 | The engine is the best thing in the product: race-safe floors, two-step movements with shortage-gap visibility, correction reversal, DSR-embedded consumption with difference-only re-application. UI is partial: 2 of 4 inventory stat tiles are permanent "not yet available" placeholders, site stock is an N+1 fetch where one failing site kills the page, no filters, low-stock thresholds are godown-only (site stock is never checked), and negative purchase corrections bypass the stock floor. |
| **Labour** | 6/10 | Attendance, advances, adjustments, and payment mechanics are excellent (pooled balance floors, server-computed net payable, delta-correct corrections). But there is no costing: no wage/rate anywhere, hours/overtime captured but used in zero computations, per-site labour cost structurally impossible, and the team-member detail page fetches every advance tenant-wide and filters client-side. |
| **DSR** | 8/10 | The standout. One-per-site/date under advisory locks, cross-site double-booking 409s, atomic connected writes, offline idempotency, append-only corrections with stock reversal. Loses points for: offline photo fragility, six schema fields (hours, overtime, activityReference, paymentMethod, plannedWork/safetyObservations etc.) supported by API but not rendered by either entry form, and the orphaned desktop form route. |
| **Vendor management** | 4/10 | Master data and purchase history are fine. But outstanding is a proxy (`SUM(totalAmount) where paymentStatus != 'PAID'`), a vendor invoice can never move UNPAID→PAID, partial payments aren't representable, the vendor detail page omits the summary the list page computes, and captured rates are never compared across vendors or time. |
| **Expense management** | 6/10 | Capture, corrections, summary tiles, and the DSR-embedded path all work. No filters (site/category/date all filterable in the API, none exposed), no receipt photo (FR-41 partial — no field, no upload), no unusual-expense surfacing, `personOrVendor` is free text rather than a vendor link. |
| **Reporting** | 5/10 | Impressive breadth in code: branded compile snapshots, idempotent delivery with retry, 5 filterable report tabs, schedules UI. But dormant in production (no crons deployed), scheduled emails are empty shells, WhatsApp is a placeholder, Resend is untested live, and there is no PDF/export/download/share anywhere. |
| **Navigation** | 5.5/10 | Clean accessible shell (drawer, focus management). But 14 entity-shaped items; Vendors/RMC/Expenses filed under "Assets" (semantically wrong); one mental model — stock — split across Materials/Inventory/Movements; "Insights" holds one item; no global search; row links are raw `<a>` full-page loads. |
| **Data visibility** | 6/10 | Everything is recorded and eventually reachable, and the site activity feed + movements log are genuinely good unified views. But "how much cement at Site B?" takes 3+ interactions through Reports filters; site detail has no stock panel; Daily Activity is hardcoded to today with no history navigation. |
| **Business intelligence** | 2/10 | Essentially none. No alert engine, no anomaly logic (grep: zero hits), no trends, no burn rate, no price analysis, no forecasting, no search, no comparisons. The single proactive signal in the whole product is the missing-DSR dashboard flag. |

---

## 3. Top UX Problems

Ranked by severity. Classification: **[A]** = UX problem on existing functionality, **[B]** = missing capability, **[Bug]** = correctness defect discovered during review.

| # | Severity | Problem | Evidence |
|---|---|---|---|
| 1 | **Critical [Bug]** | **Financial report double-counts.** `financial-reports.service.ts` sums RMC/expense rows without the superseded-DSR filter every other aggregate uses, and sums all Payment rows although a payment correction is a full restated row — so corrected days and corrected payments count twice. The owner's money numbers are wrong whenever a correction exists. | `apps/api/src/reports/financial-reports.service.ts` |
| 2 | **Critical [Bug]** | **Correction money semantics over-count and can corrupt stock.** Purchase/RMC corrections carry a signed quantity delta but Zod *requires positive* `totalAmount`/`rate` — a correction that reduces quantity still adds positive money to vendor summaries and financial reports. And the negative-quantity purchase correction path applies its stock delta with no floor check (the only decrement path that skips it). | `purchases.service.ts`, `packages/shared` schemas |
| 3 | **Critical [A/Bug]** | **Role model is barely enforced.** Supervisors can PATCH branding config (stale "Story 14.2" comment; guard never added), record/mark-paid payments, give advances, and edit low-stock thresholds. The two-role model exists; it just isn't applied to business writes. | `branding-config.controller.ts`, grep of `@Roles(` |
| 4 | **Critical [A]** | **The automated-report pipeline never runs in production.** No `crons` in `apps/api/vercel.json`; compile/retry/schedule endpoints exist but nothing calls them. The product's core differentiation (owner gets a daily branded report without phoning anyone) is switched off. | `apps/api/vercel.json`, AGENTS.md |
| 5 | **High [Bug]** | **Scheduled report emails are empty shells.** `runDueSchedules` fetches the report data, then `buildEnvelope` discards it and sends zeroed content with default "Your Company" branding. An owner who schedules a "Financial Report" receives a header with no financial data. | `report-schedules.service.ts` |
| 6 | **High [A]** | **Offline sync is trapped in one page.** The queue drain trigger (online event + 20s poll) lives only in `/dsr/new`'s effect. Queue a DSR, navigate away or close the app → it can sit unsynced for days while the office sees "Not submitted", with no pending indicator anywhere. | `lib/dsr-sync.ts` (single call site), `daily-activity/page.tsx` |
| 7 | **High [A]** | **Photos are the least durable data in the flow.** Queued-offline DSR + page reload = staged photos silently gone. No compression either — raw multi-MB uploads on field networks. | `dsr/new/page.tsx:127-131` |
| 8 | **High [A]** | **No draft persistence anywhere.** One accidental back-gesture mid-DSR loses 4 minutes of typing. The queue holds only *submitted* payloads. | `apps/web` (nothing exists) |
| 9 | **High [A]** | **No search, sort, filter, or pagination on any list page.** Zero `page=/limit=` usage in the app; all lists are unbounded full fetches. Movements merges four unbounded histories into one table. Unusable at 6 months of real data. | verified across `(app)/*` |
| 10 | **High [B]** | **Duplicate-entry double-count risk.** Consumption/RMC/expense entered via DSR *and* via the standalone module creates two rows and (for consumption) decrements stock twice — no natural key, no warning. Attendance is protected; the others aren't. | `dsr.service.ts` vs `consumption` module |
| 11 | **Medium [A]** | **Sites list "Last DSR activity" column renders a permanent "—"** with a stale "until Epic 3 ships" comment — Epic 3 shipped. Looks broken to every user, every day. | `sites/page.tsx` |
| 12 | **Medium [A]** | **Site detail isn't a control room.** No stock panel (API exists), no financial summary, no crew-today, no DSR history. "How much cement at Site B?" cannot be answered from Site B's page. | `sites/[id]/page.tsx` |
| 13 | **Medium [A]** | **Supervisor sees the whole admin app.** Identical sidebar minus Settings; no site assignment or last-used-site memory; site re-picked daily from the full list. | `app-shell.tsx:89`, `nav-config.ts` |
| 14 | **Medium [A]** | Hours/overtime require a second flow (Team → Record Attendance) re-entering the same site+date the DSR already captured; DSR form doesn't render the hours fields its schema supports. | `daily-activity/work-records/new` |
| 15 | **Medium [A]** | Purchase and standalone RMC forms make the user multiply qty×rate by hand for Total Amount; the DSR's RMC path computes it server-side. Inconsistent and error-prone. | `purchase-form.tsx:215`, `rmc-form.tsx:178` |
| 16 | **Medium [A]** | Vendor detail omits the outstanding/year-total summary the vendor *list* already computes from the same API. | `vendors/[id]/page.tsx` |
| 17 | **Medium [A]** | White-label is split-brain: Settings branding affects only reports; the app chrome (sidebar name, logo mark, colors, manifest, sign-in) is hardcoded `"Sandeep Enterprises"` / `#0F5257`. | `apps/web/lib/tenant.ts` |
| 18 | **Low [A]** | Small touch targets (16px crew checkboxes, 24px combobox buttons, caption-size photo Remove/Retry) for a gloves-and-sunlight context. | `packages/ui` field components |
| 19 | **Low [A]** | "Work completed" and "Issues" are single-line TextFields for narrative content; `TextareaField` exists and isn't used here. | `dsr/new/page.tsx` |
| 20 | **Low [A]** | Daily Activity is hardcoded to today — yesterday's DSRs are only reachable via Reports → Site tab filters. Six-button action wall on Movements wraps badly on mobile. DSR site fetch failure silently renders an empty site list with no error. | `daily-activity/page.tsx`, `movements/page.tsx`, `dsr/new/page.tsx:162` |

---

## 4. Top Product Gaps

Missing capabilities **[B]** ranked by owner value:

1. **Vendor payables ledger.** There is no way to record paying a vendor, no partial-payment amount, and `paymentStatus` is immutable after purchase creation. "How much do I owe, to whom, since when?" — the single most common contractor money question — cannot be answered or maintained. Requires a new append-only `VendorPayment` table (fits AD-9 exactly, mirroring the labour Advance/Payment pattern that already exists).
2. **Alert engine.** Zero event-driven notifications. Missed DSR, low stock, unconfirmed movement aging, pending payments, large expenses — all detectable from existing data with deterministic rules; none detected. The email channel and recipient settings already exist to deliver them.
3. **Per-site labour cost.** WorkRecord has no rate, TeamMember/EmploymentType have no wage, Payment has no siteId. The financial report honestly renders "Not tracked per-Site". Requires new data capture (a daily wage rate) — flagged clearly as such.
4. **Price intelligence.** `Purchase.rate` and `RmcEntry.ratePerM3` are captured on every row and never analyzed — no rate history per material, no vendor comparison, no increase detection. Pure read-layer work; data already exists.
5. **Stock intelligence.** No ₹ stock value (the two dashboard placeholder tiles admit it), no burn rate, no days-of-stock forecast, no site-level low-stock thresholds (godown only). Consumption history + rates make all of these computable today.
6. **Client-ready export.** No PDF, no download, no print stylesheet, no share link anywhere in the codebase. The branded daily-report HTML email is genuinely client-ready looking — and unforwardable as a document.
7. **Global search.** No search endpoint exists in the API; the only search box in the app is the materials taxonomy filter.
8. **Expense receipt photos** (FR-41 partial — no field, no upload control) despite the challan-photo flow existing for purchases and RMC.
9. **WhatsApp delivery** — the channel Indian contractors actually live in — blocked on an unmade BSP decision (PRD Open Question 3), currently an honest always-reject placeholder.
10. **Notification center** — no in-app bell/feed; "IN_APP delivery" means "the report row exists at /reports".

---

## 5. Owner Experience

The design target: **open the app → understand the business in 30–60 seconds → act only on exceptions.** The current dashboard gets "what happened today" right; the redesign layers money and attention on top of it, mostly from APIs that already exist.

### 5.1 Dashboard (redesigned, three zones)

**Zone 1 — Needs attention (top, only renders when non-empty).**
Exception list, not charts:
- "Site B — no DSR yet today" (exists: `sitesMissingDsrToday` — keep, but link straight to the site's DSR/daily-activity context, not just the site page)
- "Cement below threshold at Godown / Site A" (exists godown-only; extend to site stock)
- "Movement to Site C sent 4 days ago, receipt not confirmed" (data exists: `receivedQuantity IS NULL` + age)
- "3 payments pending > 7 days" (data exists)
- "₹18,500 expense at Site D — 3× its daily average" (computable from existing rows)
Four sites healthy → one calm line: "4 of 5 sites healthy." That is exception-based management (§R of the brief) — the owner gets a reason to act, or explicit permission to relax.

**Zone 2 — Today (keep the existing 7 stat tiles).** One change: "Materials Received/Consumed" currently show *counts of rows*; quantity-less counts answer nothing — link them into a today-view of the movements log filtered to today (filters are the prerequisite, P1-6).

**Zone 3 — Money (new strip, mostly existing APIs).**
- Month-to-date spend by category (exists: `/reports/financial` — after the P0 double-count fix)
- Vendor outstanding total (exists: purchase-summary proxy now; real after VendorPayment ledger)
- Outstanding advances + pending payments (already on dashboard — merge into this strip)
- **Cash exposure**: one number = vendor outstanding + advances outstanding + pending payments. Answers "how much money is tied up across my sites?" (§I) with zero new data capture.

### 5.2 Site Health (§B — deliberately simple)

Three states, computed on read, no new tables, no scores to tune:
- **Critical**: no DSR by cutoff, or any site-stock material at zero that was consumed in the last 7 days
- **Attention**: low stock vs threshold, expense day > 2× trailing 14-day average, unconfirmed inbound movement > 48h, no labour attendance on a working day
- **Healthy**: none of the above

Render as a badge on the sites-preview cards and sites list. Every trigger above is derivable from existing tables. Do not build a weighted score — three honest booleans beat an opaque number.

### 5.3 Site drill-down (site detail becomes the per-site control room)

Add to `sites/[id]`: current stock panel (`/stock/site/:id` — exists, unused here), this-month cost summary (financial report slice), today's crew (WorkRecords — exists), DSR history list (`/dsr?date=` — exists), health badge, existing activity feed and photos. One page answers "what's going on at Site B" — currently it answers only "what events occurred".

### 5.4 Financial visibility

Fix the double-counts (P0-1/2), then: vendor outstanding that can actually be settled (VendorPayment ledger), per-site cost including labour once rates exist, price-trend view per material (rate history + vendor comparison — §D/§E/§H in one screen: material → rate over time, colored by vendor). Purchases already carry everything needed.

### 5.5 Inventory visibility

Stock value ₹ tiles (rate-weighted — fills the two placeholder tiles), site-level thresholds, days-of-stock ("Cement at Site A: ~6 days at current burn" — 14-day trailing consumption average; label it an estimate), and a per-material flow view: purchased → godown → sites → consumed/wastage (the ledger reconstructs this exactly; §D "where did the material go?").

### 5.6 Reports

Keep the 5 tabs (they're good). Add: **PDF export** on the daily report and financial/site reports (branded, client-ready — §K), fix scheduled-report bodies (P0), promote the RMC-style groupBy chips pattern to other tabs. Photo report (date-range gallery → PDF) is the highest-value client artifact after the DSR itself.

### 5.7 Notifications (§T — three tiers, don't spam)

| Tier | Events | Channels |
|---|---|---|
| **Critical** | Site missed DSR by cutoff; stock-out of an actively-consumed material | WhatsApp (when BSP chosen) + push/email |
| **Important** | Low stock; unconfirmed movement > 48h; payment pending > 7d; unusual expense | Daily digest email + in-app |
| **Informational** | Daily compiled report; scheduled reports | Email/in-app per existing channel settings |

One digest per day for Important; Critical sends immediately but with per-event daily dedupe. The `NotificationChannelSetting` + recipient plumbing already exists — the alert *sources* are what's missing.

---

## 6. Supervisor Experience

Design target: **today's update in under 2–3 minutes, gloves on, one bar of signal.** The DSR hub already achieves ~3–5 minutes happy-path; the work is trust (offline), focus (nav), and finishing touches (fields, targets).

### 6.1 Field mode (role-shaped app, not a new app)

When `role === SITE_SUPERVISOR`, replace the 13-item admin sidebar with a field-focused home:
- **My Site** (assigned or last-used — remember it; a `lastUsedSiteId` in localStorage is enough to start, an optional `assignedSiteIds` on User is better)
- **Today's Report** (opens today's DSR for that site — created or continue)
- **Quick actions**: Consumption · Material received · Expense · Photo
- **Site stock** (read-only)
Admin surfaces (Payments, Reports, Settings-adjacent lists) disappear — which also pairs with the P0 authorization fix. Site pre-selected everywhere; date already defaults to today.

### 6.2 Make offline trustworthy (the #1 supervisor investment)

1. Move the queue drain into the app shell (runs on any page, online event + poll) — today it's one `useEffect` in `/dsr/new`.
2. Draft persistence: mirror DSR form state to IndexedDB on change; restore on reopen. Kills the back-gesture data-loss class entirely.
3. Offline-durable photos: store staged blobs in IndexedDB alongside the queued payload; upload on drain. (Real follow-up work — flagged in AGENTS.md — but it is *the* field-trust feature.)
4. Client-side compression before upload (canvas re-encode to ~1600px/80%) — multi-MB originals on 2G are self-inflicted pain.
5. Visible queue state everywhere: a "1 report waiting to sync" pill in the shell and a "pending sync" badge on Daily Activity rows (the office currently sees "Not submitted" for a queued report).

### 6.3 Finish the DSR form

- Hours/OT inline on crew rows (schema + API already accept them) — deletes the second re-entry flow for 90% of days.
- `TextareaField` for work-completed/issues; expose plannedWork/safety fields collapsed under "More".
- Field-level error mapping instead of "Something went wrong"; flag silently-dropped incomplete rows.
- Recents-first ordering in material/vendor pickers (client-side frequency from recent rows — no backend needed).
- 44px+ touch targets on crew checkboxes, photo actions, combobox buttons.
- Soft duplicate guard: if today's DSR already recorded consumption for a material, the standalone consumption form (and vice versa) warns before creating a second row.

### 6.4 Reduce data entry (§P audit results)

| Currently re-entered | Fix |
|---|---|
| Site, every form, every day | Field mode default + `?siteId` propagation (partially exists on Sites → Today's DSR) |
| Site+date again for hours | Hours inline in DSR crew rows |
| Total = qty × rate on purchase/RMC | Auto-compute (server does it for DSR RMC already) |
| Unit recall on quantity fields | Suffix the unit in the label/adornment ("Quantity (Bags)") — data is already loaded |
| Crew list daily | Already solved (prefill) — keep |

With field mode + these fixes the canonical update drops from ~30–35 taps to ~20–24 and, more importantly, becomes **loss-proof**.

---

## 7. Recommended Features

Full prioritized list. **Type**: A = UX improvement on existing functionality · B = missing capability · C = new strategic feature. Columns: DB = schema change needed · API = new/changed endpoints · Capture = new data users must enter.

### P0 — Critical (correctness & core-promise fixes)

| # | Feature | Type | Problem → Solution | User | Complexity | DB | API | Capture |
|---|---|---|---|---|---|---|---|---|
| P0-1 | Fix financial-report double-counting | Bug | Corrected DSRs & restated Payments counted twice → apply `currentDsrRowsWhere` filter; resolve Payment correction chains to tips | Owner | S | – | changed | – |
| P0-2 | Fix correction money/stock semantics | Bug | Negative-qty corrections force positive money & bypass stock floor → signed `totalAmount` on corrections, server-computed qty×rate, floor-check the negative purchase path | Owner | S–M | – | changed | – |
| P0-3 | Enforce roles on business writes | Bug | Supervisors can mark payments paid, PATCH branding, edit thresholds → `@Roles(OWNER_ADMIN)` on payments/advances writes, branding, thresholds, vendor/site edits | Both | S | – | changed | – |
| P0-4 | Deploy the report crons | A | Automation dormant → consolidate into ≤2 daily crons (compile+retry as one endpoint; schedules folded in) to fit Hobby, or move to Pro; verify Resend live; fix cron paths | Owner | S (ops) | – | – | – |
| P0-5 | Real scheduled-report bodies | Bug | Data fetched then discarded; "Your Company" branding → render fetched data per type with tenant branding | Owner | M | – | changed | – |
| P0-6 | Global offline drain + drafts + queue visibility | A | Queue trapped in one page; typing loss → shell-level drain, IndexedDB draft mirror, pending-sync badges | Supervisor | M | – | – | – |
| P0-7 | Kill the dead "Last DSR activity" column | A | Permanent "—" looks broken → wire `/dsr` data (Epic 3 shipped) or remove | Owner | XS | – | – | – |
| P0-8 | Soft duplicate-entry guard (DSR vs standalone) | B | Double stock decrement risk → warn when a same-site/date/material row exists in the other path | Supervisor | S | – | small | – |

### P1 — High value

| # | Feature | Type | Problem → Solution | User | Complexity | DB | API | Capture |
|---|---|---|---|---|---|---|---|---|
| P1-1 | Dashboard money strip + cash exposure | A | No money picture on login → month spend, vendor outstanding, advances, pending payments, one cash-exposure number (existing APIs post-P0-1) | Owner | S–M | – | small | – |
| P1-2 | Vendor payments ledger | B | Payables can never be settled → append-only `VendorPayment` (amount, method, date, note, correctsId), outstanding = purchases − payments; record-payment UI on vendor detail | Owner | M | **new table** | new | payment entries |
| P1-3 | Site detail control room | A | Site page can't answer "what's going on" → stock panel, cost summary, crew today, DSR history, health badge (all existing APIs) | Owner | M | – | – | – |
| P1-4 | Site health (Healthy/Attention/Critical) | B | No at-a-glance status → deterministic rules per §5.2, badges on cards/list | Owner | M | – | new | – |
| P1-5 | Alert engine v1 (deterministic) | B | Zero proactive signals → missed-DSR, low-stock (godown+site), aging unconfirmed movement, pending payments, unusual expense; `Alert` table + evaluation in the existing cron; email digest + in-app list via existing channel settings | Owner | M–L | new table | new | thresholds only |
| P1-6 | List search/filter/sort/pagination | A | Unbounded unscannable lists → `DataTable` query-param filters (site/date/category/vendor) + paginated endpoints; Movements & Expenses first | Both | M–L | – | changed | – |
| P1-7 | Supervisor field mode | A | Admin app on a phone → §6.1 role-shaped home, site memory/assignment, quick actions | Supervisor | M | optional `assignedSiteIds` | small | – |
| P1-8 | Hours/OT in DSR + expose hidden DSR fields | A | Second flow re-entering site+date → inline hours on crew rows; textareas; collapsed extra fields | Supervisor | S | – | – | – |
| P1-9 | Offline-durable + compressed photos | A/B | Photos lost on reload; multi-MB uploads → IndexedDB blob queue + client compression | Supervisor | M | – | – | – |
| P1-10 | Labour costing v1 | B | Per-site labour cost impossible → `dailyWage` on TeamMember (or EmploymentType default); site labour cost = Σ attended WorkRecords × wage (+OT once policy defined); feeds financial report's null | Owner | M | new columns | changed | wage rates |
| P1-11 | Price intelligence view | B | Rates captured, never analyzed → per-material rate history + vendor comparison + last-vs-previous delta (existing rows) | Owner | M | – | new | – |
| P1-12 | Stock value ₹ + site thresholds + days-of-stock | B | Placeholder tiles; godown-only thresholds; no forecast → rate-weighted valuation, site-level threshold checks, 14-day burn-rate estimate | Owner | M | – | new | – |
| P1-13 | PDF export (daily + financial + photo report) | B | Nothing forwardable to clients → branded PDF via print-stylesheet/renderer on existing report views | Owner | M | – | small | – |
| P1-14 | White-label the app chrome | B | `tenant.ts` hardcodes name/color → drive shell, manifest, sign-in from BrandingConfig (render secondary/accent/address/GSTIN too, or drop those fields) | Both | M | – | – | – |
| P1-15 | Expense receipt photo (FR-41) | B | Spec'd, absent → reuse the challan presign flow; `receiptPhotoUrl` on Expense | Supervisor | S | new column | small | photos |

### P2 — Valuable

| # | Feature | Type | Notes | Complexity | DB/API/Capture |
|---|---|---|---|---|---|
| P2-1 | Consumption trends + site comparison | B | Today/week/last-week/month per material; per-site per-day normalization (§D). Existing data. | M | new API |
| P2-2 | Global search / command palette | B | One box: materials→stock, people→advances, vendors→outstanding (§Q). Needs search endpoints (none exist). | M–L | new API |
| P2-3 | In-app notification center | B | Bell + feed over the P1-5 Alert table; read-state. | M | small DB/API |
| P2-4 | WhatsApp delivery | B | Pick the BSP (PRD OQ-3), replace the placeholder sender. Highest-leverage channel for this market. | M (mostly vendor) | – |
| P2-5 | Photo timeline & client photo report | A/B | Date-grouped gallery, filters, before/after pairing, PDF (§J). Photos + dates exist. | M | small API |
| P2-6 | Vendor detail enrichment | A | Show the summary the list already computes; add RMC deliveries; per-purchase payment status once P1-2 lands. | S | – |
| P2-7 | Daily Activity date navigation | A | `/dsr?date=` already supports it; add a date pager. | S | – |
| P2-8 | Movements "Record" consolidation + filters | A | Six-button wall → one split-button; type/site/date filters (with P1-6). | S | – |
| P2-9 | Perf hygiene | A | Per-member advance endpoints (kill tenant-wide client filtering), batch site-stock endpoint (kill N+1 that 500s the page), `next/link` row navigation. | M | changed API |
| P2-10 | Owner daily digest email | B | The compiled per-site reports exist; add one cross-site morning summary email (deterministic — no AI needed). | S–M | small API |
| P2-11 | Dark mode toggle | A | Tokens fully built and unreachable. | XS | – |
| P2-12 | Movement receipt aging surfacing | A | Pending-receipt age on Movements + feeds P1-5 alert. | S | – |

### P3 — Future (see §10 Strategic Roadmap for detail)

BOQ / planned-vs-actual · budget & contract value on Site · AI owner briefing & NL queries · anomaly detection beyond thresholds · predictive purchase suggestions · client portal/share links · approval workflows (see note below).

**On approvals (§N):** the spec deliberately mandates *no approval gates* (NFR-3, FR-22 "no approval step") — recording speed is a product value. Honor that. The P0-3 role fix plus P1-5 alerting ("₹40,000 advance recorded at Site C") gives the owner control-by-visibility without adding friction. Revisit true approvals only if tenants ask; the only candidate worth it is a configurable large-amount threshold on payments/advances.

---

## 8. Quick Wins

No architecture changes; days not weeks; immediately visible:

1. **Wire or remove the dead "Last DSR activity" column** (P0-7) — one endpoint call.
2. **Auto-compute qty × rate** on purchase/RMC forms — deletes manual multiplication and an error class.
3. **Vendor detail summary** — render the purchase-summary the list already fetches.
4. **Unit suffix on quantity labels** ("Quantity (Bags)") — reference data is already loaded into the picker.
5. **Textareas for DSR narrative fields** — component exists.
6. **Hours/OT inputs on DSR crew rows** — schema and API already accept them.
7. **Dashboard money strip v1** — `/expenses/summary` and vendor summaries are live endpoints today.
8. **"Needs attention" ordering** — move GapFlags above the stat tiles; add pending-receipt-age and pending-payment items from existing queries.
9. **Daily Activity date pager** — `/dsr?date=` supports any date.
10. **Touch-target pass** — crew checkboxes, photo actions, combobox buttons to 44px.
11. **Site pre-selection propagation** — carry `?siteId` through quick-entry links from site detail (pattern already exists for Today's DSR).
12. **Role-fix sweep (P0-3)** — mostly adding `@Roles` decorators + the web 404 guards that Settings already demonstrates.
13. **Correction semantics fix (P0-2)** and **financial report filter fix (P0-1)** — small, high-stakes.
14. **Low-stock Transfer CTA pre-fill** — the flag knows the material; the form should too.

## 9. Medium-Term Improvements

Moderate backend/DB/UI work, ordered by leverage:

1. **Alert engine v1 + notification digests** (P1-5, P2-3, P2-10) — the single biggest step toward the north star; one new table, evaluation inside the existing cron, delivery through existing channels.
2. **Vendor payments ledger** (P1-2) — one new append-only table modeled on the existing labour Payment pattern; unlocks true outstanding, settle-able invoices, and honest cash exposure.
3. **List filtering/pagination platform** (P1-6) — a shared query-param + paginated-endpoint pattern rolled across Movements, Expenses, Purchases, Team, Payments.
4. **Supervisor field mode** (P1-7) + **offline hardening** (P0-6, P1-9) — trust + focus for the phone user.
5. **Labour costing v1** (P1-10) — new wage capture; turns attendance data into per-site cost.
6. **Intelligence read-layer** (P1-11, P1-12, P2-1) — price history, stock value, burn rate, trends: all SELECTs over existing ledgers.
7. **PDF/export pipeline** (P1-13, P2-5) — one renderer serving daily, financial, and photo reports.
8. **White-label completion** (P1-14) — BrandingConfig → app shell, manifest, sign-in.
9. **Cron consolidation & live-provider verification** (P0-4) — merge the three jobs into ≤2 daily-safe endpoints or upgrade the plan; run the Resend and Cloudinary round-trips against real accounts.

## 10. Strategic Roadmap

Only capabilities that fit this product's shape (deploy-per-tenant, append-only ledger, two roles, no-ERP philosophy):

1. **Contract & budget on Site** (fields: contract value, start/end, client name) → simple **budget vs actual** from the financial report. Prerequisite for everything below; small schema change, big framing shift ("site" becomes "project").
2. **BOQ / quantity intelligence** (§M): BOQ line items (material/size, planned qty, optional rate) per site → planned vs consumed vs in-stock reconciliation → leakage/overconsumption flags. Depends on: labour costing (P1-10), budget fields, and the trends layer. This is the natural "phase 2 product" — do it only after the intelligence read-layer proves engagement.
3. **AI owner briefing** (Now→Near: deterministic first). The morning digest (P2-10) needs no AI. **Near-term AI**: natural-language summary of the digest + DSR narratives ("Site B reported a pump failure; expenses up 22% this week"). **Future AI**: NL queries ("how much cement did Site B consume this month?") over the existing report APIs; photo classification/missing-progress detection. Every AI feature rides on aggregates the deterministic layer must expose first — build the rules, then the language.
4. **Anomaly detection** beyond fixed thresholds (per-site rolling baselines for consumption/expense/labour count) — an evolution of the P1-5 engine, not a new system.
5. **Predictive purchasing** (§H): days-of-stock forecast → suggested purchase quantities with last-known vendor/rate. Recommendation-only, never auto-ordering.
6. **Client portal / share links**: read-only, token-scoped views of the branded daily/photo/progress reports. Fits deploy-per-tenant cleanly (no cross-tenant surface); high perceived value for government/consultant reporting.
7. **WhatsApp-first delivery** (P2-4 grown up): daily report cards, critical alerts, possibly DSR-submission nudges to supervisors.

**Not recommended**: full project scheduling/Gantt, accounting-grade GL, procurement workflows with RFQs, or in-app cross-tenant anything — each violates the "control room, not ERP" premise or the AD-1 isolation guarantee.

---

## 11. Appendices

### A. Navigation analysis & proposed IA

Current: 14 entity-shaped items in 4 groups + 3 ungrouped. Problems: Vendors/RMC/Expenses under "Assets" (wrong semantics), stock split across Materials/Inventory/Movements, "Insights" with one item.

Proposed (change grouping/labels only — no page rewrites; do it with the P1 work, not before):

- **Dashboard** · **Sites** · **Daily Activity** (unchanged — these are the workflow anchors and they're correct)
- **Stock**: Inventory (levels) · Movements (ledger) · Materials (catalog, admin-leaning)
- **People**: Team & Labour · Payments
- **Money**: Vendors · Expenses · RMC
- **Machinery & Vehicles**
- **Reports** · **Settings**

Supervisor field mode (P1-7) replaces this entirely for the SITE_SUPERVISOR role.

### B. Workflow maps (current → target)

**Supervisor day**: Login → Daily Activity → New Report → *pick site* → fill 7 sections → submit → (separately: Team → Record Attendance for hours). Target: Login → field-mode home (site remembered) → Today's Report → fill (hours inline) → submit → offline-safe everywhere. Steps removed: site pick, second attendance flow, re-typed totals.

**Inventory**: Purchase → stock → movement (sent) → confirm receipt → site stock → consumption → return/wastage. The chain is complete and correct; missing is the *reconciliation view* (per-material flow: purchased → where it sits → consumed) and receipt-aging pressure. No steps to remove — this workflow is the product's best.

**Labour**: Worker → WorkRecord → Advance → Payment (+AdvanceAdjustment) → mark paid. Mechanically sound; missing wage capture (so records never become cost) and per-member API endpoints. No steps to remove.

**Owner**: Login → dashboard (today counts) → *hunt through Reports tabs for money answers* → phone the supervisor anyway. Target: Login → attention zone → site drill-down → act (record vendor payment / send report) — the hunt is what P1-1/3/4/5 delete.

### C. Redundant / vestigial — remove, merge, or finish

| Item | Action |
|---|---|
| Orphaned desktop DSR route `/daily-activity/new` (zero inbound links) | Link it for desktop admins or delete the route (correction flow imports the component directly) |
| `Expense.purchaseId` (never written or read) | Drop the column, or implement the purchase-cost link it promises |
| `WorkRecord.hours`/`overtimeHours` unused in any computation | Becomes load-bearing with P1-10; until then it's capture-without-purpose |
| `Purchase.paymentStatus` immutable-after-create | Superseded by the VendorPayment ledger (P1-2); derive status, stop capturing it manually |
| Dead exports: `markPaymentPaidSchema` (empty), `ENABLED_CHANNELS` | Delete |
| Stale comments: "ClerkAuthGuard" ×3, "Cloudflare R2", "Story 14.2 will guard branding", sites-page "until Epic 3 ships" | Sweep (the branding one is masking a real authZ hole — P0-3) |
| Six-button Movements header wall | One "Record ▾" split-button |
| "Insights" nav group with one item | Fold into proposed IA |
| BrandingConfig `secondaryColor`/`accentColor`/address/GSTIN stored but never rendered | Render (reports footer is the natural home) or drop from the form |
| Unused `BarChart`, unreachable dark theme | Use (P1-11 trends, P2-11) — both are finished components |

### D. The most important question — top 10 owner needs vs current product

| # | "Every day I want to…" | Current support | UX quality | Gap | Recommendation |
|---|---|---|---|---|---|
| 1 | Know every site reported today | ✅ Dashboard flags + counts | Good | Links to site, not report context | Keep; deepen links (Quick win 8) |
| 2 | See where money went this month | ⚠️ Financial report tab | Buried, 3+ clicks, double-count bugs | Dashboard has no money | P0-1/2 + P1-1 |
| 3 | Know what I owe vendors | ⚠️ Proxy total on vendor list | Misleading (can never settle) | No payments ledger | P1-2 |
| 4 | Know if a site will run out of material | ⚠️ Godown-only low-stock count | Count without names on dashboard | No site thresholds, no forecast | P1-12 |
| 5 | See what each site actually did (work, photos) | ✅ Daily Activity + DSR detail | Good | Today-only navigation | P2-7 |
| 6 | Know labour cost per site | ❌ Structurally impossible | — | No wage/rate, no Payment.siteId | P1-10 (new capture) |
| 7 | Know total cash tied up | ⚠️ Advances + pending count only | Fragmented | No vendor side, no single number | P1-1 + P1-2 |
| 8 | Catch price increases | ❌ Rates stored, never compared | — | No read layer | P1-11 |
| 9 | Be told when something needs me | ⚠️ Missing-DSR flag only | Pull-only | No alert engine | P1-5 |
| 10 | Forward a professional report to my client | ⚠️ Branded email exists in code | Dormant (no crons), no PDF | Not operational | P0-4 + P1-13 |

Score: 2 solid, 6 partial, 2 absent — and the two absents plus the three money partials are all in the same theme: **money and attention**, which is exactly where the P0/P1 plan concentrates.

### E. AI features — Now / Near / Future

- **Now (no AI needed)**: morning digest, alerts, trends, price deltas — deterministic rules over existing data. Do not spend AI budget on problems SELECT statements solve.
- **Near**: NL summary of digest + DSR narrative fields (the six free-text DSR sections are the one genuinely unstructured asset); WhatsApp-formatted briefing.
- **Future**: NL query over report APIs; photo classification/progress detection; anomaly baselines. All contingent on the deterministic layer existing first.

### F. Safe-First Execution Order (added 2026-08-30)

Re-prioritization by blast radius, for shipping against the live tenant without regression risk.

**Tier 1 — zero risk (display-only / reads of existing endpoints): ✅ SHIPPED 2026-08-30.** All ten items implemented and verified (typecheck, lint, 580 web + 126 ui tests, production build — all green):

1. ✅ **Dashboard "Money" row** (`app/(app)/page.tsx`) — Expenses This Month/week + largest category (`/expenses/summary`), Vendor Outstanding (per-vendor purchase summaries summed), and **Cash Tied Up** (vendor dues + advances outstanding). Every card degrades to an honest "—" on a failed read — a Money-row failure can never blank the core dashboard (covered by 2 new tests).
2. ✅ **Site-detail control room** (`sites/[id]/page.tsx`) — "Today at this Site" panel (DSR-submitted badge, crew count, material-entry count), Current Stock table (`/stock/site/:id`), Recent Daily Site Reports last-30-days table (`/reports/sites` → dsrs, row-linked to each report), all fault-isolated, plus quick actions.
3. ✅ **Vendor-detail summary** (`vendors/[id]/page.tsx`) — total-this-year + not-marked-Paid figures (same endpoint the list uses) now on the detail page.
4. ✅ **Dead "Last DSR activity" column replaced** (`sites/page.tsx`) — now a live "DSR today" status (Submitted badge / Not yet / honest "—" on lookup failure) fed by the same `GET /dsr?date=` the Daily Activity log uses.
5. ✅ **Unit-suffixed quantity labels** — "Quantity (Bags)" once a Material is picked, on the DSR consumption rows, consumption form, movement form, and purchase form.
6. ✅ **DSR narrative textareas** — Work completed / Issues are multiline `TextareaField`s.
7. ✅ **Touch-target pass** — crew checkboxes size-5 with the full row-label tappable (~44px), photo Retry/Remove padded to ≥32px, combobox clear/open buttons 24→32px.
8. ✅ **Daily Activity date pager** (`daily-activity/page.tsx`) — `?date=` (validated, never future) with Previous/Next-day and Jump-to-today; no param = exactly the old today view.
9. ✅ **Low-stock Transfer CTA pre-fill** (`inventory/page.tsx` → `movements/godown-to-site/new?materialId=`) — pre-selects the Material Size when unambiguous (single-size Material).
10. ✅ **`?siteId` propagation** — consumption/new, expenses/new, and godown-to-site/new honor a validated `?siteId=`; site detail's quick actions carry it.

**Tier 2 — additive backend, isolated from existing tables/flows:** price intelligence, stock value ₹, days-of-stock, trends, site-health badges (new read endpoints, zero writes); expense receipt photo (nullable column + existing presign flow); labour `dailyWage` (nullable column, fills a previously-null report cell); VendorPayment ledger (new append-only table, mirrors the labour Payment pattern, touches nothing existing); hours/OT in the DSR form (API already accepts); drafts + queue badges + shell-level offline drain (server already idempotent); PDF export; soft duplicate-entry warning (warn, never block); alert engine **in-app only** first (no external sends).

**Tier 3 — output-changing bug fix, no writes/schema:** financial-report double-count fix (query-level change in one read service; ship with before/after tests on a corrected-DSR fixture).

**Deliberately deferred (each needs its own careful change, not a safe batch):**
- Role lockdown (P0-3) — could lock a live supervisor out of real daily work; confirm actual role usage first, then apply endpoint-by-endpoint. Exception: guarding branding PATCH is safe immediately.
- Correction money semantics (P0-2) — edits shared Zod schemas consumed by both apps; sequence and test as an isolated change.
- Cron deployment + live email — stage via manual `CRON_SECRET` trigger against a test recipient before scheduling.
- List pagination/filters — only via optional query params defaulting to current full-list behavior.
- Supervisor field mode, nav regrouping, white-label chrome — batch as a deliberate "v2 shell" release; behavior change, not breakage.
- All removals (dead column, orphaned route) — no user value, never in a safe batch.

### G. Product North Star

> **AzentisFieldOS is the contractor's daily control room: the supervisor's 2-minute phone habit at the end of each day becomes the owner's 60-second morning briefing — every site, every rupee, every bag of cement, and only the exceptions demand attention.**

The owner opens the app and answers: *What happened across my sites? Where is my money and material going? What needs me today? Which site is off-track? What's about to go wrong?* — without a single phone call. The foundation (connected DSR, honest append-only ledger) is already built and is genuinely good. What remains is to make the system *speak first*: fix the money math, turn the recordings into attention, and switch the automation on.


