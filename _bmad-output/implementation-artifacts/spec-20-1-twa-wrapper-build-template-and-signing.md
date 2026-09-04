---
title: 'TWA Wrapper Build Template & Signing Key'
type: 'feature'
created: '09-04-2026'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '6d274a9a346d085fe4eabe6e0c880d62f0c5d5af'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AzentisFieldOS has no way to produce an installable Android app for a Tenant. `apps/web` is already a working PWA (manifest, service worker, per-tenant icons), but there's no reusable build tooling to wrap it as a Trusted Web Activity (TWA) — the shell each later Tenant-specific story (branding, Digital Asset Link verification, provisioning integration) depends on.

**Approach:** Add `infra/android/` (sibling to `infra/provisioning/`): a checked-in Bubblewrap-generated TWA wrapper project (`template/`) plus a parameterized CLI build script (`build.ts`) that takes a manifest URL, Android package id, and output slug, and emits one signed release APK — no Android Studio, no per-tenant native project. One upload keystore is generated once and never committed; the build reads it from a local path or a base64 env var, so the same flow works for local dev and a future CI/deployment secret.

## Boundaries & Constraints

**Always:** the signing key is never committed (add `*.jks`/`*.keystore`/`infra/android/dist/` to `.gitignore`); `build.ts` is fully non-interactive (no prompts) and takes domain/package-id/slug as explicit CLI args — it must NOT read `infra/tenants/*.json` itself (that wiring is Story 20.3/20.4); the checked-in `template/` is genericized (no tenant-specific values baked in) even though it's scaffolded once against a real live manifest for verification.

**Ask First:** before running `bubblewrap init`/`build` for real (downloads a managed Android SDK on first run — can be 1GB+, several minutes, needs network) — confirm proceeding. Where the base64 keystore ultimately gets uploaded as a deployment secret (GitHub Actions? Vercel?) is a human decision — document the step, do not attempt to upload anywhere from here.

**Never:** no Play Store submission; no `infra/provisioning/provision.ts` changes (Story 20.4); no `infra/tenants/*.json` schema changes (Story 20.3); no `assetlinks.json` generation (Story 20.2).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Valid `--manifest-url`, `--package-id`, `--slug`, keystore present | `infra/android/dist/<slug>.apk`, signed, template untouched | N/A |
| Missing required arg | e.g. no `--slug` | Non-zero exit, usage message | No partial output written |
| Keystore not found | Neither local path nor `ANDROID_KEYSTORE_BASE64` set | Fails fast with explicit message | Never silently generates a new ad hoc key |
| Re-run same slug | Build invoked twice for one slug | Previous `<slug>.apk` cleanly overwritten | No stale/duplicate artifacts accumulate |

</frozen-after-approval>

## Code Map

- `infra/provisioning/provision.ts`, `infra/provisioning/README.md` -- style/tone reference: TODO discipline, "no guessed command stated as fact" (AGENTS.md greenfield rule) — `infra/android/README.md` follows the same voice.
- `apps/web/app/manifest.ts`, live at `https://sandeepent.azentis.in/manifest.webmanifest` (verified reachable, returns real tenant manifest JSON) -- the real target to scaffold `template/` against.
- `package.json` (root) `scripts.provision` -- pattern to mirror for a new `scripts.android:build` entry (`tsx infra/android/build.ts`).
- `.gitignore` -- currently has no keystore/build-output entries; needs `*.jks`, `*.keystore`, `infra/android/dist/`.
- `pnpm-workspace.yaml` -- confirms `infra/` is plain scripts, not a workspace package (matches `infra/provisioning/` precedent; no change needed).

## Tasks & Acceptance

**Execution:**
- [x] `infra/android/template/` -- scaffold once via `bubblewrap init --manifest=https://sandeepent.azentis.in/manifest.webmanifest`, then strip tenant-specific values so it's a generic starting point -- proves the tool chain actually works, not just documented
- [x] `infra/android/build.ts` -- CLI (`--manifest-url`, `--package-id`, `--slug`, `--keystore-path`|`ANDROID_KEYSTORE_BASE64`) that copies the template, reconfigures it via Bubblewrap's manifest/package update, builds, signs, and emits `infra/android/dist/<slug>.apk` -- the shared primitive every later story consumes
- [x] `infra/android/README.md` -- prerequisites (JDK; Bubblewrap manages its own Android SDK), one-time keystore generation command (`keytool -genkeypair ...`), usage example, explicit never-commit warning
- [x] `package.json` -- add `"android:build": "tsx infra/android/build.ts"`
- [x] `.gitignore` -- add keystore and build-output patterns

**Acceptance Criteria:**
- Given the build is run with a real manifest URL, package id, and slug, when it completes, then a signed APK exists at `infra/android/dist/<slug>.apk` and opens that manifest's PWA full-screen when installed
- Given the same keystore signs two different slugs' builds, when both APKs are inspected, then both carry the identical certificate SHA-256 fingerprint
- Given no keystore is available, when the build runs, then it fails with a clear error and writes no APK

## Design Notes

Bubblewrap owns the actual TWA project generation/signing — `build.ts` is a thin orchestration wrapper (shell out to the `@bubblewrap/cli`), not a reimplementation. Keep `template/` as the output of a real `bubblewrap init`, not hand-written, so it stays correct as Bubblewrap's own generated structure evolves.

## Verification

**Commands:**
- `pnpm android:build -- --manifest-url https://sandeepent.azentis.in/manifest.webmanifest --package-id in.azentis.sandeepent.dev --slug sandeepent-dev --keystore-path infra/android/release.jks` -- expected: exits 0, `infra/android/dist/sandeepent-dev.apk` exists
- `git status` -- expected: no keystore or `dist/` files staged/tracked

**Manual checks (if no CLI):**
- Install the produced APK on an Android device/emulator and confirm it opens `sandeepent.azentis.in` full-screen with no address bar (full DAL verification is Story 20.2 — a bare install here may still show Chrome's UI until `assetlinks.json` exists; that's expected, not a failure of this story).

**Actually run (2026-09-04):**
- The literal command above, against the real production URL, fails at the `bubblewrap update` step: `ERROR Received icon "https://sandeepent.azentis.in/icons/icon-512" with invalid Content-Type. Responded with Content-Type "text/html; charset=utf-8"`. Root cause: `apps/web/proxy.ts`'s auth check does not allowlist `/icons/*` (only `/manifest.webmanifest` is matcher-excluded), so an unauthenticated request — including Bubblewrap's own icon fetch, and Chrome's/Android's installability check — gets 307-redirected to `/sign-in` HTML instead of the PNG. This is a real, pre-existing `apps/web` bug, not a defect in `build.ts`; a fix (`isPublicRoute` also allowlisting `/icons`) is sitting uncommitted in the working tree already (from earlier troubleshooting of the same issue) but was not committed or deployed as part of this story — deploying to the production tenant site is outside this story's scope and a human decision. See `infra/android/README.md`'s "Known limitation" section.
- With that bug worked around (ran `apps/web` locally with the pending `proxy.ts` fix and used its manifest URL instead of production, and temporarily relaxed `build.ts`'s https-only check for that one local run only, reverted immediately after), the full pipeline was verified end-to-end twice with two different `--slug`/`--package-id` pairs against the same keystore: both runs exited 0, both produced a real signed `infra/android/dist/<slug>.apk` (~1MB, valid zip/APK), and `keytool -printcert -jarfile` on both APKs reports the identical certificate SHA-256 fingerprint, matching the keystore's own fingerprint — confirming AC2. Re-running the same slug was confirmed to cleanly overwrite the previous APK (mtime updated, no duplicate files). The missing-required-arg and missing-keystore error paths were confirmed to exit non-zero with a clear message and write no APK.
- Not yet verified: an actual install on an Android device/emulator (no device/emulator available in this environment), and the literal command against the real production URL (blocked on the `apps/web` bug above being deployed).

**Code review round (2026-09-04):** 3 parallel review layers (blind-hunter, edge-case-hunter, verification-gap) ran against the diff. 6 confirmed `patch` findings applied to `build.ts`/`package.json` (missing `@bubblewrap/core` devDependency; unguarded `bin` field shape in `resolveBubblewrapBin`; a temp-keystore-file leak when `ANDROID_KEYSTORE_BASE64` is set without `ANDROID_KEYSTORE_PASSWORD`; silently-ignored malformed CLI args; silent precedence when both keystore sources are set; scratch build dirs never cleaned up after success) — all independently re-verified afterward (patched code read directly, and 3 of the 6 error paths re-run live). 4 findings logged to `deferred-work.md` as out of this story's scope (the `proxy.ts` deploy; manifest-fetch timeout/domain-restriction relevant once Story 20.4 automates this; missing unit tests for `build.ts`'s pure logic; concurrent-build safety). No `intent_gap`/`bad_spec` findings — no loopback needed.

## Suggested Review Order

**Entry point & orchestration**

- Top-level flow: parse args, resolve keystore, resolve the bubblewrap binary, then copy/reconfigure/build/sign.
  [`build.ts:234`](../../infra/android/build.ts#L234)

**Argument parsing & validation**

- CLI flags parsed with no external arg-parsing dependency; unrecognized tokens now hard-fail (post-review fix).
  [`build.ts:84`](../../infra/android/build.ts#L84)
- `--manifest-url`/`--package-id`/`--slug` validated with Bubblewrap's own `util.validatePackageId`, not hand-rolled.
  [`build.ts:112`](../../infra/android/build.ts#L112)

**Keystore resolution & secret hygiene**

- Password presence is checked before any base64 decode/temp-file write — the post-review fix for the temp-keystore leak.
  [`build.ts:148`](../../infra/android/build.ts#L148)
- Both keystore sources set is now a hard error instead of a silent precedence choice.
  [`build.ts:162`](../../infra/android/build.ts#L162)
- Temp keystore file (when sourced from `ANDROID_KEYSTORE_BASE64`) is cleaned up in `finally`, now reachable on every path.
  [`build.ts:293`](../../infra/android/build.ts#L293)

**Bubblewrap process invocation**

- Resolves the real `@bubblewrap/cli` binary path at runtime rather than hardcoding it; guards the `package.json` `bin` field shape (post-review fix).
  [`build.ts:200`](../../infra/android/build.ts#L200)
- Spawns `update`/`build` with `cwd` set to the scratch dir — Bubblewrap's Gradle step uses `process.cwd()`, not `--directory` (see file header for the traced evidence).
  [`build.ts:215`](../../infra/android/build.ts#L215)
- Scratch build dir is removed after a successful copy to `dist/`, but left in place on failure for debugging (post-review fix).
  [`build.ts:290`](../../infra/android/build.ts#L290)

**Documentation**

- Prerequisites, one-time keystore generation, usage, and the `apps/web` icons bug found while building this.
  [`README.md:1`](../../infra/android/README.md#L1)

**Peripherals**

- `android:build` script entry, plus `@bubblewrap/cli`/`@bubblewrap/core` pinned as explicit devDependencies (the latter a post-review fix).
  [`package.json:17`](../../package.json#L17)
- Keystore and build-output patterns excluded from version control.
  [`.gitignore:41`](../../.gitignore#L41)
- `infra/android/template/` (42 files, not individually reviewed) — real, unmodified `bubblewrap init` output with only generic placeholder values; see the README's "How template/ was scaffolded" section for what was verified.
