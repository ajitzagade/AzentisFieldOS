---
title: 'Per-Tenant Digital Asset Link Verification'
type: 'feature'
created: '09-04-2026'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '3a3d71b05e9544a6b4e115d2a5d270fb6c3a185d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Tenant's installed TWA (Story 20.1's signed APK) has no `/.well-known/assetlinks.json` to verify against on that Tenant's own domain, so Chrome can never confirm the app owns the domain — it falls back to a visible Custom Tab address bar instead of rendering full-screen.

**Approach:** Add a static Next.js Route Handler at `app/.well-known/assetlinks.json/route.ts` that emits a standard Digital Asset Links statement from two new build-time env-derived constants (Android package id, shared keystore's SHA-256 fingerprint) added to `lib/tenant.ts` alongside the existing tenant-identity bindings — never hand-edited per Tenant, and inherently scoped to whichever Tenant's deployment built it.

## Boundaries & Constraints

**Always:**
- New constants (`ANDROID_PACKAGE_ID`, `ANDROID_SHA256_FINGERPRINT`) live in `lib/tenant.ts` next to `APP_DISPLAY_NAME`, following its exact "one binding, no hardcoded per-tenant literal, empty-safe fallback" pattern.
- The route returns a well-formed DAL array even when both env vars are unset — mirrors `APP_DISPLAY_NAME`'s fallback-not-throw behavior so local dev never 500s.
- The route is one Tenant's own values only, baked in at that deployment's build — never reads `infra/tenants/*.json` or any other Tenant's data at runtime (AD-1/AD-2).

**Ask First:** _None anticipated — additive, mirrors an established pattern._

**Never:**
- Do not add an `androidPackageId` field to `infra/tenants/*.json`/`_example.json` in this story — `epics/phase-8-post-launch/epic-20-android-app-distribution.md:50` explicitly assigns that to Story 20.3. This story only adds the runtime env vars + route that a later story wires the field through to.
- Do not add `/.well-known` to `proxy.ts`'s `isPublicRoute` — its matcher (`.*\\..*`) already excludes any dot-containing path, same reason `/manifest.webmanifest` needs no allowlist entry.
- Never read or touch the keystore file/password in `apps/web` — only the non-secret SHA-256 fingerprint string, pasted from `keytool -list -v` per `infra/android/README.md`'s documented step.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Configured tenant | `ANDROID_PACKAGE_ID` and `ANDROID_SHA256_FINGERPRINT` both set | 200, JSON array with one DAL statement carrying that package name + fingerprint | N/A |
| Unconfigured (local dev) | Both env vars unset/empty | 200, JSON `[]` — valid DAL syntax, verifies nothing, not an error | N/A |
| Unauthenticated request | No `session` cookie | Route handler serves directly — never redirected to `/sign-in` | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/lib/tenant.ts` -- existing single source of truth for tenant-identity build-time constants (`APP_DISPLAY_NAME` pattern, lines 14-15); add the two new constants here, same file/convention.
- `apps/web/app/manifest.ts` -- precedent for a per-tenant-config-driven special route consuming `lib/tenant.ts`.
- `apps/web/app/icons/[icon]/route.tsx` -- precedent for a static, unauthenticated GET Route Handler serving PWA/TWA installability assets (`dynamicParams`/plain `Response`).
- `apps/web/proxy.ts:26-27` (`isPublicRoute`) and `:70-72` (matcher `"/((?!_next|api|.*\\..*).*)"`) -- confirms `/.well-known/assetlinks.json` is already excluded by the dot-containing-path matcher; no change needed, but re-verify live (Story 20.1's `/icons` bug was exactly this assumption going unverified).
- `infra/android/README.md:86-90` -- documents the fingerprint as human-inspected via `keytool -list -v -keystore infra/android/release.jks`; this story is what a human pastes that value into.
- `.env.example` -- existing per-tenant env var conventions; note `NEXT_PUBLIC_APP_DISPLAY_NAME` itself isn't documented there either, so match that same lightweight precedent (no `NEXT_PUBLIC_` prefix needed here — both new vars are read server-side only, inside a Route Handler, never sent to the client bundle).
- `_bmad-output/planning-artifacts/epics/phase-8-post-launch/epic-20-android-app-distribution.md:50` -- confirms Story 20.3, not this story, owns adding `androidPackageId` to `infra/tenants/*.json`.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/tenant.ts` -- add `ANDROID_PACKAGE_ID` and `ANDROID_SHA256_FINGERPRINT` exports, each `process.env.<NAME>?.trim() || ""` -- centralizes the two new constants next to the existing tenant bindings
- [x] `apps/web/app/.well-known/assetlinks.json/route.ts` -- new Route Handler, `export const dynamic = "force-static"`, `GET` returns `Response.json([...])`: one DAL statement (`relation: ["delegate_permission/common.handle_all_urls"]`, `target.namespace: "android_app"`, `target.package_name`, `target.sha256_cert_fingerprints: [fingerprint]`) when both constants are non-empty, else `[]`
- [x] `apps/web/app/.well-known/assetlinks.json/route.test.ts` -- unit test covering both I/O matrix branches (configured vs unconfigured)

**Acceptance Criteria:**
- Given `ANDROID_PACKAGE_ID`/`ANDROID_SHA256_FINGERPRINT` are set for a deployment, when `GET /.well-known/assetlinks.json` is requested, then it returns a Digital Asset Links statement listing that fingerprint and that package name
- Given neither env var is set, when the route is requested, then it returns 200 with `[]`, not an error
- Given an unauthenticated request (no `session` cookie), when `GET /.well-known/assetlinks.json` is requested, then it is served directly (200), never redirected to `/sign-in`

## Spec Change Log

<!-- Empty until the first bad_spec loopback. -->

## Design Notes

Digital Asset Links statement shape (Google's fixed spec, not project-specific):
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "in.azentis.sandeep-enterprises",
    "sha256_cert_fingerprints": ["14:6D:E9:..."]
  }
}]
```
The fingerprint env var is pasted verbatim in `keytool`'s own colon-separated uppercase-hex output format — no parsing/reformatting in code.

Scoping note: this story deliberately stops at "route + env vars exist and work when configured," not "every Tenant has real values." Story 20.3 adds `androidPackageId` to `infra/tenants/*.json`; Story 20.4 is what wires provisioning to actually set `ANDROID_PACKAGE_ID`/`ANDROID_SHA256_FINGERPRINT` per deployment. Until then, setting them for a real Tenant deployment is a manual step, consistent with how `NEXT_PUBLIC_APP_DISPLAY_NAME` already works today.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test` -- expected: new route/unit tests pass
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web lint` -- expected: clean
- `pnpm --filter @azentisfieldos/web dev`, then `curl -s http://localhost:3000/.well-known/assetlinks.json` -- expected: `[]` (env unset locally)
- Same curl with `ANDROID_PACKAGE_ID`/`ANDROID_SHA256_FINGERPRINT` set in the dev server's env -- expected: one-element array with matching values

**Manual checks (if no CLI):**
- Confirm the route is reachable with no `session`/`refresh_token` cookies present at all (e.g. `curl` with no `-b`) — the exact class of bug Story 20.1 hit with `/icons`, where an unauthenticated fetch got redirected to `/sign-in` HTML instead of real content.

## Suggested Review Order

**Route handler (entry point)**

- Static Route Handler export — makes the response cacheable/prerenderable since content is fully build-time-derivable.
  [`route.ts:12`](../../apps/web/app/.well-known/assetlinks.json/route.ts#L12)

- Core logic: empty-array guard when either constant is unset, else one DAL statement built from both.
  [`route.ts:14`](../../apps/web/app/.well-known/assetlinks.json/route.ts#L14)

**Config source**

- The two new build-time env-derived constants this route reads, following `APP_DISPLAY_NAME`'s exact fallback-not-throw pattern.
  [`tenant.ts:35`](../../apps/web/lib/tenant.ts#L35)

**Tests**

- Real-module coverage (review patch): proves `lib/tenant.ts`'s own `.trim() || ""` logic runs end-to-end, including whitespace-only/padded env values.
  [`route.test.ts:68`](../../apps/web/app/.well-known/assetlinks.json/route.test.ts#L68)

- Mocked-module coverage of the route's own branch logic (configured / unconfigured / partially-configured).
  [`route.test.ts:13`](../../apps/web/app/.well-known/assetlinks.json/route.test.ts#L13)
