# Android TWA wrapper build

Turns `apps/web`'s installed PWA into a signed Android APK — a Trusted Web
Activity (TWA), not a native rewrite. `template/` is a checked-in, generic
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)-generated
Android project; `build.ts` copies it, points it at one tenant's manifest and
package id, and produces `dist/<slug>.apk`.

This is the shared build primitive. It does not know about
`infra/tenants/*.json` or provisioning — Story 20.4 wires this up per tenant.
Run it by hand with explicit arguments until then.

## Per-tenant branding is automatic — no separate Android config (story 20.3)

`--manifest-url` is the *only* branding input this build ever needs. Bubblewrap's
`TwaManifest.fromWebManifest` (which `build.ts` calls, same as `bubblewrap init`
itself does) reads the app name, icons, and theme color straight out of whatever
manifest that URL serves — and `apps/web`'s manifest (`app/manifest.ts`,
`lib/tenant.ts`, `app/icons/[icon]/route.tsx`) already derives the app name and
the icon's initials glyph from that deployment's own `NEXT_PUBLIC_APP_DISPLAY_NAME`.
`build.ts` never overrides any of it — it only sets `packageId` and `signingKey`,
the two fields a web manifest can't carry (see the source comment above
`TwaManifest.fromWebManifest` in `build.ts`). Point this script at two
different tenants' own manifest URLs and you get two APKs with distinct app
names and icon initials, with zero Android-layer branding config to
maintain — verified directly against `@bubblewrap/core`'s
`TwaManifest.fromWebManifest` with two distinct manifest fixtures for this
story (see `_bmad-output/implementation-artifacts/spec-20-3-tenant-branded-apk-generation.md`).
**Not yet tenant-differentiated:** `BRAND_THEME_COLOR` in `lib/tenant.ts` is
still one hardcoded literal shared by every tenant deployment (per-tenant
color is Epic 14 work that hasn't landed) — so every tenant's icon background
and splash color are identical today; only the app name and icon-glyph
initials actually differ per tenant right now.

`infra/tenants/<slug>.json` now carries an `androidPackageId` field per tenant
(added this story) for exactly this script's `--package-id` flag — not yet
read automatically (Story 20.4 wires provisioning to pass it through), so
keep supplying `--package-id` by hand until then. Package id sections must be
`[a-zA-Z][a-zA-Z0-9_]*` (Android/Java rules) — a tenant's hyphenated slug
needs its hyphens swapped for underscores (e.g. `sandeep-enterprises` ->
`in.azentis.sandeep_enterprises`), confirmed against `@bubblewrap/core`'s own
`util.validatePackageId`, the same validator this script's `--package-id`
flag already runs. Must also be unique across every `infra/tenants/*.json` —
Android treats package id as the app's permanent identity, so two tenants
sharing one would collide on-device, and changing a tenant's id after its APK
is already distributed doesn't "update" that install, it registers as a
different app (a fresh sideload, not an upgrade) — pick it once, deliberately.

Shell-level branding (icon/name/splash) is baked in at build time and does
not refresh on its own after distribution — if a Tenant's `NEXT_PUBLIC_APP_DISPLAY_NAME`
changes later, the already-installed APK keeps showing the old one until a
new APK is built and manually redistributed. This is the epic's documented
"no auto-update for shell-level changes" limitation, not a defect.

## Prerequisites

- A JDK on `PATH` (this repo has been verified against Homebrew's
  `openjdk@17`; `bubblewrap doctor` will tell you if yours is unsupported).
- Nothing else to install by hand: Bubblewrap manages its own Android SDK.
  The **first** `pnpm android:build` (or `bubblewrap init`/`build`) run on a
  machine prompts once to download a managed SDK to `~/.bubblewrap/` — this
  is 1GB+ and can take several minutes. Subsequent runs reuse it.

## One-time: generate the upload keystore

Bubblewrap (and this script) never generates a keystore on its own — a
missing keystore is always a hard failure, not a fallback. Generate one
yourself, once, with `keytool` (ships with the JDK):

```
keytool -genkeypair -v \
  -keystore infra/android/release.jks \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for a keystore password, a key password (can be the same
value), and identity fields (name/org/country) — these go into the
certificate, not into any committed file.

**Never commit the resulting `.jks`/`.keystore` file** — `.gitignore` blocks
`*.jks`/`*.keystore` and `infra/android/dist/` already, but treat the
keystore and its passwords as secrets regardless. The same keystore must
sign every tenant's APK (Android treats a package id + a different signing
certificate as an untrusted update, not an upgrade) — losing it means every
already-installed tenant app can never receive a signed update again, so
back it up somewhere durable and access-controlled outside this repo.

For CI/deployment, base64-encode it instead of shipping the file:

```
base64 -i infra/android/release.jks | pbcopy   # macOS; use -w0 on Linux
```

Store that string as `ANDROID_KEYSTORE_BASE64` in whatever secret store the
deployment pipeline uses (GitHub Actions secret, Vercel environment
variable, ...). **Where it ultimately gets uploaded is a human decision** —
this script only documents the shape it expects, it doesn't upload anywhere.

## Usage

```
pnpm android:build -- \
  --manifest-url https://<tenant>.azentis.in/manifest.webmanifest \
  --package-id in.azentis.<tenant> \
  --slug <tenant>-dev \
  --keystore-path infra/android/release.jks

# required env vars either way:
ANDROID_KEYSTORE_PASSWORD=...
ANDROID_KEY_PASSWORD=...        # optional — defaults to ANDROID_KEYSTORE_PASSWORD
```

Or, with the keystore delivered as a secret instead of a local file:

```
ANDROID_KEYSTORE_BASE64=... \
ANDROID_KEYSTORE_PASSWORD=... \
pnpm android:build -- --manifest-url ... --package-id ... --slug ...
```

Output: `infra/android/dist/<slug>.apk`, signed and ready to install
(`adb install infra/android/dist/<slug>.apk`, or transfer it to a device
directly — this is manual "Internet-sourced APK" installation, no Play
Store involved). Re-running with the same `--slug` cleanly overwrites the
previous APK; `infra/android/template/` itself is never modified.

Every APK signed with the same keystore carries the same certificate SHA-256
fingerprint (`keytool -list -v -keystore infra/android/release.jks` to
inspect it) — that fingerprint is what a later story's `assetlinks.json`
(20.2) verifies against, so the same keystore must be reused for every
tenant build, not regenerated per tenant.

Once a signed APK exists, see `DISTRIBUTION.md` for how to actually get it
onto a Tenant's phone (story 20.6) — and `qa-20-5-manual-parity-checklist.md`
(`_bmad-output/implementation-artifacts/`) for the manual pass to run before
handing it to a client.

## How `template/` was scaffolded

`template/` is real `bubblewrap init` output (`@bubblewrap/cli` pinned in
root `package.json`, currently `1.25.0`), generated once against a live,
reachable manifest
(`https://sandeepent.azentis.in/manifest.webmanifest`) to prove the tool
chain actually works — then every tenant-identifying answer (domain, app
name, package id, colors, icon URLs) was supplied as a generic placeholder
at the relevant prompt instead of accepting Bubblewrap's tenant-derived
default, so nothing tenant-specific ended up committed:

| Field | Generic value used |
|---|---|
| Domain | `example.com` |
| Application name | `Tenant App` |
| Short name | `App` |
| Application ID | `com.example.twa` |
| Status bar / splash colors | `#000000` / `#FFFFFF` |
| Icon / maskable icon URL | `https://placehold.co/512x512.png` |
| Key store location | `./android.keystore` (never generated — declined the "create one now?" prompt) |

`build.ts` never reads `template/`'s `twa-manifest.json` values as
defaults to keep — it constructs a fresh manifest from the real
`--manifest-url` via the same `TwaManifest.fromWebManifest` Bubblewrap's own
`init` uses, then overrides only `packageId` and `signingKey` (the two
fields a web manifest can't carry). Only the generated Gradle
project *shape* (gradlew, build.gradle structure, TWA launcher
activity, DAL asset-statement wiring) comes from `template/`.

If Bubblewrap's own generated template structure changes in a future
version bump, re-scaffold `template/` the same way (real `init` run,
generic answers at every prompt) rather than hand-editing the generated
files — see the Design Notes in
`_bmad-output/implementation-artifacts/spec-20-1-twa-wrapper-build-template-and-signing.md`.

## Known limitation found while building this (resolved in source, not yet deployed)

`apps/web`'s `/icons/*` routes were, at the time story 20.1 was built,
blocked by `apps/web/proxy.ts`'s auth check (redirected to `/sign-in`
instead of serving the PNG) — `/manifest.webmanifest` itself is
matcher-excluded and public, but the icon routes it references were not.
Bubblewrap's own icon-fetch during `init`/`update` needs those bytes
unauthenticated to embed them into the Android project. The fix
(allowlisting `/icons` as public, alongside `/sign-in`) has since been
committed (`f759313`), so this repo's source no longer has the bug — but
**deploying it to a given tenant's production URL is still a separate human
call** (see `deferred-work.md`). Until a tenant's live deployment has that
fix live, running this build against its **production** manifest URL will
still fail fetching icons there; route around it the same way story 20.1
did (a generic placeholder icon URL, or a local/staging deployment that
already has the fix) until the target tenant's production deploy picks it
up.
