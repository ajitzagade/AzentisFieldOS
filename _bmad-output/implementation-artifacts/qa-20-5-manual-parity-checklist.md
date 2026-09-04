# Story 20.5 — Manual QA Parity Pass Checklist

Manual verification of a real signed TWA APK (Stories 20.1–20.4) on a real Android device.
Not a code task — this is the runbook a human executes. Any failure here is a defect in one
of Stories 20.1–20.4, not new scope (per the story's own framing).

## Before you start — prerequisites

1. **A real, running Android device** (not just an emulator — camera/gallery and true airplane-mode network loss are part of this pass). Emulator is an acceptable fallback for scenarios 1–2 and 4 only.
2. **A signed APK**, built via `pnpm android:build -- --manifest-url <tenant-manifest-url> --package-id <tenant-package-id> --slug <slug> --keystore-path infra/android/release.jks` (env: `ANDROID_KEYSTORE_PASSWORD`, optionally `ANDROID_KEY_PASSWORD`). See `infra/android/README.md`.
3. **The target tenant's production deployment must actually have the icon-proxy fix live.** `f759313` (allowlisting `/icons` in `apps/web/proxy.ts`) is committed but — per `deferred-work.md`'s 20.1 entry — not yet confirmed deployed to any real tenant. If it isn't live, Bubblewrap's own icon fetch during the build already fails, so you won't even get a build. Confirm first: `curl -sI https://<tenant-domain>/icons/icon-512` should return `200 image/png`, not a redirect to `/sign-in`.
4. **`ANDROID_PACKAGE_ID`/`ANDROID_SHA256_FINGERPRINT` must be set as real env vars on the target tenant's live deployment**, and match the keystore you signed with (`keytool -list -v -keystore infra/android/release.jks`). Confirm: `curl -s https://<tenant-domain>/.well-known/assetlinks.json` should return a non-empty DAL array, not `[]`. If it's `[]`, Story 20.2's mechanism is fine but this specific deployment's env vars were never set — that's a deployment/provisioning gap (20.4), not a 20.2 code defect.
5. Install: `adb install infra/android/dist/<slug>.apk`, or transfer the file to the device directly and open it (Android will show a one-time "install unknown apps" warning — expected, not a defect).
6. A test Supervisor account (username/password) for the target tenant.

If step 3 or 4 isn't true yet for any real tenant, this pass can't produce a meaningful result — it'll fail on infrastructure gaps, not on 20.1–20.4's own logic. Flag that back rather than logging false defects.

---

## Scenario 1 — Session persists like the browser (AC1)

**What's actually being tested:** the `session` cookie (access JWT) is short-lived (1 hour, `apps/web/lib/auth-cookies.ts`) but the `refresh_token` cookie lasts 30 days and silently re-auths via `/api/auth/refresh` — reopening the app should never force a re-login within that 30-day window.

- [ ] Open the installed app, sign in as the test Supervisor.
- [ ] Fully close the app (swipe away from recent apps, not just background it).
- [ ] Reopen immediately — confirm still signed in, lands on the signed-in home, no sign-in screen.
- [ ] If possible, wait >1 hour (or come back to this later in the same day), reopen — confirm still signed in with no visible re-auth prompt (the refresh happens silently).

**Pass:** signed in both times, no re-login prompt at any point within the 30-day window.
**Fail → defect in:** Story 20.1 (if the APK doesn't have working cookie storage/persistence at all — check `apps/web/proxy.ts`/`auth-cookies.ts` aren't somehow being bypassed inside the WebView) or an app-level issue outside this epic's stories.

---

## Scenario 2 — Offline Daily Report queues and syncs (AC2)

**What's actually being tested:** `apps/web/lib/offline-db.ts` (Dexie/IndexedDB) queues a Daily Report submitted offline; `apps/web/lib/dsr-sync.ts` drains it automatically once back online — via the browser `online` event **and** a 20-second poll (there's deliberately no Service Worker Background Sync, since a SW can't mint the auth token).

- [ ] With the app already opened online at least once today, turn on Airplane Mode (or otherwise kill connectivity) on the device.
- [ ] Start a new Daily Report, fill it in, submit.
- [ ] Confirm an amber "Saved on device — will sync when back online" banner appears (not an error).
- [ ] Turn Airplane Mode back off.
- [ ] **Without force-closing the app**, wait up to ~20 seconds — confirm the banner flips to a green "Synced" state on its own.
- [ ] Check the site's Daily Activity Log (desktop or another device) — confirm the report actually landed.

**Pass:** queues silently while offline (no error), auto-syncs within ~20s of reconnecting, banner reflects both states correctly.
**Fail → defect in:** Story 20.1's wrapper if the queue/sync logic behaves differently inside the TWA than in Chrome (e.g. IndexedDB not persisting, `online` event never firing inside the WebView) — this would be a parity gap specific to the wrapper, since the queue code itself is pre-existing and out of this epic's scope.

**Known, expected (not a defect):** if the app is fully backgrounded/killed while offline and reconnects in the background, sync won't fire until the app is reopened (no Background Sync — documented epic limitation). Also: a photo attached while the *submission itself* was queued offline does not auto-upload once that queued report later syncs (documented pre-existing gap, not new).

---

## Scenario 3 — Daily Report photo capture/upload (AC3)

**What's actually being tested:** the photo picker (`apps/web/app/(app)/dsr/new/page.tsx`) opens the OS's native "take photo or choose from gallery" chooser (deliberately no `capture` attribute forcing straight-to-camera), then uploads directly to Cloudinary (`apps/web/lib/photo-upload.ts`).

- [ ] While online, start (or continue) a Daily Report, tap the camera icon under Site Photos.
- [ ] Confirm the OS shows a choice between **taking a new photo** and **choosing from the gallery** (not straight into the camera with no choice).
- [ ] Take a new photo — confirm it appears as a thumbnail with an "Uploading…" state, then a green checkmark once done.
- [ ] Try again choosing an existing photo from the gallery — same expected flow.
- [ ] Submit the report — confirm the photo appears correctly in the site's photo gallery afterward.

**Pass:** both camera-capture and gallery-pick work, no missing permission prompt, no silently-stuck "Uploading…" state, photo actually lands in the gallery.
**Fail → defect in:** Story 20.1's wrapper (TWA file-picker/camera permission plumbing is a known category of WebView gap — if the picker doesn't appear at all, or camera permission is silently denied with no OS prompt, that's the wrapper, not the pre-existing upload code).

---

## Scenario 4 — First launch, no connectivity (AC4)

**What's actually being tested:** confirming actual behavior matches the epic's already-documented, already-accepted limitation — not hunting for a new bug.

- [ ] On a device that has **never** opened this app before, turn on Airplane Mode **first**, then launch the app.
- [ ] Observe what happens (likely: a blank/error screen, since there's no bundled UI and no cached content to fall back to yet).

**Pass:** whatever you see matches the epic's documented limitation: *"first-ever launch requires network connectivity (no bundled UI, so a device with no connectivity and no prior launch won't see the app's own offline fallback)"* (`epic-20-android-app-distribution.md`). Confirming this happens as documented is a pass, not a fail — log it as confirmed-expected, not as a new defect.
**Fail →** only if the actual behavior is *worse* than documented (e.g. a hard crash vs. a graceful blank/error state) — that would be a genuine defect worth filing.

---

## Scenario 5 — Chrome-less rendering via `assetlinks.json` (AC5) — **release-blocking**

**What's actually being tested:** Chrome's Digital Asset Link verification (Story 20.2) actually passes for this specific signed APK + this specific tenant domain, so the app opens as a true full-screen TWA — no visible address bar.

- [ ] Launch the installed app (ideally a fresh install, not one left open from earlier testing).
- [ ] Look at the very top of the screen: **is there a visible URL/address bar?**

**Pass:** no address bar at all — full-screen, indistinguishable from a native app.
**Fail:** an address bar is visible (Chrome fell back to a Custom Tab). **Per the story's own text, this blocks distribution of this specific APK/tenant pairing until fixed** — do not ship it. Diagnose in this order:
  1. `curl -s https://<tenant-domain>/.well-known/assetlinks.json` — empty `[]`? → `ANDROID_PACKAGE_ID`/`ANDROID_SHA256_FINGERPRINT` were never set on that deployment (20.4/deployment gap, not a 20.2 code defect).
  2. Non-empty but still failing? → compare the fingerprint in that response against `keytool -list -v -keystore infra/android/release.jks`'s actual output for the keystore this APK was signed with — a mismatch (wrong keystore, stale fingerprint copy-pasted) is the likely cause.
  3. Both correct? → the device may have cached a prior failed verification attempt; try a clean uninstall/reinstall, or another device.

---

## Results log

| Scenario | Pass / Fail | Notes | Story to revisit if failed |
|---|---|---|---|
| 1. Session persistence | | | 20.1 |
| 2. Offline queue + sync | | | 20.1 |
| 3. Photo capture/upload | | | 20.1 |
| 4. First launch, no connectivity | | | (confirm matches documented limitation) |
| 5. Chrome-less rendering | | | 20.2 / 20.4 (deployment) |

Once all 5 are logged, report back the results here (or update `sprint-status.yaml`'s
`20-5-manual-qa-parity-pass` directly: `done` if all pass, otherwise note which scenario(s)
blocked it and file the resulting defect against the story named in the table above).
