---
title: 'DSR Materials Used draws from Godown Stock when Site Stock is short'
type: 'bugfix'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 1
context: []
baseline_commit: '9110d8951ee5e88fe5e3d111f9157d7288bfa0bb'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** DSR "Materials Used" (and the standalone Consumption form's create path) validate and deduct only against `SiteStock`. A material sitting in `GodownStock` but never explicitly Moved to that Site is unusable — the picker shows "Insufficient stock" and DSR submission throws `INSUFFICIENT_STOCK`, even though it's genuinely available in the Godown.

**Approach:** Consumption draws Site Stock first, then falls back to Godown Stock for the shortfall — no Movement step required. Each `Consumption` row persists the exact split it drew (`siteStockQuantity`/`godownStockQuantity`) so any later edit, DSR correction, or standalone Consumption correction restores stock to the exact locations it came from, never guessing — including a signed-delta standalone correction, which routes its delta through the same split logic proportionally to the *original* row's own recorded split (already loaded by the existing `correctsId` lookup), not a guessed policy.

## Boundaries & Constraints

**Always:**
- Site Stock drawn before Godown Stock (site-first, godown-fallback); never the reverse, never Godown-only.
- Combined (Site+Godown) insufficiency still throws `BadRequestException`/`INSUFFICIENT_STOCK`; negative stock never permitted.
- A Consumption row's stored split is the sole source of truth for reversing that row — never re-derive a guessed split.
- A standalone Consumption correction's signed delta: increase routes through `takeConsumptionStock` (site-first-then-Godown, same as a plain create); decrease routes through `giveBackConsumptionStock` split proportionally to the *original* row's own recorded `siteStockQuantity`/`godownStockQuantity` ratio — never blindly credited to Site Stock alone.
- Movement/Purchase/Return-Wastage stock logic untouched — only Consumption's stock source changes.

**Ask First:** None — fallback order, reversal-via-stored-split, and the correction-path fix (added after review found the original deferral would corrupt balances for Godown-sourced rows) were confirmed with the user.

**Never:** Bypass Movement as a feature; push either balance negative; touch Purchase/Movement/Return-Wastage logic.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Godown-only stock | Site=0, Godown=100, consume 20 | Site stays 0, Godown 100→80, split {site:0, godown:20} | N/A |
| Split across both | Site=5, Godown=100, consume 20 | Site 5→0, Godown 100→85, split {site:5, godown:15} | N/A |
| Combined insufficient | Site=5, Godown=10, consume 20 | Nothing deducted, write rolls back | `BadRequestException` INSUFFICIENT_STOCK |
| Reversal (edit/correction) | Existing split {site:5,godown:15}, edited/corrected | Site+5, Godown+15 given back exactly, then new amount retaken site-first | N/A |
| Standalone correction, increase | Original split {site:5,godown:15} (qty 20), correction delta +8 | Site-first-then-Godown for the +8 (Site has 0 left post-original-draw scenario dependent; follows same take logic) | `BadRequestException` if combined insufficient |
| Standalone correction, decrease | Original split {site:5,godown:15} (qty 20), correction delta -8 | Give-back split proportionally to original ratio: Site+2, Godown+6 (8 × 5/20, 8 × 15/20) | N/A |

</frozen-after-approval>

## Code Map

- `infra/prisma/schema.prisma:346` (`model Consumption`) -- add `siteStockQuantity`/`godownStockQuantity` Decimal `@default(0)`; hand-written migration backfills existing rows as `{quantity, 0}` (Prisma-declared columns — normal `pnpm db:migrate:dev`).
- `apps/api/src/inventory/stock-delta.ts` -- add `takeConsumptionStock(tx, siteId, materialSizeId, amount, msg)` (site-first via `decrementStockWithFloorCheck`, Godown for remainder, throws if both insufficient) and `giveBackConsumptionStock(tx, siteId, materialSizeId, siteAmount, godownAmount)` (plain upsert-increments). Existing `applySiteStockDelta` stays for non-Consumption callers.
- `apps/api/src/dsr/dsr.service.ts:328-388` (`materializeSubRecords` consumption loop) -- if `existing`, `giveBackConsumptionStock` its stored split first; always `takeConsumptionStock` for the new quantity; persist returned split. Replaces the old delta/material-changed branching.
- `apps/api/src/dsr/dsr.service.ts:~1216-1253` (correction/supersede loop) -- reverse each superseded row via `giveBackConsumptionStock(stored split)`; apply new rows via `takeConsumptionStock`, persist split.
- `apps/api/src/inventory/consumption.service.ts:60-86` (`create`) -- plain-create (`correctsId` absent): `takeConsumptionStock`, persist split, as before. `correctsId`-set branch (review addendum): the existing `original` lookup already fetches `original.siteStockQuantity`/`godownStockQuantity`; positive `input.quantity` (delta) routes through `takeConsumptionStock`; negative delta routes through `giveBackConsumptionStock` with `siteAmount = -delta * (original.siteStockQuantity / original.quantity)`, `godownAmount = -delta * (original.godownStockQuantity / original.quantity)` (rounded consistently so the two sum to `-delta`); persist the resulting split on the correction row too — no more `{0,0}` placeholder.
- `apps/web/lib/use-site-stock.ts` (`stockStatus`) -- when `elsewhere` passed (DSR's two Materials Used sections + standalone create only), check `siteQty + elsewhereQty` combined, not `siteQty` alone.
- `apps/api/src/inventory/stock-delta.ts` -- remove the now-fully-unused `applySiteStockDelta` (review finding: zero callers even pre-diff).

## Tasks & Acceptance

**Execution:**
- [x] `infra/prisma/schema.prisma` + migration -- add split columns with backfill
- [x] `apps/api/src/inventory/stock-delta.ts` -- add `takeConsumptionStock`/`giveBackConsumptionStock`
- [x] `apps/api/src/dsr/dsr.service.ts` -- rewire both consumption loops onto the new primitives
- [x] `apps/api/src/inventory/consumption.service.ts` -- rewire `create()`'s plain-create branch only
- [x] `apps/web/lib/use-site-stock.ts` -- combined-availability `stockStatus`
- [x] `apps/api/src/dsr/dsr.service.integration.spec.ts` + `apps/api/src/inventory/consumption.service.integration.spec.ts` -- add Godown-fallback + reversal cases; existing Site-only tests must keep passing unchanged
- [x] `apps/api/src/inventory/consumption.service.ts` -- fix the `correctsId`-set branch: route the signed delta through `takeConsumptionStock`/`giveBackConsumptionStock` using the original row's recorded split, persist the resulting split on the correction row
- [x] `apps/api/src/inventory/consumption.service.integration.spec.ts` -- add cases: correction-increase on a Godown-sourced row succeeds by drawing Godown when Site alone is short; correction-decrease gives back proportionally to the original split (not all to Site)
- [x] `apps/api/src/inventory/stock-delta.ts` -- remove unused `applySiteStockDelta`
- [x] `apps/api/src/inventory/consumption.service.spec.ts` -- add a mocked case with a small Site balance asserting `godownStockUpdateMany` is called and the split is correct
- [x] `apps/web/lib/use-site-stock.ts` -- fix `insufficientStatus()`'s unit fallback (`entry?.unit` → falls back incorrectly when `entry` is null); add `elsewhere?.stock.loading` check to avoid a false "Insufficient" flash; add combined-availability wording to the sufficient-but-partial-fallback success message
- [x] `apps/web/lib/use-site-stock.test.ts` -- add cases passing both `quantity` and `elsewhere` together: combined-sufficient (not insufficient) and combined-insufficient (message text)
- [x] `apps/api/src/dsr/dsr.service.integration.spec.ts` -- revert the unrelated `detail.otherActivity` reformatting hunk to keep the diff scoped
- [x] `AGENTS.md` -- add a short changelog entry documenting the Godown-fallback behavior and schema change, per this project's established convention
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- remove the now-resolved "standalone Consumption correction path" deferred entry

**Acceptance Criteria:**
- Given Site=0, Godown=100, when 20 units are added under DSR Materials Used and submitted, then Godown reads 80, Site stays 0, split is `{site:0, godown:20}`.
- Given a submitted DSR Consumption drawn `{site:5, godown:15}`, when corrected to a smaller quantity, then Site and Godown each increase by exactly their own original portion before the new amount is taken.
- Given Site=5, Godown=10, when 20 units are requested, then the write fully rolls back and `BadRequestException` is returned.
- Given the standalone Consumption form, plain create draws site-first-then-Godown like DSR.
- Given a standalone Consumption row with original split `{site:5, godown:15}` (qty 20), when corrected down by 8, then Site gets back 2 and Godown gets back 6 (proportional to the original split) — not all 8 to Site.
- Given that same row, when corrected up by a delta that Site alone can't cover but Site+Godown can, then the correction succeeds (not wrongly rejected as "Not enough Site Stock").

## Spec Change Log

- 2026-09-23 (review loop 1): Edge Case Hunter review found the original deferral of the standalone Consumption correction path was unsafe, not neutral — corrections on a Godown-sourced row would wrongly reject valid increases and always give decreases back to Site Stock only, corrupting both balances. User chose to fix it now rather than guard or accept the risk. Amended: Intent/Approach, Boundaries (Always/Never), I/O matrix, Code Map, and Tasks to route the correction's signed delta through the existing `takeConsumptionStock`/`giveBackConsumptionStock` primitives, using the *original* row's recorded split for proportional give-back — not a new guessed policy. Removed the now-resolved deferred-work.md entry. **KEEP:** everything from the first pass (schema split columns, `takeConsumptionStock`/`giveBackConsumptionStock`, DSR's two consumption loops, standalone plain-create, client hint combined-check) is correct and tested as-is — only the correction branch and the smaller patch findings (dead code, unit test gaps, a unit-display bug, a loading-race flash, AGENTS.md changelog) are new work.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test -- dsr.service.integration.spec.ts consumption.service.integration.spec.ts` -- all pass, including new Godown-fallback cases
- `pnpm --filter @azentisfieldos/api typecheck && pnpm --filter @azentisfieldos/web typecheck` -- no errors

**Manual checks (if no CLI):**
- Godown has stock for a Material never Moved to a Site; add it under that Site's DSR Materials Used — no "Insufficient stock" hint, submission succeeds, Godown balance drops.
