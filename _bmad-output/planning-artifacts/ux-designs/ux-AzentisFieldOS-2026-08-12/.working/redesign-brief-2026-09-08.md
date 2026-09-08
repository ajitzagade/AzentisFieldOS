# Owner Dashboard redesign brief — 2026-09-08 (Update run)

Ajit's complaint about the live Owner Dashboard: **visually flat** (uniform white tiles, no
depth or hierarchy, "fresher-created" look) and **information-poor** (raw counts with no
trend, no per-site breakdown, no prioritization of what needs him). Redesign for the
OWNER_ADMIN usability case. Mockups first; spine updates follow the picked direction.

## Non-negotiables (from EXPERIENCE.md / DESIGN.md — spines win on conflict)

- User-facing name is **"Daily Report"** — never "DSR" / "Daily Activity" in copy.
- Quick-actions bar stays: **New Daily Report** (hero primary) + Employee Payment,
  Record Advance, Add Purchase (secondary) + Search chip with `⌘K` hint.
- Recently-viewed shortcuts row (device-local jump chips) stays present.
- Gap flags are inline, warning-toned, each individually actionable — never an "alerts
  screen". At 3+ missing-report flags they fold behind a defaults-open summary.
- D7: unpriced inward entries are **excluded from money figures** — always a pending
  *count*, never ₹0. A failed money read renders an honest **"—"** with "Couldn't load
  right now", never NaN/zero.
- ₹ figures use en-IN lakh grouping (₹4,82,300). Money text: gold-700, tabular-nums, 600.
- Brand: warm paper surfaces, teal primary, gold money accent, navy support
  (all tokens in DESIGN.md frontmatter). Direction may EXTEND depth/composition
  (shadows, tinted bands, gradients within the brand family) — extensions must be
  documented in a `<style>` comment block for later token promotion.
- WCAG AA. Desktop-first (Owner surface, max-width ~1240–1320px content).

## Validated chart palette (dataviz six-checks, light surface #FBFAF7/#FFFFFF)

- categorical order: teal `#00968A` → gold `#C08420` → blue `#4A72B8` (fixed, never cycled)
- Chart rules: thin marks; 2px surface gaps between stacked segments/adjacent bars;
  rounded data-ends 4px; single-series sparklines get NO legend; direct labels selective;
  text always in ink tokens, never series color; recessive hairline grid; one axis only;
  status colors (success/warning/danger tokens) reserved for state, never series identity.

## Shared dataset — IDENTICAL in all three directions (Monday, 8 September 2026)

Sites (4 + Godown):
- Sunrise Heights — Phase 2, Baner · Active · report submitted 9:42 AM
- Kharadi Warehouse, Kharadi · Active · report submitted 10:15 AM
- Riverside Villas, Wagholi · Active · **no Daily Report yet today** (gap flag)
- MIDC Factory Shed, Bhosari · On Hold

Today: 3 sites reporting · 42 labour working · 5 materials received · 8 materials
consumed · 14 m³ RMC used · 6 machinery in use · ₹18,450 expenses today.

Attention items (exactly these, ranked): 
1. Riverside Villas has not submitted a Daily Report yet today → "View Site"
2. 3 inward entries waiting for pricing → "Add Pricing"
3. 1 Site Contract still Draft, missing commercial terms → "Review Subcontractors"

Money: Expenses this month ₹4,82,300 (₹96,150 this week — largest: Diesel & Fuel) ·
Vendor Outstanding ₹6,45,000 · Outstanding to Subcontractors ₹2,10,000 · Outstanding
Advances ₹14,200 across 5 Team Members · Pending Payments 4 · 
**Cash Tied Up ₹8,69,200** = vendor dues + advances + subcontractor payables.

Inventory: 3 materials low — Cement OPC 53 Grade (12 bags left), TMT Steel 12mm
(0.4 T), River Sand (2 brass).

Trends (for sparklines/charts, last 7 days Mon→Sun→today where used):
- Labour: 38, 41, 35, 44, 40, 12, 42
- Daily expenses ₹: 21k, 15k, 32k, 12k, 24k, 8k, 18.45k
- Sites reporting: 4, 4, 3, 4, 4, 2, 3

Recently viewed chips: Prakash Jadhav (Team) · Cement OPC 53 (Material) ·
Sunrise Heights — Phase 2 (Site) · Sagar Traders (Vendor).

One degraded-state variant must be visible somewhere: the Vendor Outstanding card
in its "—  / Couldn't load right now" state, rendered small as a state-variant inset
(annotated), not as the main figure.

## Directions

A `direction-dash-a-command-center.html` — **Command Center**: operational cockpit.
Deep navy (#16273E) hero band holding date, quick actions, and today's pulse KPIs w/
sparklines in light-on-dark; below, "Needs your attention" ranked queue + a per-site
operations table (report status, labour, received/consumed, expenses today) + money
strip. Dense, tabular, everything scannable without scrolling.

B `direction-dash-b-morning-briefing.html` — **Morning Briefing**: calm chief-of-staff.
Warm editorial hierarchy, greeting + date, hero is a numbered "3 things need you"
priority stack with one action each; then Today KPI band with vs-yesterday delta chips;
money story with a 7-day spend chart; site health cards. Generous whitespace, depth via
soft layered shadows and a warm tinted page wash, not darkness.

C `direction-dash-c-executive-ledger.html` — **Executive Ledger**: money-first gravitas.
Hero: Cash Tied Up ₹8,69,200 with a horizontal stacked composition bar (validated
palette, 2px gaps, direct labels); 7-day expense bar chart; KPI strip with week deltas;
sites as compact health rows; refined gold hairlines, premium ledger register.
