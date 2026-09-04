# Android TWA wrapper build

Turns `apps/web`'s installed PWA into a signed Android APK — a Trusted Web
Activity (TWA), not a native rewrite. `template/` is a checked-in, generic
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)-generated
Android project; `build.ts` copies it, points it at one tenant's manifest and
package id, and produces `dist/<slug>.apk`.

This is the shared build primitive. It does not know about
`infra/tenants/*.json` or provisioning — a later story (20.3/20.4) wires this
up per tenant. Run it by hand with explicit arguments until then.

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

## Known limitation found while building this

`apps/web`'s `/icons/*` routes were, at the time this story was built,
blocked by `apps/web/proxy.ts`'s auth check (redirected to `/sign-in`
instead of serving the PNG) — `/manifest.webmanifest` itself is
matcher-excluded and public, but the icon routes it references were not.
Bubblewrap's own icon-fetch during `init`/`update` needs those bytes
unauthenticated to embed them into the Android project. A fix
(allowlisting `/icons` as public, alongside `/sign-in`) was made locally in
`apps/web/proxy.ts` as part of finding this — **that fix is a real product
bug fix, not just a build-tooling workaround** (Chrome's own PWA
installability check and any Android device installing a tenant's TWA need
the same unauthenticated access), but committing/deploying it is a human
call, not made here. Until it ships, running this build against a tenant's
**production** manifest URL will fail fetching icons; the live scaffold and
verification run for this story used a generic placeholder icon URL
(`https://placehold.co/512x512.png`) precisely to route around this and
still prove the rest of the pipeline against the real, live manifest JSON.
