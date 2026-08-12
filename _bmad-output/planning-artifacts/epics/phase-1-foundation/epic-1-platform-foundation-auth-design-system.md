---
epic: 1
phase: "1 — Foundation"
status: partially-started
---

# Epic 1: Platform Foundation, Auth & Design System

## Goal

Owner/Admin and Site Supervisor can sign in to a running, correctly-branded application shell — sidebar navigation, the full design-token system, and the core reusable component library all render exactly per `DESIGN.md`/`EXPERIENCE.md` — ready for every later epic to build on without re-deriving visual or interaction rules.

## FRs Covered

None directly — this epic is the foundation every other epic builds on.

## Related NFRs

- NFR-6: Platform is responsive web only for v1 — no native mobile app.
- NFR-7: WCAG AA accessibility and Lighthouse >95 enforced in CI, not discretionary.

## Related Architecture Requirements

- Monorepo structural seed exactly per the architecture spine's Structural Seed and pinned Stack versions.
- AD-4: Single Tailwind v4 `@theme` token source — no scattered hex/px/rgba literals in component code.
- AD-5: One shadcn-pattern implementation per UI primitive in `packages/ui` — never re-implemented per screen.
- AD-6: Every data-bearing screen's story needs loading/empty/success/error/validation-failure acceptance criteria.
- AD-7: One Zod schema per data shape in `packages/shared`, shared by API and frontend.
- AD-10: Auth via Clerk — no hand-rolled password/session/MFA code.
- AD-15: CI-enforced accessibility/performance budgets (`eslint-plugin-jsx-a11y` + Lighthouse CI).

## Related UX Design Requirements

UX-DR1 (design-token system), UX-DR2 (Button), UX-DR3 (Card), UX-DR4 (Stat Tile), UX-DR5 (Data Table), UX-DR6 (Badge), UX-DR7 (Correct action component), UX-DR8 (Sidebar Nav), UX-DR9 (icon system), UX-DR13 (routed IA/sidebar structure), UX-DR20 (accessibility floor baked into components).

## Implementation Notes (checked against working tree, 2026-08-12)

Already in place: monorepo scaffold (`apps/web` Next.js, `apps/api` NestJS, `packages/ui`/`shared`/`config`, `infra/prisma/schema.prisma`, `infra/provisioning/provision.ts`), `packages/ui/src/components/button.tsx`, `packages/ui/src/styles/theme.css`, `packages/shared/src/schemas/site.ts`. None of this yet reflects the finalized `DESIGN.md` token values or the full component set — treat existing files as a starting point to bring into spec, not a placeholder to ignore.

Still needed: full token migration into `theme.css` per `DESIGN.md` frontmatter (light + dark), the remaining 8 components from UX-DR2–9, Clerk auth wiring, the sidebar app shell with the 15-surface IA from `EXPERIENCE.md`, and CI wiring for `eslint-plugin-jsx-a11y` + Lighthouse (AD-15).

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/00-login.html`, `.working/_shared-kit.html` (literal CSS/token/icon source), `DESIGN.md`, `EXPERIENCE.md` §Component Patterns.
