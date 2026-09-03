---
name: AzentisFieldOS
description: Premium construction-contractor operations SaaS for Indian civil contractors. From-scratch design system realized as Tailwind v4 `@theme` tokens in `packages/ui` (architecture AD-4/AD-5) — this file is the single source of truth those tokens are generated from.
status: final
updated: 2026-09-03
colors:
  surface-0: '#FBFAF7'
  surface-1: '#FFFFFF'
  surface-2: '#F3F1EA'
  surface-3: '#EAE6DA'
  border-hairline: '#E4E0D3'
  border-strong: '#D2CBB8'
  ink-900: '#1B2430'
  ink-700: '#3E4757'
  ink-500: '#6B7280'
  ink-on-accent: '#F7F5EE'
  accent-teal-900: '#0B3B3E'
  accent-teal-700: '#0F5257'
  accent-teal-600: '#14666C'
  accent-teal-100: '#E4EFEE'
  accent-navy-800: '#16273E'
  accent-navy-600: '#223A5E'
  gold-700: '#96700F'
  gold-500: '#C7912B'
  gold-100: '#FBF0DA'
  success-700: '#1E6B45'
  success-100: '#E4F3EA'
  danger-700: '#A32E2E'
  danger-100: '#FBE7E5'
  warning-700: '#8A5A12'
  warning-100: '#FBF0DA'
  surface-0-dark: '#12161C'
  surface-1-dark: '#191F27'
  surface-2-dark: '#212933'
  surface-3-dark: '#2A3340'
  border-hairline-dark: '#313B48'
  border-strong-dark: '#414E5E'
  ink-900-dark: '#F1EEE4'
  ink-700-dark: '#C7CCD6'
  ink-500-dark: '#8D95A3'
  ink-on-accent-dark: '#12161C'
  accent-teal-700-dark: '#4FB8AE'
  accent-teal-600-dark: '#6BCFC5'
  accent-teal-100-dark: '#1B3B3A'
  gold-700-dark: '#E3B24B'
  gold-500-dark: '#E3B24B'
  gold-100-dark: '#2E2413'
  success-700-dark: '#5FCF93'
  success-100-dark: '#163527'
  danger-700-dark: '#F0847E'
  danger-100-dark: '#3A1E1E'
  warning-700-dark: '#E3B24B'
  warning-100-dark: '#2E2413'
typography:
  eyebrow:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontSize: 12.5px
    fontWeight: '500'
    lineHeight: '1.45'
  body-sm:
    fontSize: 13.5px
    fontWeight: '400'
    lineHeight: '1.5'
  body:
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.55'
  card-title:
    fontSize: 17px
    fontWeight: '650'
    lineHeight: '1.4'
  section-header:
    fontSize: 21px
    fontWeight: '650'
    lineHeight: '1.3'
    letterSpacing: -0.005em
  page-title:
    fontSize: 28px
    fontWeight: '650'
    lineHeight: '1.2'
    letterSpacing: -0.015em
  kpi-numeral:
    fontSize: 38px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
components:
  button-primary:
    background: '{colors.accent-teal-700}'
    foreground: '#FFFFFF'
    radius: '{rounded.md}'
    hover-background: '{colors.accent-teal-600}'
  button-secondary:
    background: '{colors.surface-1}'
    foreground: '{colors.ink-900}'
    border: '{colors.border-strong}'
    radius: '{rounded.md}'
  button-ghost:
    background: transparent
    foreground: '{colors.ink-700}'
    radius: '{rounded.md}'
  card:
    background: '{colors.surface-1}'
    border: '{colors.border-hairline}'
    radius: '{rounded.lg}'
    elevation: shadow-2
    hover-elevation: shadow-2-hover
  stat-tile:
    background: '{colors.surface-1}'
    border: '{colors.border-hairline}'
    radius: '{rounded.lg}'
    elevation: shadow-1
    hover-elevation: shadow-2
  table-row:
    zebra-background: '{colors.surface-2}'
    hover-background: '{colors.accent-teal-100}'
    border: '{colors.border-hairline}'
  badge-success:
    background: '{colors.success-100}'
    foreground: '{colors.success-700}'
    radius: '{rounded.full}'
  badge-warning:
    background: '{colors.warning-100}'
    foreground: '{colors.warning-700}'
    radius: '{rounded.full}'
  badge-danger:
    background: '{colors.danger-100}'
    foreground: '{colors.danger-700}'
    radius: '{rounded.full}'
  badge-gold:
    background: '{colors.gold-100}'
    foreground: '{colors.gold-700}'
    radius: '{rounded.full}'
  money-text:
    foreground: '{colors.gold-700}'
    numeric: tabular-nums
    weight: '600'
  nav-link-active:
    background: '{colors.accent-teal-700}'
    foreground: '#FFFFFF'
    radius: '{rounded.md}'
  sidebar:
    background: '{colors.accent-navy-800}'
    foreground: '{colors.ink-on-accent}'
  gap-flag:
    background: '{colors.warning-100}'
    foreground: '{colors.warning-700}'
    border: '#E8CC8F'
    radius: '{rounded.md}'
  help-bubble:
    icon-foreground: '{colors.ink-500}'
    icon-hover-foreground: '{colors.accent-teal-700}'
    popover-background: '{colors.surface-1}'
    popover-border: '{colors.border-hairline}'
    popover-radius: '{rounded.md}'
    popover-elevation: shadow-2
  guide-step:
    number-background: '{colors.accent-teal-700}'
    number-foreground: '#FFFFFF'
    number-radius: '{rounded.full}'
    card-background: '{colors.surface-1}'
    card-border: '{colors.border-hairline}'
    card-radius: '{rounded.lg}'
    card-elevation: shadow-1
    connector-color: '{colors.border-strong}'
---

## Brand & Style

AzentisFieldOS is a **Construction Contractor Operating System** for small and mid-size Indian civil contractors — a white-label, deploy-per-tenant product resold under each contractor's own brand. The audience is not tech-sophisticated office workers: the Owner/Admin runs the business, and the Site Supervisor works a phone with one hand at a construction site with patchy signal. The design has to earn trust with people who will judge it by whether it wastes their time.

The aesthetic posture is **Premium Executive Dashboard**: fintech/BI-grade polish (closer to Mercury or Ramp than to a generic admin template), built to make the Owner feel like they are piloting the business, not scrolling a spreadsheet. Surfaces lean warm rather than clinical — "premium paper vs. premium ink" tonal depth instead of stark white-on-white or full dark-mode-by-default. Every visual decision has a job: elevation signals hierarchy, color signals meaning (never decoration), and icons exist to speed recognition, not to fill space.

This was chosen after three fully-realized directions were rendered side by side across the same seven representative screens and compared directly: [Direction A — Premium Minimal SaaS](mockups/directions/direction-a-premium-minimal.html), [Direction B — Modern Industrial](mockups/directions/direction-b-modern-industrial.html), [Direction C — Premium Executive Dashboard](mockups/directions/direction-c-premium-executive.html) (winner). It was then further refined per direct feedback — see Elevation & Depth and Components below for what changed from the original exploration pass.

Explicitly rejected: generic AI-dashboard tropes (purple gradients, glassmorphism, floating blur cards), literal construction-site costume design (hard hats, cranes, hazard stripes, blueprint textures), and enterprise-ERP density (wizards, nested approval chains, forms with 40 fields). The founder's mandate (architecture AD-4) rules out anything that reads as a copied SaaS template.

## Colors

The palette is warm-neutral surfaces plus three meaning-locked accents. No color is decorative — each one answers "what does this tell the user."

- **Surfaces** (`surface-0` → `surface-3`, `#FBFAF7` → `#EAE6DA`) — a warm off-white canvas (`surface-0`), never pure white or pure black. `surface-1` is card/panel white; `surface-2` is the sunken tone for table stripes and input fills; `surface-3` is the deepest sunken tone for chips and active tab tracks.
- **Ink** (`ink-900`/`ink-700`/`ink-500`) — deep navy-black (not pure `#000`) at three weights: primary text, secondary text, and tertiary/meta text. All three are AA-checked against `surface-0` and `surface-1`.
- **Accent Teal** (`accent-teal-700` primary, `600` hover, `100` tint) — the one operational-action color: primary buttons, active nav state, focus rings, row-hover highlight, links. This is the color of *doing something*.
- **Accent Navy** (`accent-navy-800`) — the sidebar's own surface color, distinct from the teal action color so navigation chrome never competes with in-page actions.
- **Gold** (`gold-700`/`500`/`100`) — reserved **strictly** for money: Outstanding Balance, Advance, Payment, Expense totals, KPI currency figures. Never used for anything else, so the eye learns "gold = money" everywhere in the product without exception.
- **Success / Warning / Danger** — synced/on-time, pending-sync/attention, and flagged/overdue respectively. Warning and danger are visually distinct from each other (amber vs. red) since "awaiting sync" and "stock is critically low" are not the same severity and must never be confused.

Dark mode uses parallel `-dark` tokens (see frontmatter) rather than a separate file — the semantic names stay identical, only the values invert, so a component never needs mode-aware logic beyond swapping the token set.

**Never**: introduce a fourth accent color, use gold for anything but money, use danger/warning interchangeably, or use raw hex values in component code instead of these tokens (AD-4).

## Typography

System font stack throughout (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) — no webfont loading, which keeps the product light on the 2G/3G connections Site Supervisors actually have (NFR-2). One typeface, one voice; hierarchy comes from size, weight, and color, not font-switching.

All currency, quantity, and count figures use `font-variant-numeric: tabular-nums lining-nums` — this is non-negotiable given how much of the product is numbers a user needs to scan and compare at a glance (stock quantities, Advance balances, Net Payable).

The scale runs from `eyebrow` (11px, uppercase, tracked out — table headers, badge micro-labels) up through `kpi-numeral` (38px, 700 weight, tabular — dashboard headline figures). `page-title` (28px/650) opens every screen; `section-header` (21px/650) divides content within a screen; `card-title` (17px/650) labels a card or stat tile. Body text sits at 15px with 1.55 line-height for comfortable scanning of dense operational data.

## Layout & Spacing

4px base spacing scale (`spacing.1` = 4px through `spacing.16` = 64px) — every gap, padding, and margin in the product traces to this scale, no arbitrary pixel values.

Desktop is a fixed 248px sidebar + fluid main content area, main content capped at 1240px max-width so dense tables don't stretch into unreadable line lengths on wide monitors. Content padding is generous (`spacing.8` vertical, `spacing.10` horizontal) — this is a premium tool, not a cramped spreadsheet, even though it carries a lot of operational data.

Mobile (Site Supervisor context) drops the sidebar entirely in favor of a minimal top bar (site name + date) and full-width single-column stacking — see Responsive & Platform in `EXPERIENCE.md`.

## Elevation & Depth

Soft, layered shadows — **never** glassmorphism, never blur-behind. Three levels:

- `shadow-1` (`0 1px 2px rgba(27,36,48,.06), 0 1px 1px rgba(27,36,48,.04)`) — resting state for stat tiles, flat info cards.
- `shadow-2` (`0 4px 12px rgba(27,36,48,.08), 0 2px 4px rgba(27,36,48,.04)`) — resting state for primary cards and table containers; this is the *default* elevation for anything that holds real content, not `shadow-1`.
- `shadow-3` (`0 12px 32px rgba(27,36,48,.14), 0 4px 8px rgba(27,36,48,.06)`) — device frames, modals.
- `shadow-2-hover` — a visibly deeper lift (`0 8px 20px rgba(27,36,48,.12), 0 3px 6px rgba(27,36,48,.06)`) paired with `translateY(-2px)` on interactive cards.

This is a deliberate escalation from the first Direction C exploration pass, which read as too flat. The rule going forward: **any card or tile that represents drill-down data must carry visible elevation at rest**, not just on hover — elevation is how the product signals "this is a distinct, actionable object," not a decorative afterthought. Dark mode shadows use pure black at higher opacity (`rgba(0,0,0,.4–.5)`) since colored shadows disappear against dark surfaces.

## Shapes

Rounded but not soft — `rounded.sm` (6px) for chips and small controls, `rounded.md` (10px) for buttons and inputs, `rounded.lg` (14px) for cards and table containers, `rounded.xl` (20px) for device-frame corner echoes and modals, `rounded.full` (9999px) for pills, badges, and avatars. This reads as considered and professional rather than either sharp/industrial or soft/consumer.

## Components

- **Buttons** — three variants (primary/secondary/ghost), always icon + label for primary and secondary actions (no icon-only buttons except dense inline row actions like "Correct"). Hover state: background shift + `shadow-2` + `translateY(-1px)`, ≤160ms, no bounce.
- **Cards** — `shadow-2` at rest (not `shadow-1` — see Elevation & Depth above). `.card.interactive` lifts to `shadow-2-hover` + `translateY(-2px)` on hover for drill-down cards (e.g., dashboard site cards).
- **Stat tiles** — icon in a tinted circle (`teal`/`gold`/`success`/`danger` background per meaning) above a `kpi-numeral` value and a `caption` label. `shadow-1` at rest, `shadow-2` on hover.
- **Tables** — zebra-striped (`surface-2` on even rows) **and** hover-highlighted (`accent-teal-100` on row hover), ≤110ms transition. Row actions are icon-only and right-aligned. Money columns are right-aligned with `.num` + `.money` + `.tabular`.
- **Badges** — pill-shaped, semantic color only (success/warning/danger/gold/neutral), always paired with a tiny icon where the meaning benefits from one (e.g., a check-circle on "Synced").
- **The Correct action** — the one universal pattern for every historical transaction row (Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment, Work Record, and — per Owner decision — Daily Site Report once synced). Rendered as an icon-only ghost button (rotate-ccw icon) that opens a new entry requiring a reason, linked to the original. **Never** an Edit or Delete affordance on these rows (AD-9). Config/master data (Vendor contact info, Material catalog entries, category lists) is the deliberate exception — those use a normal Edit affordance since they aren't transaction history.
- **Sidebar navigation** — fixed, `accent-navy-800` background (distinct from the teal action color), icon + label per item, grouped under uppercase eyebrow labels (Materials / People / Assets / Insights). Active state is a solid `accent-teal-700` pill, not just a color change, so the current section is unambiguous at a glance.
- **Icon system** — a single inline-SVG line-icon set, 24×24 viewbox, 1.75 stroke-width, round caps/joins, `stroke="currentColor"` throughout so every icon inherits its container's color automatically. No icon font, no external CDN — every icon ships inline in each screen for the offline-first, low-bandwidth reality of this product.
- **Device frame** — for mobile (Site Supervisor) screens only: a dark bezel (`shadow-3`) framing a `rounded.xl` screen area, used to make unambiguous in reviews which screens are the phone experience vs. the desktop experience.
- **Gap flag** — a warning-toned inline banner (icon + message + primary action) for anything that needs attention without being an error — e.g., "Site X has not submitted a report yet today." Distinct from a badge (which labels a single row) and distinct from an error state (which means something failed).
- **Help bubble** — a small `ⓘ` ghost icon-button (`ink-500`, hovers to `accent-teal-700` — same interaction language as every other icon affordance) that opens a short anchored popover (`surface-1`, `shadow-2`, `rounded.md`) with 2–3 sentences of plain-language explanation. Never a full-screen takeover; never navigates the user away from what they were doing.
- **Guide step** — a numbered explanation card for Help & Guides: a filled `accent-teal-700` circle holding the step number, a `card-title` instruction line, an optional annotated screenshot, and a thin `border-strong` connector line to the next step. `shadow-1` at rest (this is explanatory content, not drill-down data, so it sits one elevation below a primary Card).
- **Search / Action palette** — a centered modal (`shadow-3` + `border-hairline`, `rounded.lg`, max-width ~560px) over a dimmed scrim. The hairline border is load-bearing here, not decorative: a dark shadow loses contrast against the scrim's own dark dimming, so the border is what actually reads as "this card is separate from the page" — same reasoning as Card/DataTable's `border + shadow-2` combination, just at `shadow-3` since this floats above the scrim rather than sitting flat on the page. Search-input row up top, placeholder names the real category list ("Search sites, materials, vendors, team, payments…") rather than a generic or stale hint; results grouped by uppercase eyebrow labels (Actions / Sites / Materials / …). Entity-group rows carry a tinted icon tile (`accent-teal-100` background, `accent-teal-700` icon — the existing "info/navigation" tint); Action-group rows carry a **solid** `accent-teal-700` tile with a white icon — same hue, filled instead of tinted, so "this does something" reads distinctly from "this opens a record" without introducing a new color. Never gold here — gold stays reserved for money figures even though these are "primary" actions.
- **Quick-entry modal** (e.g. Record Advance) — same modal chrome as the Search palette (`shadow-3`, `rounded.lg`), sized narrower (~420px) for a short form. Cancel/primary-submit pair bottom-right, same as every other form footer in the product.
- **Owner mobile quick-bar** — fixed bottom bar, same chrome as the existing Supervisor bottom quick-bar (icon + micro-label per item, active state = color + weight + `aria-current`, never color alone). Its center item is a raised circular FAB (`accent-teal-700` fill, white icon, `shadow-2`, sits ~14px above the bar) rather than a fifth flat tab — visually marks it as the one item that opens an action sheet instead of navigating.
- **Recently-viewed chip** — a pill (`rounded.full`, `surface-1` background, `shadow-1`, `border-hairline`) in a horizontally-scrolling row: a small tinted icon circle (`accent-teal-100`/`accent-teal-700`, same family as entity search rows) plus a label and a muted `ink-500` type suffix (e.g. "· Site").

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use gold exclusively for money figures | Use gold as a decorative accent or for non-financial emphasis |
| Give every card/table visible `shadow-2` elevation at rest | Ship flat, hairline-only panels (the pre-feedback Direction C mistake) |
| Zebra-stripe **and** hover-highlight every data table | Rely on hover alone, or zebra alone, for row scannability |
| Pair every primary/secondary button with an icon | Ship icon-only buttons for primary actions |
| Use "Correct" (new reason-carrying entry) on any transaction-history row | Show Edit/Delete on Purchase, Movement, Consumption, Advance, Payment, Work Record, or synced DSR rows |
| Keep hover/transition motion ≤160ms, subtle | Add bounce, spring, or decorative animation |
| Load fonts from the system stack only | Load a webfont (breaks the 2G/3G budget for field users) |
| Design every table for loading / data / empty / error states (AD-6) | Ship a table that only handles the happy path |
| Write Help & Guides / Client Presentation copy in plain, concrete language (see `EXPERIENCE.md` Voice and Tone addendum) | Reuse the operational app's terse factual tone for content aimed at a first-time, non-technical reader |
| Label anything unbuilt as **Coming Soon** or **Recommended Future Improvements** | Present a planned or ideal feature as if it exists today |
