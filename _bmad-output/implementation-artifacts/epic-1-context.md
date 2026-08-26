# Epic 1 Context: Platform Foundation, Auth & Design System

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Stand up the running, correctly-branded application shell that every later epic builds on without re-deriving visual or interaction rules. By the end, Owner/Admin and Site Supervisor can sign in; the full design-token system (light + dark), the core reusable component library, the inline icon set, and the grouped sidebar/mobile-topbar navigation all render exactly per the finalized design and experience specs; and CI enforces the accessibility and performance budgets that later work must not regress. This epic covers no user-facing feature FRs directly — it is pure foundation, plus API session auth and an installable PWA shell to make the field surface real.

## Stories

- Story 1.1: Design token foundation
- Story 1.2: Core components — Button, Card, Badge
- Story 1.3: Core components — Data Table, Stat Tile, Gap Flag, Correct action
- Story 1.4: Inline SVG icon system
- Story 1.5: Sign-in
- Story 1.6: Application shell & navigation
- Story 1.7: Accessibility & performance CI gate
- Story 1.8: API session authentication
- Story 1.9: Installable PWA

## Requirements & Constraints

- Responsive web only, no native app; the same app serves a desktop-primary Owner/Admin surface and a mobile-primary Site Supervisor surface.
- WCAG 2.2 AA and Lighthouse >95 (Performance/Accessibility/Best-Practices/SEO) are hard, CI-enforced gates — never discretionary, never regressible.
- Every data-bearing component must render its full state set (loading skeleton matching final layout, empty with icon + one sentence + one primary action, success as inline confirmation returning to origin, per-field inline validation failure, offline/pending-sync, no-permission hidden-from-nav, plain-language network/API failure) — no happy-path-only screens.
- No status conveyed by color alone: every badge/indicator pairs color with an icon and/or text.
- Two roles only (Owner/Admin, Site Supervisor); the UI never blurs them and never exposes a tenant switcher, "current tenant" concept, or any cross-tenant/Platform-Operator surface.
- Auth is delegated to Clerk — no hand-rolled password/session/MFA code. In-app `User.role` lives in Postgres and is read per request to authorize; Clerk owns identity, the schema owns role.
- Interaction bans to bake in at the component level: no infinite scroll (paginate), no Edit/Delete affordance on transaction-history rows, no manual "Send Report" action, no decorative/celebratory animation, no keyboard-shortcut layer (click/tap-first).

## Technical Decisions

- Monorepo per the architecture spine's Structural Seed with pinned stack versions: Next.js 16.3 App Router (`apps/web`), NestJS 11 (`apps/api`), `packages/ui`/`shared`/`config`, `infra/`. Scaffold already partially exists — treat as "finish and bring into spec," not build-from-zero.
- Single design-token source: all tokens live as a Tailwind v4 CSS-first `@theme` block in `packages/ui` (no JS Tailwind config). Component code references tokens only — never raw hex/px/rgba literals. Semantic token names stay identical between light and dark; only values swap via parallel `-dark` tokens, so components need no mode-aware logic.
- One implementation per UI primitive in `packages/ui` (shadcn pattern, Base UI primitives underneath — not Radix). New variants extend the shared component's prop API; never re-implement per screen.
- The "Correct" action is a single shared component (icon-only ghost, rotate-ccw, opens a reason-carrying linked entry) reused across every transaction-history row in later epics — it is the UI-layer enforcement of the append-only invariant. Config/master data uses a normal Edit affordance instead; the two patterns must never be visually confused.
- Validation schemas are defined once as Zod schemas in `packages/shared`, imported by both `apps/api` (source of truth) and `apps/web` — inline field errors mirror them so client and server never disagree.
- `apps/web` never imports a DB client; all writes go through `apps/api` over HTTP. API emits one error envelope `{ error: { code, message, details? } }` via a global exception filter. Config comes from env vars validated at boot against a Zod schema (fail loud, never silent-default).
- Icon system is a shared inline-SVG line set (24×24 viewbox, 1.75 stroke, round caps/joins, `stroke="currentColor"`) — no icon font, no external CDN, to hold the offline/low-bandwidth budget. System font stack only; no webfonts. All numeric figures use tabular lining numerals.

## UX & Interaction Patterns

- Design posture: "Premium Executive Dashboard" — warm paper-vs-ink surfaces (never stark white/black), soft layered shadows (never glassmorphism/blur), elevation signals hierarchy, color signals meaning. Any card/tile that represents drill-down data carries visible `shadow-2` elevation at rest; interactive cards lift with `translateY(-2px)` on hover, motion ≤160ms, no bounce.
- Color meaning is locked: teal = the one operational-action color (primary buttons, active nav, focus ring, row-hover, links); navy = sidebar chrome only (distinct from teal so nav never competes with actions); gold = money exclusively (balances, advances, payments, KPI currency); warning (amber) and danger (red) are never interchangeable. No fourth accent.
- Navigation: fixed 248px navy sidebar, icon+label items grouped under uppercase eyebrows (Dashboard/Sites/Daily Activity ungrouped → Materials → People → Assets → Insights → Settings pinned bottom), solid teal-pill active state, one active item at a time. On the Site Supervisor mobile context the sidebar is dropped entirely for a minimal top bar (Site name + date) with single-column full-width content — this is a role distinction, not a viewport-width breakpoint. Desktop main content caps at 1240px.
- Tables: zebra-stripe AND hover-highlight always; a row is a real wrapped link only when a detail surface exists, otherwise no pointer/no link (never a false-affordance dead end). Row actions are icon-only, right-aligned; money columns right-aligned and tabular.
- Full-row tap targets, visible teal focus rings (never suppressed), generous on-site-sized touch targets, programmatically-associated inline validation errors. Consequential actions (corrections, adjustments) take a short required reason field, not an "Are you sure?" modal.
- Microcopy: plain operational language stating what happened and what to do next; use glossary terms verbatim (Site, Godown, DSR, Advance, Outstanding Balance, Team Member, Correct); no exclamation points, emoji, or gamified language; same tone for both roles.

## Cross-Story Dependencies

- 1.1 (tokens) precedes and underpins every component and screen story.
- 1.2, 1.3, 1.4 (component library + icons) are consumed by 1.5 (sign-in) and 1.6 (app shell), and by all later epics.
- 1.5 (Clerk sign-in in `apps/web`) is the identity front end; 1.8 (per-request Clerk session validation in `apps/api` + Postgres-backed `User.role`) is the backend counterpart later epics depend on for authorization and for replacing the current placeholder "system" user on write paths.
- 1.6 (app shell) needs a real current-user/role fetch to select the Owner sidebar vs. Supervisor top-bar chrome; wire it from 1.8's endpoint rather than branching on viewport.
- 1.7 (CI gate) governs every subsequent PR touching `apps/web`/`packages/ui`/`shared`/`config`; Lighthouse currently covers only the unauthenticated `/sign-in` route pending an e2e auth-seeding mechanism.
