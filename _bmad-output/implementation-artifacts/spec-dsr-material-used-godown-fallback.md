---
title: 'DSR Materials Used draws from Godown Stock when Site Stock is short'
type: 'bugfix'
created: '2026-09-23'
status: 'in-review'
review_loop_iteration: 0
context: []
baseline_commit: '9110d8951ee5e88fe5e3d111f9157d7288bfa0bb'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** DSR "Materials Used" (and the standalone Consumption form's create path) validate and deduct only against `SiteStock`. A material sitting in `GodownStock` but never explicitly Moved to that Site is unusable — the picker shows "Insufficient stock" and DSR submission throws `INSUFFICIENT_STOCK`, even though it's genuinely available in the Godown.

**Approach:** Consumption draws Site Stock first, then falls back to Godown Stock for the shortfall — no Movement step required. Each `Consumption` row persists the exact split it drew (`siteStockQuantity`/`godownStockQuantity`) so any later edit or DSR correction restores stock to the exact locations it came from, never guessing. The standalone Consumption form's *correction* path is deferred (see Boundaries) — its `quantity` is already a signed delta with no prior row to reverse against, so it needs its own give-back policy, out of scope here.

## Boundaries & Constraints

**Always:**
- Site Stock drawn before Godown Stock (site-first, godown-fallback); never the reverse, never Godown-only.
- Combined (Site+Godown) insufficiency still throws `BadRequestException`/`INSUFFICIENT_STOCK`; negative stock never permitted.
- A Consumption row's stored split is the sole source of truth for reversing that row — never re-derive a guessed split.
- Movement/Purchase/Return-Wastage stock logic untouched — only Consumption's stock source changes.

**Ask First:** None — fallback order and reversal-via-stored-split were confirmed with the user before planning.

**Never:** Bypass Movement as a feature; push either balance negative; touch Purchase/Movement/Return-Wastage logic; extend the fallback to `consumption.service.ts`'s `correctsId`-set branch (deferred to `deferred-work.md`; must stay byte-for-byte unchanged).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Godown-only stock | Site=0, Godown=100, consume 20 | Site stays 0, Godown 100→80, split {site:0, godown:20} | N/A |
| Split across both | Site=5, Godown=100, consume 20 | Site 5→0, Godown 100→85, split {site:5, godown:15} | N/A |
| Combined insufficient | Site=5, Godown=10, consume 20 | Nothing deducted, write rolls back | `BadRequestException` INSUFFICIENT_STOCK |
| Reversal (edit/correction) | Existing split {site:5,godown:15}, edited/corrected | Site+5, Godown+15 given back exactly, then new amount retaken site-first | N/A |

</frozen-after-approval>

## Code Map

- `infra/prisma/schema.prisma:346` (`model Consumption`) -- add `siteStockQuantity`/`godownStockQuantity` Decimal `@default(0)`; hand-written migration backfills existing rows as `{quantity, 0}` (Prisma-declared columns — normal `pnpm db:migrate:dev`).
- `apps/api/src/inventory/stock-delta.ts` -- add `takeConsumptionStock(tx, siteId, materialSizeId, amount, msg)` (site-first via `decrementStockWithFloorCheck`, Godown for remainder, throws if both insufficient) and `giveBackConsumptionStock(tx, siteId, materialSizeId, siteAmount, godownAmount)` (plain upsert-increments). Existing `applySiteStockDelta` stays for non-Consumption callers.
- `apps/api/src/dsr/dsr.service.ts:328-388` (`materializeSubRecords` consumption loop) -- if `existing`, `giveBackConsumptionStock` its stored split first; always `takeConsumptionStock` for the new quantity; persist returned split. Replaces the old delta/material-changed branching.
- `apps/api/src/dsr/dsr.service.ts:~1216-1253` (correction/supersede loop) -- reverse each superseded row via `giveBackConsumptionStock(stored split)`; apply new rows via `takeConsumptionStock`, persist split.
- `apps/api/src/inventory/consumption.service.ts:60-86` (`create`) -- ONLY plain-create (`correctsId` absent): `takeConsumptionStock`, persist split. `correctsId`-set branch untouched.
- `apps/web/lib/use-site-stock.ts` (`stockStatus`) -- when `elsewhere` passed (DSR's two Materials Used sections + standalone create only), check `siteQty + elsewhereQty` combined, not `siteQty` alone.

## Tasks & Acceptance

**Execution:**
- [ ] `infra/prisma/schema.prisma` + migration -- add split columns with backfill
- [ ] `apps/api/src/inventory/stock-delta.ts` -- add `takeConsumptionStock`/`giveBackConsumptionStock`
- [ ] `apps/api/src/dsr/dsr.service.ts` -- rewire both consumption loops onto the new primitives
- [ ] `apps/api/src/inventory/consumption.service.ts` -- rewire `create()`'s plain-create branch only
- [ ] `apps/web/lib/use-site-stock.ts` -- combined-availability `stockStatus`
- [ ] `apps/api/src/dsr/dsr.service.integration.spec.ts` + `apps/api/src/inventory/consumption.service.integration.spec.ts` -- add Godown-fallback + reversal cases; existing Site-only tests must keep passing unchanged

**Acceptance Criteria:**
- Given Site=0, Godown=100, when 20 units are added under DSR Materials Used and submitted, then Godown reads 80, Site stays 0, split is `{site:0, godown:20}`.
- Given a submitted DSR Consumption drawn `{site:5, godown:15}`, when corrected to a smaller quantity, then Site and Godown each increase by exactly their own original portion before the new amount is taken.
- Given Site=5, Godown=10, when 20 units are requested, then the write fully rolls back and `BadRequestException` is returned.
- Given the standalone Consumption form, plain create draws site-first-then-Godown like DSR; correcting an existing entry is unchanged from today.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test -- dsr.service.integration.spec.ts consumption.service.integration.spec.ts` -- all pass, including new Godown-fallback cases
- `pnpm --filter @azentisfieldos/api typecheck && pnpm --filter @azentisfieldos/web typecheck` -- no errors

**Manual checks (if no CLI):**
- Godown has stock for a Material never Moved to a Site; add it under that Site's DSR Materials Used — no "Insufficient stock" hint, submission succeeds, Godown balance drops.
