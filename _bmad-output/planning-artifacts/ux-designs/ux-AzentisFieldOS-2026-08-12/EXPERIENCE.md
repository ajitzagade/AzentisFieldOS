---
name: AzentisFieldOS
status: final
sources:
  - "{planning_artifacts}/../specs/spec-AzentisFieldOS/SPEC.md"
  - "{planning_artifacts}/../specs/spec-AzentisFieldOS/functional-requirements.md"
  - "{planning_artifacts}/../specs/spec-AzentisFieldOS/glossary.md"
  - "{planning_artifacts}/prds/prd-AzentisFieldOS-2026-08-11/prd.md"
  - "{planning_artifacts}/briefs/brief-AzentisFieldOS-2026-08-11/brief.md"
  - "{planning_artifacts}/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md"
updated: 2026-09-02
---

# AzentisFieldOS — Experience Spine

## Foundation

Multi-surface responsive web: a desktop-primary application shell for the Owner/Admin, and a mobile-primary flow for the Site Supervisor. Both are served by the same Next.js app (`apps/web`) — there is no separate native app. `DESIGN.md` is the visual identity reference; this spine is the behavioral contract. Single-tenant per deployment — there is no tenant switcher, no "current tenant" concept, and no cross-tenant Platform Operator role or screen anywhere in the product (AD-1, AD-11); tenant provisioning happens outside the running app entirely (AD-2).

Two roles only, and the interface never blurs them:

- **Owner/Admin** — full tenant access, desktop-primary (also opens the app on a phone to check status), reviews and decides.
- **Site Supervisor** — mobile-primary, low-end Android, frequently poor connectivity (NFR-2), logs fast and moves on.

There is no approval-chain UX anywhere in this product — no multi-step wizards, no "pending manager approval" states. Every screen assumes the simplicity mandate from the brief: minimal required fields, dropdowns and defaults over typing, no enterprise-ERP density.

**Client Presentation** — a related but separate artifact (`apps/web/public/presentation.html`), not an in-app IA surface. It is a single self-contained, scrollable HTML page built for a client demo — "how the system works," told in plain language to someone who has never used the product. It inherits `DESIGN.md`'s tokens directly (same colors, type scale, shadows, motion ceiling) so it visually reads as "the same product," but it is presentational, not operational: no login, no live data entry, no navigation chrome. It draws its module explanations, flows, and examples from the same shared content source that powers Help & Guides below (see Component Patterns → Guide content source) — the two are never authored independently.


## Information Architecture

| Surface | File | Reached from | Purpose |
|---|---|---|---|
| Login | `00-login.html` | App entry | Tenant-branded sign-in, single-tenant (no tenant picker) |
| Dashboard | `01-dashboard.html` | Sidebar / post-login | Owner's daily story: Today's Activity → Overall → drill-down |
| Sites | `02-sites.html` | Sidebar | All Sites, status, last-DSR-activity |
| Site detail | `03-site-detail.html` | Sites row / Dashboard site card | One Site's chronological record feed |
| Daily Activity (log) | `18-daily-activities.html` | Sidebar | Cross-site DSR oversight: who's reported, who hasn't, full report detail |
| Daily Activity (entry) | `19-daily-activity-entry.html` | "New Daily Activity" / "Correct" on the log | Desktop DSR creation and correction |
| DSR mobile entry | `04-dsr-entry.html` | "View mobile field entry" link from the log | The Site Supervisor's actual field flow |
| Inventory | `05-inventory.html` | Sidebar | Godown + Site-wise stock, low-stock flags |
| Materials | `06-materials.html` | Sidebar | Material catalog config (admin) |
| Movements | `07-movements.html` | Sidebar / Inventory | Purchase / Movement / Consumption / Wastage log |
| Team & Labour | `08-team.html` | Sidebar | Roster + today's attendance |
| Team member detail | `09-team-member-detail.html` | Team row | Work Record history + Advance ledger |
| Payments | `10-payments.html` | Sidebar | Net Payable log |
| Machinery & Vehicles | `11-machinery-vehicles.html` | Sidebar | Registers + movement/maintenance history |
| Vendors | `12-vendors.html` | Sidebar | Vendor list |
| Vendor detail | `13-vendor-detail.html` | Vendor row | Master data + Purchase history |
| RMC | `14-rmc.html` | Sidebar | Ready-Mix Concrete deliveries |
| Expenses | `15-expenses.html` | Sidebar | Expense log |
| Reports | `16-reports.html` | Sidebar | Delivery log + branded report preview |
| Settings | `17-settings.html` | Sidebar (bottom) | Branding / Users & Roles / Categories |

Sidebar groups: ungrouped (Dashboard, Sites, Daily Activity) → **Materials** (Inventory, Materials, Movements) → **People** (Team & Labour, Payments) → **Assets** (Machinery & Vehicles, Vendors, RMC, Expenses) → **Insights** (Reports) → Settings pinned to the bottom. This structure was chosen over a flat 15-item list because it groups by *what the Owner is thinking about*, not by database table — materials-in-motion, people-and-money, and site-assets each cluster together.

> **Note (post-launch drift):** as `apps/web` grew past this mockup set, the shipped sidebar regrouped to Stock / People / Money / Machinery & Vehicles / Reports and gained two new surfaces this table predates: Waste & Disposal (per-trip disposal cost, under Stock — the closest semantic fit, an inventory-outflow concept like Movements) and Audit Log (under Settings — a trust/accountability surface, not daily work). Code is ground truth for the live grouping; this table stays the historical IA rationale. The addition below follows the *live* grouping.

> **2026-09-01 simplicity revision (user-approved decisions D1–D7; mockups: `.working/simplicity-mockups.html`):** the IA is now role-forked at the top layer. A **SITE_SUPERVISOR** lands on a task-first **Home** (hero "Start Daily Report" card + one-tap tiles: Material Received / Sent / Used, Attendance, Site Photos; less-frequent entries — RMC, Wastage / Return, Expense — in a "More" list), sees a trimmed 7-item sidebar (Home, Sites, Daily Report, Inventory, Movements, Waste & Disposal, Team & Attendance, + Help), and gets a persistent mobile bottom quick-bar (Home · Report · Materials · Help). Trimming is de-emphasis, never removal — owner surfaces stay URL-reachable and the API's role guards are the real boundary. An **OWNER_ADMIN** keeps the full rail and cross-Site Dashboard unchanged (plus a "New Daily Report" header action and a "pricing pending" gap-flag). The user-facing name for the DSR concept is **"Daily Report"** on every surface; "DSR"/"Daily Activity"/"Daily Site Report" no longer appear in UI copy (routes and the glossary's domain term are unchanged). New surface: `/movements/purchases/[id]/pricing` — the Owner's one-time pricing completion of a Supervisor's unpriced inward entry (D7).

**Help & Guides** (`/help` in `apps/web`, new) — pinned at the bottom of the sidebar, directly above Settings. Same reasoning as Settings' placement: a utility surface reached when needed, not part of the daily Dashboard → Sites → DSR loop. Contains:
- A landing page: "What do you want help with?" search + Getting Started / Sites / Materials / Labour / DSR / Owner section cards.
- One visual step-by-step guide per real task (see Component Patterns → Guide Step below), each ending in a genuine "Try it yourself" link into the real page it teaches.
- Every guide, and the landing page's section cards, are rendered from the same shared content source the Client Presentation draws from (see Foundation) — a guide added once appears in both places.

> **2026-09-02 Owner quick-access & mobile-alignment revision** (approved by Ajit; mockups: `mockups/24-owner-quick-access-and-mobile-alignment.html`): an audit of the live `apps/web` Owner experience found most single-entity actions already ≤2 clicks away, but three real gaps — the pending-pricing gap-flag landing on a generic list instead of the record, Advance entry buried 3 clicks inside a Team Member's profile, and ⌘K search covering only Sites and Materials — plus, separately, a real mobile bug: action-button rows across ~12 pages wrap unevenly with no full-width-stack rule below the mobile breakpoint. All fixes below are additive (no surfaces removed, no new top-level nav items); each is detailed in its own Component Patterns row further down: a **Dashboard quick-actions bar**, a **pending-pricing deep link**, a **Search / Action palette** expansion (which supersedes the old "no command palette" line under Interaction Primitives, written before the palette shipped), an **Advance quick-entry modal**, an **Owner mobile quick-bar**, **recently-viewed shortcuts**, an **action-button group** mobile fix, and closing the **mobile card list** gap on Sites/Vendors/Team & Labour/Inventory.
>
> **Deferred, not designed here**: Vendor payment recording and Subcontractor Site Contract payment UI are real gaps the audit surfaced, but both need new API/backend work — out of scope for this navigation/quick-access pass, logged as separate future work.

> **Epic 18 addition (2026-09-02): Subcontractor Management.** New surfaces, all under the live sidebar's **Money** group (next to Vendors, per the live-grouping rule above — this is the first addition made directly against the current code IA, not the historical Materials/People/Assets/Insights table): `20-subcontractors.html` (list), `21-subcontractor-detail.html` (contact info + every Site Contract this Subcontractor holds, across Sites), `22-site-contract-new.html` (engage a Subcontractor on a Site — see Component Patterns → Rate type picker), `23-site-contract-detail.html` (terms + Work Entry ledger + Payment ledger + payable/paid/outstanding StatTiles). `03-site-detail.html` gained a "Subcontractors" section (between the Activity Pulse and the Activity Feed) listing every Site Contract at that Site. **Naming:** the user-facing entity is **"Subcontractor,"** never "Contractor" — that word already means the tenant/company itself everywhere else in this product (Dashboard, CAP-10, glossary) and reusing it for an external party would read as self-contradictory on every screen. Full requirements: `functional-requirements.md#CAP-17`; epic doc: `epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md`.

→ Composition reference: `mockups/*.html` (the original 20 screens, fully cross-linked and click-through, plus 4 added by Epic 18, plus `24-owner-quick-access-and-mobile-alignment.html` for the patterns above) plus the live `apps/web` app itself for everything built since. Spine wins on conflict.

## Voice and Tone

Microcopy. Brand aesthetic posture lives in `DESIGN.md.Brand & Style`.

| Do | Don't |
|---|---|
| "NH-48 Highway Widening — Package 3 has not submitted a Daily Site Report yet today" | "⚠️ Missing data!" |
| "Saved on device — will sync when back online" | "Offline. Data may be lost." |
| "Cannot exceed Outstanding Balance of ₹8,000" | "Error: invalid amount" |
| Use exact glossary terms always: Site, Godown, DSR, Advance, Outstanding Balance, Team Member, Correct | Substitute synonyms: "warehouse," "employee," "edit," "project" alone |
| State what happened and what to do next, in plain operational language | Use exclamation points, emoji, or gamified language ("🎉 Great job!") |
| Same tone for Owner and Supervisor — counts, verbs, facts | A friendlier/simpler tone for the Supervisor as if they need hand-holding |

**Help & Guides / Client Presentation addendum** — the operational app's tone above (facts, no hand-holding) is for people who already know the product. Explanatory content is different: it is written for someone who has never seen construction-management software, so it goes one step simpler *in addition to* every rule above, not instead of it:

| Do | Don't |
|---|---|
| "When material is used, the stock automatically goes down." | "Inventory mutation is triggered on consumption record creation." |
| "The supervisor records what happened at the site today." | "Users submit daily activity data via the DSR entity." |
| Keep exact glossary terms (Site, DSR, Advance, Godown, Team Member, Correct) — but explain each one in plain words the first time it appears in a guide | Invent friendlier synonyms for glossary terms ("warehouse" for Godown) — the client needs to learn the product's real vocabulary, just explained simply |
| One idea per sentence; short sentences over compound ones | Long paragraphs explaining several ideas at once |
| Real construction numbers in examples (100 bags of cement, ₹2,000 advance) | Abstract placeholders ("Item A," "Amount X") |
| Explain *why* a screen exists before *how* to use it ("Inventory tells you how much material is at each site" before the steps) | Jump straight into steps with no reason given |
| Label anything not yet shipped **Coming Soon**; log improvement ideas as **Recommended Future Improvements** — never present either as available today | Describe a planned or ideal feature as if it already works |

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Sidebar nav | Every desktop screen | Persistent, one active item at a time. Icon+label always. Never contains a tenant switcher or a "Platform Operator" entry. |
| Stat tile | Dashboard, Inventory, Daily Activity, Movements, RMC | Read-only summary; where the underlying data has a real destination (e.g. "Outstanding Advances"), the tile itself is a link. |
| Data table | Every list screen | Zebra + hover always. Row is a link (wrapped `<a>` per cell, not `onclick`) whenever a real detail surface exists; rows with nothing to open (e.g. a Site with no DSR yet) carry no pointer cursor and no link — never a clickable-looking dead end. |
| Row-level "Correct" | Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment, Work Record, synced DSR | Icon-only ghost button. Opens a new entry requiring a reason, linked to the original. Never Edit/Delete on these rows (AD-9). |
| Row-level "Edit" | Vendor master data, Material catalog, category config, Users & Roles | Normal edit-in-place — this is config/master data, not transaction history, so mutation is correct here. The two patterns must never be visually confused. |
| Gap flag | Dashboard, Inventory (low stock), Daily Activity (missing report) | Warning-toned banner with icon + message + one primary action. Appears inline in context, never as a separate "alerts" screen users have to remember to check. |
| DSR sync-state indicator | Mobile DSR entry, Daily Activity log | Two unambiguously distinct states: "Saved on device — will sync when back online" (warning tokens + wifi-off icon) vs. "Synced" (success tokens + check-circle icon). Never a single ambiguous "pending" spinner. |
| Photo capture / upload | Mobile DSR entry (camera), Desktop DSR entry (drag-drop) | Thumbnail grid, always additive (no forced single-photo limit). Desktop offers drag-drop; mobile offers camera-icon tap — same underlying field, platform-appropriate input method. |
| Correction banner | Desktop DSR entry (`19-daily-activity-entry.html`) | Explains that this same form both creates new entries and files corrections; a correction prepends a reason requirement and links to the original. Read this as documentation-in-product, not decoration. |
| Guide step | Help & Guides guide pages | A numbered card per step: step number in a filled `accent-teal-700` circle, one short instruction, an optional real screenshot with the relevant field/button highlighted (never a full unannotated screenshot), a flow-line connector (arrow, `≤160ms` fade-in on scroll into view — same motion ceiling as everything else, no bounce) to the next step. The final step of every guide is a real "Try it yourself" link into the live page it just taught — an actual `<a>`, never a fake button. |
| Guide content source | Help & Guides, Client Presentation | Both surfaces render from one shared content source (module explanations: what/why/who/how/after-save/example; flow stories; FAQ entries) — a guide or example authored once appears in both places automatically. Editing content in two places is a defect, not a maintenance choice. |
| Contextual help ("ⓘ") | Inline next to any field or concept a first-time user would find confusing (e.g. "Material Consumption," "Advance") | A small ghost icon-button (ⓘ), same visual family as row-action icon buttons. Click/tap opens a short popover (2–3 sentences max, same plain-language rule as Help & Guides) anchored to the icon — never a full-screen takeover, never navigation away from the field the user was filling in. Pulled from the same shared content source as the matching guide's "What is this?" answer. |
| Help search | Help & Guides landing page | One search field: "What do you want help with?" Matches guide titles and their content by plain-text search — no fuzzy AI matching required, this is a small, known content set. Empty-query state shows the section cards (Getting Started / Sites / Materials / Labour / DSR / Owner); a query with zero matches follows the standard Empty state pattern below (message + suggestion to browse by section, never a dead end). |
| Supervisor Home task card | Supervisor Home (`/` for SITE_SUPERVISOR) | Hero card (filled teal, full-width) for Start Daily Report; two-up grid of interactive Cards for the other one-tap tasks; "More" rows for less-frequent entries. Every card is a plain link into an existing flow — the Home owns no business logic. |
| Bottom quick-bar | Every screen below `lg`, SITE_SUPERVISOR only | Fixed 4-item bar (Home · Report · Materials · Help); "Report" deep-links to the entry form, not the log. Active state = color + weight + `aria-current`, never color alone. Main content carries bottom padding so the bar never covers a submit button. |
| Corrected-value field | Every quantity/amount correction form | The user types the value that is right; the field reads back "Was X → change of ±Y will be recorded" and submits only the derived signed delta — the ledger contract (AD-9) is untouched. A user is never asked to compute a delta. |
| Site picker (`SiteField`) | Every entry form's Site selection | Searchable combobox that remembers the device's last-used Site as the default next time ("Remembered from your last entry" hint); an explicit deep-link Site beats the remembered one. Never a long native dropdown. |
| More-details fold | Long entry forms (e.g. Purchase paperwork fields) | Optional fields collapse behind one native-`<details>` toggle; collapsed fields still submit. Open by default when any folded field already has a value. |
| Mobile card list | Wide lists (Payments, RMC, Expenses, Movements, Waste, Sites, Vendors, Team & Labour, Inventory's stock tables) below `md` | Each row renders as a card — key facts first, status as text+color pill, the row action always visible. Desktop keeps the full table. No horizontal-scroll-only tables — this is a hard rule, not a per-list judgment call; any list wide enough to clip a column on a 390px screen needs `mobileCard`. |
| Pricing pending (D7) | Movements list, Owner Dashboard | A Supervisor's inward entry saves without Rate/Total/Payment Status ("Rates & amounts are entered by the office"); stock updates immediately. The entry wears a warning "Pricing pending" badge, the Owner Dashboard flags the count, and the Owner completes pricing once (quantity shown read-only, Total auto = qty × rate, editable). Unpriced entries are excluded from money figures — surfaced as a pending count, never ₹0. |
| Inline validation | Every server-action form | The same shared `parse.ts` the action runs also validates pre-submit on the client — per-field errors appear before any round-trip and can never disagree with the server (AD-7). |
| Rate type picker | New/Edit Site Contract (`22-site-contract-new.html`) | Five pills (Fixed Cost / Per Trip / Per Pipe / Per Unit / Custom), one selectable at a time. Choosing a pill swaps in only the fields that rate type needs — Fixed Cost asks for one total; Per Trip/Per Pipe ask for a rate; Per Unit/Custom additionally ask for a free-text unit label. Never a single field set with irrelevant fields grayed out — the form only ever shows what applies. |
| Pending terms | Subcontractor detail, Site detail's Subcontractors section, Site Contract detail | A Draft Site Contract's not-yet-filled rate/amount renders as italic muted "Pending terms" — never `₹0` — matching the D7 pending-pricing convention (never render an absent commercial term as zero). |
| Dashboard quick-actions bar | Owner Dashboard header | New Daily Report keeps hero-primary styling as the single most-frequent action; Record Payment / Record Advance / Add Purchase render as secondary-styled buttons beside it, plus a Search chip showing the `⌘K` hint. Wraps like any other action-button group (see Action-button group below) on narrow viewports. |
| Search / Action palette | Every screen (`⌘K` on desktop; a tap target in the Owner mobile quick-bar) | Two changes to the existing Sites/Materials-only search: (1) **entity coverage expands** to every major record type — Vendors, Team Members, Payments, Purchases, Subcontractors, RMC entries, Expenses — each its own grouped, "See all" result set, same mechanism as the existing Sites/Materials groups (plain-text match against name/title, no fuzzy AI matching); (2) a small, hand-curated **Actions** group is added (one entry per primary flow: New Daily Report, Record Payment, Record Advance, Add Purchase/Vendor/Team Member/Subcontractor, Review & Price, Open Reports, Open Settings), matched the same way, always rendering above entity groups when a query matches both. Selecting an action needing a target (Record Payment, Record Advance) opens the matching quick-entry modal rather than navigating away; selecting an entity result opens that record directly. Visually distinct entity-vs-action rows — see `DESIGN.md.Components`. |
| Advance quick-entry modal | Dashboard's Outstanding Advances card, quick-actions bar, Action palette | Lightweight modal: a searchable Team Member combobox (same pattern as `SiteField`, scoped to Team Members), amount, reason. Submits the same `Advance` record the Team Member profile's full form creates — a shortcut, not a parallel backend flow. Success returns the user to where they opened it from, per the existing Success state pattern below. |
| Owner mobile quick-bar | Every screen below `lg`, OWNER_ADMIN only | Fixed bar: Dashboard · Sites · a center "+" Quick Add sheet (same curated action list as the Action palette) · Search (opens the Action palette, touch-first) · More (full nav). Distinct from the Supervisor's bottom quick-bar (single dominant task vs. Owner's entity-spanning action set) — same visual family (fixed, `aria-current` active state, content bottom-padding so the bar never covers a submit button). |
| Recently-viewed shortcuts | Dashboard, under the quick-actions bar | Device-local (same convention as `SiteField`'s remembered-Site localStorage, no new backend) row of the last 4-6 distinct records opened, any entity type, most-recent-first, cleared on sign-out. Read-only jump links — no pinning/favoriting logic. |
| Action-button group | Any header or card offering 3+ actions (Movements, Site detail's "Today at this Site" card, Team & Labour, Vendors, Subcontractors, Machinery & Vehicles, Inventory, Expenses, Materials, Daily Activity, RMC) | Stacks full-width, single column below the mobile breakpoint; wraps inline (existing `flex flex-wrap` behavior) at `sm` and above. One shared rule — a plain `flex flex-wrap` group with no full-width-stack step reads as a defect on mobile, not an acceptable variant. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading | Any data-bearing screen | Skeleton rows matching the eventual layout — never a bare spinner replacing the whole screen (AD-6). |
| Empty | Any list (e.g. zero Sites, zero Purchases) | Explicit empty-state illustration/icon + one sentence + a single primary action. Never a blank table with just headers. |
| Success | Form submission, Correction filed | Inline confirmation, return to the list/detail the user came from — never a modal "Success!" dialog for routine actions. |
| Validation failure | Any form | Inline, per-field, next to the offending input — mirrors the shared Zod schema from `packages/shared` (AD-7), so client and server never disagree about what's valid. |
| Offline / pending sync | Mobile DSR entry | Local write always succeeds from the user's point of view; "will sync when back online" is a promise the UI keeps visible until it's true. |
| No permission | Any screen a Supervisor shouldn't reach | Surface hidden from navigation entirely — not a visible-but-blocked screen. |
| Network/API failure | Any screen | Plain-language retry affordance; never a raw HTTP status or stack trace surfaced to the user. |
| Missing today's report | Dashboard, Daily Activity log | An explicit gap-flag row naming the Site — never a silent absence in a list that could be mistaken for "nothing happened." |
| Low stock | Inventory | Gap-flag naming the exact Material and threshold, with a direct action (Transfer Stock) — not just a red badge with no next step. |

## Interaction Primitives

**Click/tap-first**, not keyboard-first — this audience is not power users, and the Supervisor persona is single-thumb-on-a-phone. The Search / Action palette (`⌘K` on desktop, a tap target on Owner mobile — see Component Patterns above) is the one exception, and it stays an optional accelerator, never a requirement: every flow it can reach is also reachable by ordinary click/tap navigation. No other keyboard-shortcut layer exists.

- Tap/click anywhere on a linked table row opens its detail — the whole row is the target, not just a small icon, since field users on a moving jobsite need a forgiving hit target.
- Every destructive-feeling action (adjusting an Advance, filing a Correction) requires a short reason field, not a confirmation dialog — the record of *why* is more valuable than a friction gate that changes nothing.
- Defaults do the work: DSR crew checklist defaults from yesterday's attendance; material pickers are search/dropdown, never free-text — every design choice here optimizes for the <5-minute DSR completion target (SM-2) without sacrificing accuracy (SM-C1: never trade speed for correctness).
- Hover is a desktop-only enhancement (card lift, row highlight) — nothing on mobile depends on hover to be discoverable.

**Banned everywhere**: infinite scroll (pagination instead), any Edit/Delete affordance on transaction history, a manual "Send Report" action (delivery is fully automatic per AD-13 — the UI only ever shows delivery status), decorative/celebratory animation (no confetti, no streak badges — this is an operational tool, not a habit app).

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md` (all token pairs AA-checked at authoring time).

- WCAG 2.2 AA across every surface, enforced by CI once `apps/web` is scaffolded (Lighthouse Accessibility >95, `eslint-plugin-jsx-a11y`) — architecture AD-15.
- No information conveyed by color alone: every status badge pairs color with an icon and/or text label (e.g. "Synced" is never just a green dot).
- Touch targets sized for a construction site, not an office desk — full-row tap targets on mobile, generous button padding throughout.
- Visible focus states on every interactive element, using the `accent-teal-100` focus ring token — never suppressed.
- Semantic HTML and proper form labels throughout; validation errors are programmatically associated with their field, not just visually adjacent.
- Outdoor glare readability is a real constraint for the Supervisor persona (not explicitly speced but a genuine field condition) — this is why the mobile DSR flow avoids low-contrast gray-on-white text and relies on strong ink/surface contrast rather than subtle tonal differences.

## Responsive & Platform

| Breakpoint / context | Behavior |
|---|---|
| Desktop / laptop (Owner/Admin) | Full sidebar + main content, `max-width: 1240px`. This is where the richer dashboards, tables, and detail screens live. |
| Mobile (Site Supervisor) | No sidebar. Minimal top bar (Site name + date). Single-column, full-width fields, camera-native photo capture. Device-frame convention in mockups is illustrative only — production renders as a normal responsive page, not a literal phone-shaped frame. |
| Tablet | Inherits desktop layout with sidebar collapsing behavior to be defined at implementation (not yet decided — flag as an open item if a tablet-specific breakpoint proves necessary once `apps/web` exists). |
| Owner on mobile | Reads the same desktop-oriented screens in a responsive single-column fallback — wide lists stack to cards via `mobileCard` (never horizontal-scroll-only), action-button groups stack full-width — plus the persistent Owner mobile quick-bar for fast access. The Owner is not forced into the Supervisor's DSR-only flow just because they're on a phone. |
| Help & Guides on mobile | Must work especially well here — Supervisors are mobile-primary and this is the surface a Supervisor learns from unsupervised. Single-column guide steps, screenshots scaled to fit width without horizontal scroll, the contextual-help popover sized for a thumb tap and positioned to never get clipped off-screen. |
| Client Presentation | Desktop / laptop / tablet only (a sales-demo artifact, presented to a client, not a field tool) — no mobile-specific layout required, but must not visually break on a tablet if opened there. |

## Inspiration & Anti-patterns

- **Lifted from premium fintech/BI products (Mercury, Ramp-adjacent):** tonal "paper vs. ink" surface depth instead of stark white, gold reserved strictly for money, refined tabular numerals throughout.
- **Rejected — literal construction costume design:** no hard-hat icons, no crane silhouettes, no yellow/black hazard striping, no blueprint-grid backgrounds. The product earns "construction-appropriate" through content and vocabulary (Godown, RMC, Site) — not visual cliché.
- **Rejected — enterprise ERP patterns:** no multi-step approval wizards, no dense 40-field forms, no nested modal-on-modal flows. The brief is explicit that this product sits below Procore/HCSS in complexity.
- **Rejected — gamification:** no streaks, no badges, no "🎉" toasts for routine actions like submitting a DSR. Compliance is instrumented via visibility (the Dashboard's gap-flag), not manufactured motivation.
- **Rejected — silent data absence:** every "nothing here" state (no DSR today, zero Sites, empty inventory) is an explicit, named state — never a blank list a user could mistake for "nothing happened" instead of "no data yet."

## Key Flows

### Flow 1 — Ramesh's daily report, from a moving jobsite (Site Supervisor, late afternoon, patchy signal)

1. Ramesh opens the app on his phone at NH-48 Highway Widening — Package 3, already signed in from a prior session.
2. He's dropped straight into the mobile DSR flow, no sidebar, no navigation to hunt through.
3. He fills work completed, leaves the crew checklist mostly as-is (three of four already checked from yesterday, he unchecks the one absent today), taps two material chips already pre-filled (Cement, TMT Steel — he adjusts quantities), logs 12 m³ of RMC, and taps the camera icon twice for site photos.
4. He hits Submit.
5. **Climax:** the screen shows "Saved on device — will sync when back online," in a warning-toned banner he can't miss — not a spinner, not an ambiguous checkmark. He knows the entry is safe even though his signal just dropped. He pockets the phone and goes back to work.
6. Later, back in range, it syncs silently — the next time he opens the app, that day's entry shows the success state instead.

Failure: he tries to submit a second DSR for the same Site/date before the first has synced — the app treats it as an edit to the still-queued entry, not a duplicate, so he never accidentally creates two conflicting reports.

### Flow 2 — Suresh catches a gap before it becomes a problem (Owner/Admin, morning, desktop)

1. Suresh opens the Dashboard on his laptop over coffee.
2. Today's Activity tells the story at a glance: sites active, labour working, materials moving, RMC used — and one gap-flag row: "Riverside Bridge Approach has not submitted a Daily Site Report yet today."
3. He clicks through to Daily Activity, filters isn't necessary — the log already shows Riverside sitting in "Not submitted" state, distinct from the three sites that reported.
4. He also notices, from the same Dashboard, a low-stock flag on Cement (OPC 53 Grade) at the Godown.
5. **Climax:** without leaving the desktop app, he moves — a click through to Inventory, then a Transfer Stock action — resolving the problem in the same session he spotted it in, instead of phoning a supervisor to ask "what's going on."

### Flow 3 — A desk-side correction to a synced report (Owner/Admin, next-day review)

1. Reviewing yesterday's NH-48 report in Daily Activity, Suresh notices the crew count was recorded wrong — Ravi Kumar was actually present, not absent.
2. He clicks **Correct** next to the Synced badge on the report detail.
3. The desktop Daily Activity Entry form opens with the correction banner visible, explaining this creates a new linked entry rather than editing history.
4. He updates the crew field and submits.
5. **Climax:** the original report is untouched — permanent, as it should be — and a new, reason-carrying entry sits linked to it. Anyone auditing later sees exactly what changed, when, and why, without a single row ever having been silently edited (AD-9).

### Flow 4 — Prakash's Advance, settled without friction (Owner/Admin, weekly payment run)

1. Suresh opens Prakash Jadhav's Team Member profile and sees an Outstanding Balance of ₹8,000, sourced from the Advance ledger's running total.
2. He records a ₹2,000 Adjustment against this week's Payment, with a one-line reason.
3. The system won't let the adjustment exceed the current balance — the field itself carries that constraint as helper text, not as a rejected-form surprise after submission.
4. **Climax:** the balance updates to ₹6,000 immediately, timestamped and attributed, with no approval gate and no separate "adjustment request" workflow — matching the brief's explicit "no unnecessary approval chains" principle.

### Flow 5 — Priya learns to record material consumption, alone, on her first day (Site Supervisor, first week, mobile)

1. Priya's Owner told her to "record when material gets used," but nobody sat down to train her.
2. She taps the ⓘ next to "Material Consumption" the first time she sees the field — a short popover explains it in one plain sentence, right where she's stuck, no navigation away from the DSR she was filling in.
3. She still wants a fuller walkthrough, so she opens Help & Guides from the bottom of the sidebar and searches "how do I record material used."
4. The guide shows five numbered steps with real screenshots — open Inventory, pick the Site, pick the Material, enter the quantity, save — each with the exact field or button highlighted, not a wall of text.
5. The last step is a working "Try it yourself" link that drops her straight onto the real Consumption page, already knowing what she's looking at.
6. **Climax:** she completes the entry correctly on her own, and the guide's last line — "the site's stock automatically goes down" — matches exactly what she sees happen. Nobody had to sit beside her.

### Flow 6 — Suresh engages a subcontractor for a stretch of pipe laying (Owner/Admin, desktop, new engagement)

1. Suresh opens Riverside Residency — Phase 2's Site detail page and scrolls to the new "Subcontractors" section — empty so far for this Site.
2. He clicks **Add Subcontractor**, picks Ganesh Pipeline Works from the Subcontractor picker (already in his list from a prior job), and describes the work: storm-water pipe laying, 300mm RCC pipe, north boundary drain.
3. He doesn't yet know the exact per-pipe rate — negotiation is still underway — so he picks **Per Pipe** as the rate type, leaves the rate blank, and saves. The form doesn't fight him on this: Status defaults to **Draft**, and Draft explicitly allows incomplete terms.
4. Two days later, rate agreed at ₹250/pipe, he opens the Site Contract and fills it in, then tries to switch Status to **Active**.
5. **Climax:** the save succeeds without drama — every field Active requires (work category, rate, start date) is already there — and the contract is now live. If he'd tried to activate it while the rate was still blank, the form would have told him exactly which field was missing, inline, before he could get confused later wondering why Ganesh's crew wasn't showing up as billable.
6. Over the following weeks, the Site Supervisor logs pipe counts against this contract from the Site Contract detail page (a two-field form: quantity, date) with zero visibility into the commercial terms — Suresh handles payments separately, watching the Outstanding figure tick down as he pays.

### Flow 7 — Suresh clears his Monday-morning backlog from his phone, between site visits (Owner/Admin, mobile, a week he didn't open the app for three days)

1. Suresh hasn't opened AzentisFieldOS since Thursday. On his phone between site visits, he taps the app and lands on the Dashboard — a "3 purchases pending pricing" gap-flag and a ₹14,200 Outstanding Advances figure are both visible without scrolling.
2. He taps "Review & Price" — since there's more than one pending purchase, it opens Movements already filtered to the "Pricing pending" tab, not the full unfiltered log he'd have had to scan a week ago.
3. He prices the first one, taps back, prices the second — each one a couple of fields, no re-navigation through the sidebar between them.
4. Prakash Jadhav texted him for an advance. Suresh taps the center "+" in the mobile quick-bar, picks "Record Advance" from the Quick Add sheet, searches "pra," and Prakash's name is the top match — he fills the amount and reason and saves without leaving the Dashboard.
5. **Climax:** he taps Search, types "vendor," and "Add Vendor" surfaces above the (empty) entity results — he didn't have to remember which of the five nav groups Vendors lives under. He adds a new supplier a colleague just recommended, in the time it took him to walk from his car to the site gate.
6. He closes the app having resolved everything that had piled up, without ever using the full sidebar — the quick-bar, the palette, and the Dashboard's own action row carried the whole session.
