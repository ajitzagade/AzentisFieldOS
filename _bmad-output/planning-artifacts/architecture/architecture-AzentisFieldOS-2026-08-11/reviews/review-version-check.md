# Version/Reality Check — ARCHITECTURE-SPINE.md "Stack" table

**Reviewed:** `_bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md`, Stack table (lines 111–129)
**Method:** npm registry `dist-tags.latest` lookups (ground truth) cross-checked against web search coverage, as of **2026-08-12**.
**Verdict key:** ✅ Current/confirmed · ⚠️ Stale (behind actual latest) · 🟡 Partially accurate (nuance the spine misses) · ❓ Unverifiable/vague-but-reasonable

---

## Findings by row

### ⚠️ Next.js — pinned `16.2.x`
npm registry `next@latest` = **16.3.0**, published 2026-08-03. Next.js 16.3 shipped over a week before this document's date (2026-08-11) with real, non-cosmetic changes (Instant Navigations, ~90% lower dev-mode RAM, faster builds/SSR). The pin is one minor version stale as of the document's own creation date. Not catastrophic, but the "current" framing throughout the doc doesn't hold for this row.

### ❓ React — pinned `19.2` (no patch)
npm registry `react@latest` = **19.2.8**, published 2026-07-21. `19.2` as a bare minor is defensible (React's own docs commonly reference the minor line), but it's the only row in the table not pinned to a patch, which is inconsistent with the rest of the table's precision and means it's not actually reproducible as written. Note also: multiple critical CVEs (React2Shell family, CVE-2025-55182) were patched in the 19.2.x line in Dec 2025 — worth an explicit "≥19.2.6" or similar floor rather than a bare minor, given this is a security-relevant detail the spine doesn't surface.

### ✅ NestJS — pinned `11.1.28`
npm registry `@nestjs/core@latest` = **11.1.29**, published 2026-08-10 (one day before doc date). Effectively current — one patch released the day before this document was authored, which is not a reasonable bar to hold a hand-researched pin to. Confirms real, actively maintained package.

### ⚠️ Prisma — pinned `7.4.2`
npm registry `prisma@latest` = **7.9.1**, published 2026-07-27 — **five minor versions ahead** of the pin, and that latest was published two weeks before this document's date. This is the most stale pin in the table. Prisma 7 (the Rust-free rewrite) is real and correctly identified as the major line, but `7.4.2` reads like a version asserted from training-data familiarity with "Prisma 7 exists" rather than an actual registry check on the date of authoring.

### 🟡 PostgreSQL — pinned `17.x, via Neon or Supabase`
PostgreSQL 18 is GA (18.4 latest stable), and PostgreSQL 19 is in beta with GA expected ~Sept/Oct 2026. Checked both named providers specifically, since the spine leans on them as the "live current defaults" per the task:
- **Neon**: Postgres 18 became the **default for new projects** as of the 2026-06-05 changelog — GA, not preview. A new Neon-backed tenant provisioned today gets 18 by default, not 17.
- **Supabase**: still defaults to Postgres 17 (rolled out mid-2026); Postgres 18 support is roadmapped but not yet the default.
So `17.x` is accurate for Supabase but **already behind Neon's actual default**. The spine states "17.x, via Neon or Supabase" as if it's one consistent current default across both — that's no longer true and should either pin per-provider or explicitly choose to pin below Neon's new default (18) for a stated reason (e.g., ecosystem/driver maturity), not leave it unstated.

### ⚠️ Tailwind CSS — pinned `4.1.18`
npm registry `tailwindcss@latest` = **4.3.3**, published 2026-07-16 — two minor versions ahead. Tailwind 4.2 (Feb 2026, webpack plugin + new palettes) and 4.3 both postdate the pin. The CSS-first `@theme` architectural claim (AD-4) is still correct for v4 generally, but the specific patch pin is stale.

### ✅ shadcn/ui — "current (July 2026 Base UI migration)"
Verified precisely correct. `ui.shadcn.com/docs/changelog/2026-07-base-ui-default` confirms Base UI became the default primitive library for new shadcn/ui projects in July 2026 (Radix remains supported, with a `migrate radix` escape hatch). This is the one row that shows clear evidence of an actual current-state check rather than training-data recall — the specific month and the "not Radix" framing match the real changelog almost verbatim.

### ✅ Clerk `@clerk/nextjs` — pinned `7.7.0`, "requires Next.js 16.0.10+ (skip 16.0.0–16.0.9)"
Both parts check out:
- npm registry `@clerk/nextjs@latest` = **7.7.4** (published today, 2026-08-12) — the pin is a few patches behind but was accurate very recently; not a meaningful staleness concern.
- The compatibility caveat is **verified true and unusually specific** — Clerk's own docs/GitHub discussion confirm the published `@clerk/nextjs` peer range genuinely skips Next.js 16.0.0–16.0.9, requiring 16.0.10+ (or 15.2.8+ on the 15 line). This is exactly the kind of narrow, dated compatibility landmine that can't be pattern-matched from training data — it reads as genuinely researched.

### ✅ Turborepo — pinned `2.10.9`
npm registry `turbo@latest` = **2.10.9**, published 2026-08-07 — exact match, four days before doc date. Confirmed current.

### ❓ pnpm — "latest stable"
Not a hard pin, so nothing to falsify. Correctly avoids a stale pin given pnpm ships frequently (11.20.0 was current in Aug 2026, with a 12.0.0-rc already in flight). Reasonable choice.

### ✅ Dexie.js — pinned `4.4.4`
npm registry `dexie@latest` = **4.4.4**, published 2026-06-16. Exact match. Confirmed current and confirmed the package/purpose (IndexedDB wrapper for the AD-8 local-first queue) is correct.

### ✅ Zod — pinned `4.4.3`
npm registry `zod@latest` = **4.4.3**, published 2026-05-04. Exact match. Confirmed current; Zod 4 stable line correctly identified (no premature jump to an unreleased 4.5 canary).

### ✅ Vitest — pinned `4.1.10`
npm registry `vitest@latest` = **4.1.10**, published 2026-07-06. Exact match. Note: a Vitest 5 beta line exists (5.0.0-beta.x) but is correctly *not* what's pinned — the spine stuck to the stable major, which is the right call for a greenfield build that shouldn't start on a beta.

### ✅ Playwright — pinned `1.62.1`
npm registry `playwright@latest` = **1.62.1**, published 2026-07-30. Exact match. Confirmed current.

### ✅ Cloudflare R2 — "current API"
Confirmed R2 is a real, actively developed, S3-compatible object storage product (zero egress fees, Standard/Infrequent Access tiers, Data Catalog) and fits its stated purpose (DSR photos/documents). Deliberately unpinned since R2 has no consumer-facing version number — reasonable framing, not evasive.

### ✅ WhatsApp BSP — Gupshup / Interakt (Deferred, but named in Stack table implicitly via delivery note)
Both confirmed as real, currently operating WhatsApp Business Solution Providers as of 2026 (Gupshup: enterprise-grade, India-strong; Interakt: Jio Haptik-owned, D2C/e-commerce-focused). Correctly deferred as a vendor decision rather than pinned.

---

## Summary table

| Row | Pinned | Actual latest (2026-08-12) | Verdict |
| --- | --- | --- | --- |
| Next.js | 16.2.x | 16.3.0 | ⚠️ Stale (1 minor behind) |
| React | 19.2 | 19.2.8 | ❓ Imprecise, defensible |
| NestJS | 11.1.28 | 11.1.29 | ✅ Effectively current |
| Prisma | 7.4.2 | 7.9.1 | ⚠️ Stale (5 minors behind) |
| PostgreSQL | 17.x (Neon/Supabase) | 18.4 GA; Neon defaults to 18 | 🟡 Accurate for Supabase only |
| Tailwind CSS | 4.1.18 | 4.3.3 | ⚠️ Stale (2 minors behind) |
| shadcn/ui | Base UI, July 2026 | matches changelog exactly | ✅ Confirmed |
| Clerk `@clerk/nextjs` | 7.7.0 + compat note | 7.7.4; compat note verified true | ✅ Confirmed (note is genuinely researched) |
| Turborepo | 2.10.9 | 2.10.9 | ✅ Exact match |
| pnpm | latest stable | (unpinned) | ✅ Reasonable |
| Dexie.js | 4.4.4 | 4.4.4 | ✅ Exact match |
| Zod | 4.4.3 | 4.4.3 | ✅ Exact match |
| Vitest | 4.1.10 | 4.1.10 | ✅ Exact match |
| Playwright | 1.62.1 | 1.62.1 | ✅ Exact match |
| Cloudflare R2 | current API | confirmed live product | ✅ Confirmed |
| WhatsApp BSP | Gupshup/Interakt | both active BSPs | ✅ Confirmed |

## Recommendation

Before this spine is finalized, bump three rows to their actual current releases (Next.js → 16.3.0, Prisma → 7.9.1, Tailwind → 4.3.3), and resolve the Postgres row's Neon/Supabase divergence — either pin per-provider or state explicitly why 17.x is chosen over Neon's new 18 default (e.g., driver/tooling maturity, matching Supabase). Everything else in the table is either exactly current or reasonably framed. The Clerk compatibility caveat and the shadcn/ui Base UI note stand out as clearly the product of real research rather than training-data recall — the rest of the table should be brought to that same standard.
