---
title: 'Provisioning Pipeline Integration'
type: 'feature'
created: '09-04-2026'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '1bd476edb93a71edf043ddd7a566986585294fcd'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A new Tenant's Android APK (Stories 20.1–20.3's now-working, now-branded build pipeline) is still something a human must remember to build by hand — it isn't a step in `infra/provisioning/provision.ts`, the one script that's supposed to make onboarding a Tenant a single scripted procedure (AD-2), so it's the one artifact that can silently get forgotten.

**Approach:** Add a real (not stubbed) `buildAndroidApk` step to `provision.ts` that spawns `infra/android/build.ts` as a subprocess with that Tenant's manifest URL (derived from `config.domain`), `androidPackageId` (Story 20.3), and `slug` — positioned right after `createVercelProject` (the step that makes the manifest actually fetchable), inheriting `process.env` so the same shared signing key already required by `build.ts` (never generated ad hoc) flows through untouched. A thrown/rejected error propagates through `main()`'s existing `await` chain to the top-level `.catch`, exactly like every other step's failure — no new error-handling mechanism needed.

## Boundaries & Constraints

**Always:**
- `buildAndroidApk` is a real, working implementation — not another `throw new Error("not implemented")` stub. `infra/android/build.ts` already works (Story 20.1); this story's whole point is wiring that existing, working piece in.
- Wire this in regardless of the other 5 steps' stub state (per the story's own References note) — do not block this story on implementing Vercel/Neon/storage provider calls.
- Reuse the shared signing key via env passthrough only (`ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`, `build.ts`'s existing contract) — never generate, prompt for, or accept a per-Tenant keystore path here.
- A failed Android build must stop the whole provisioning run (reject/throw, do not catch-and-continue) — mirrors the existing migration-failure-fails-the-build principle already applied elsewhere in this project.

**Ask First:** _None anticipated — additive, no provider credentials touched, mirrors `build.ts`'s own subprocess-spawn pattern (`resolveBubblewrapBin`)._

**Never:**
- Never invent Vercel/Neon/Clerk/R2 provider calls for the other 5 steps — out of this story's scope (their own TODOs, untouched).
- Never pass a `--keystore-path` CLI flag through from `provision.ts` — automated/CI provisioning has no local file to point at; only the env-var keystore source applies here.
- Never duplicate `build.ts`'s own arg validation (`util.validatePackageId`, https-only check) in `provision.ts` — trust the subprocess's own validation; a bad arg still surfaces loudly via non-zero exit.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Valid `config` (domain, androidPackageId, slug), keystore env vars set | Subprocess spawned with correct `--manifest-url`/`--package-id`/`--slug`; resolves once `build.ts` exits 0 | N/A |
| Build subprocess fails | `build.ts` exits non-zero (e.g. missing keystore, invalid package id) | `buildAndroidApk` rejects with a clear error naming the tenant slug | Propagates through `main()`'s `await` chain to the top-level `.catch`, process exits 1 |
| Spawn itself fails | `tsx`/node binary resolution fails, or the child process can't start at all | `buildAndroidApk` rejects (child `"error"` event) | Same propagation as above — no silent skip |

</frozen-after-approval>

## Code Map

- `infra/provisioning/provision.ts:35-77` -- the 5 existing stub steps + `main()`'s sequential `await` chain; add `buildAndroidApk` as a 6th, real (non-stub) step function, called right after `createVercelProject`.
- `infra/android/build.ts:200-232` -- `resolveBubblewrapBin()`/`runBubblewrap()` is the exact pattern to mirror for resolving and spawning a sibling CLI (here: `tsx`, not `bubblewrap`) as a subprocess with `stdio: "inherit"` and exit-code-based promise resolution.
- `infra/android/build.ts:104-137` (`parseArgs`) -- confirms the exact 3 required flags (`--manifest-url`, `--package-id`, `--slug`) and their validation (https-only, `util.validatePackageId`, slug charset) that `buildAndroidApk` must supply correctly but never re-validate itself.
- `node_modules/tsx/package.json` `bin` field (`"./dist/cli.mjs"`, a plain string, unlike `@bubblewrap/cli`'s `{bubblewrap: "..."}` object shape) -- resolve via `require.resolve("tsx/package.json")` the same way `build.ts` resolves Bubblewrap's bin, adjusted for the string-vs-object bin shape difference.
- `infra/tenants/sandeep-enterprises.json` / `bhakti-enterprises.json` -- real `domain`/`androidPackageId`/`slug` values (Story 20.3) to build the manifest URL and CLI args from; `https://${config.domain}/manifest.webmanifest` matches the exact convention documented in `infra/android/README.md`'s own `--manifest-url` example.
- `infra/provisioning/README.md:5-13` -- numbered "what it does" list is already stale (still lists a Clerk step; Clerk was fully removed per AGENTS.md 2026-08-29, and `seedFirstAdmin` replaced it in code) — since this story adds a new numbered step to this exact list, correct the list to match `provision.ts`'s actual current steps while touching it (small, adjacent, in-scope cleanup — not a broader README rewrite).

## Tasks & Acceptance

**Execution:**
- [x] `infra/provisioning/provision.ts` -- add `resolveTsxBin()` (mirrors `build.ts`'s `resolveBubblewrapBin()`, adapted for `tsx`'s string-shaped `bin` field) and `buildAndroidApk(config)` (spawns `tsx infra/android/build.ts --manifest-url https://<domain>/manifest.webmanifest --package-id <androidPackageId> --slug <slug>` with `stdio: "inherit"`, rejects on non-zero exit or spawn error) -- the real, working step this story exists to add
- [x] `infra/provisioning/provision.ts` `main()` -- insert `await buildAndroidApk(config);` immediately after `await createVercelProject(config);` -- positioned right after the step that makes the manifest actually fetchable
- [x] `infra/provisioning/README.md` -- update the numbered "what it does" list: drop the stale Clerk line, name `seedFirstAdmin`, add the new Android build step at its correct position -- keeps the list this story is extending accurate rather than compounding its existing staleness

**Acceptance Criteria:**
- Given `provision.ts` runs for a Tenant slug and reaches the Android build step, when it runs, then it invokes `build.ts` with that Tenant's manifest URL (from `config.domain`), `androidPackageId`, and `slug`, producing `infra/android/dist/<slug>.apk` on success
- Given the shared signing key env vars are set in provisioning's own environment, when `buildAndroidApk` spawns the build subprocess, then that subprocess inherits them unchanged — no new key is ever generated per Tenant
- Given the Android build step fails for any reason, when that happens, then `main()`'s promise chain rejects and the process exits non-zero without running any step after it, exactly like the existing stub steps' `throw new Error(...)` behavior

## Design Notes

`provision.ts` cannot import `build.ts`'s logic directly as a function — `build.ts` is a self-invoking CLI script (`main().catch(...)` runs at module load), and this repo has an explicit precedent (`e2e/fixtures/seed.ts`, guarded by `require.main === module`) for why a CLI-only script shouldn't be imported as a library. Spawning it as a subprocess — the same way `build.ts` itself spawns `bubblewrap` — avoids refactoring 20.1's already-shipped, already-reviewed script and keeps this story's diff to the provisioning side only.

Today, `provision.ts <slug>` still fails before ever reaching `buildAndroidApk` (`createVercelProject` throws first — its own TODO, untouched by this story). That's expected, not a regression: the story's own References note says to wire this in "regardless of that other work's completion state." Verification below tests `buildAndroidApk` in isolation.

## Verification

**Commands:**
- Isolated call to `buildAndroidApk` with `infra/android/build.ts` temporarily swapped for a tiny argv-echoing stand-in script -- expected: spawned command includes the exact `--manifest-url`/`--package-id`/`--slug` values from a sample tenant config, proving AC1's argument-wiring claim without needing a real signed build. **Actually run:** confirmed against the real `sandeep-enterprises.json` config — exact match.
- Isolated call to `buildAndroidApk` against the real `build.ts` with no keystore configured (today's actual state — no keystore exists in this environment) -- expected: rejects with a clear error naming the tenant slug, non-zero exit, proving AC3's loud-failure propagation. **Actually run:** confirmed — real `build.ts` exits 1 with its own `ANDROID_KEYSTORE_PASSWORD is required...` message.
- Isolated `child.on("error", ...)` check: spawn a deliberately nonexistent executable path and confirm the `"error"` event fires (not `"exit"`) -- expected, and confirmed: `spawn ... ENOENT` fires `"error"`, proving the third I/O matrix row (spawn-itself-fails) rejects correctly too, not just the non-zero-exit row.
- `npx tsc --noEmit` (bundler resolution) against `provision.ts` -- expected, and confirmed: no syntax/type errors (`infra/` has no CI typecheck per AGENTS.md, so this was a manual sanity pass, not a wired-in gate).

**Manual checks (if no CLI):**
- Re-read `main()`'s step ordering to confirm `buildAndroidApk` sits after `createVercelProject` and before `createDatabase`, matching the Design Notes' dependency reasoning (manifest must be fetchable; DB/storage steps are independent of it).

## Suggested Review Order

**The new step (entry point)**

- Where it plugs into the sequence — right after the step that makes the manifest fetchable, before the DB/storage steps that don't depend on it.
  [`provision.ts:161`](../../infra/provisioning/provision.ts#L161)

- Core spawn logic: subprocess args, env passthrough for the shared signing key, resolve/exit/error handling.
  [`provision.ts:79`](../../infra/provisioning/provision.ts#L79)

- `tsx` bin resolution, mirroring `build.ts`'s own `resolveBubblewrapBin()` for a sibling CLI dependency.
  [`provision.ts:53`](../../infra/provisioning/provision.ts#L53)

**Review-round patches**

- Fail-fast guard for a missing `config.domain`, added after review flagged an opaque DNS-error failure mode.
  [`provision.ts:80`](../../infra/provisioning/provision.ts#L80)

- Signal-terminated exit now reported distinctly from a plain non-zero exit code.
  [`provision.ts:112`](../../infra/provisioning/provision.ts#L112)

**Documentation kept in sync**

- Corrected the stale Clerk references and added the new step's prerequisites, in the same numbered list this story extends.
  [`README.md:8`](../../infra/provisioning/README.md#L8)
