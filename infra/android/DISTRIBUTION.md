# Manual distribution runbook (story 20.6)

How to get a Tenant's signed APK (`infra/android/build.ts`, story 20.1) onto a
Supervisor's or Owner's phone. Sideloading, not a Play Store listing — this is
manual, human-operated distribution, the same way every provisioning step in
this repo is a scripted-or-documented procedure rather than an ad hoc
per-Tenant judgment call.

Precondition: `infra/android/dist/<slug>.apk` already exists and is signed —
build it first via this file's own "Usage" section above if it doesn't.
Before sending it anywhere, install it on your own (or a spare internal)
device and confirm it opens full-screen with no address bar — story 20.5's
release-blocking chrome-less check (`qa-20-5-manual-parity-checklist.md`,
scenario 5). Catch that failure yourself; don't let a client be the one who
finds it.

## 1. Distribution path

**Double-check the slug before sending.** Every Tenant's APK is signed with
the same shared keystore (see this file's parent README) — the file itself
carries no visible tenant label once renamed or forwarded, so confirm
`infra/android/dist/<slug>.apk`'s `<slug>` actually matches the Tenant you're
about to send it to before attaching it.

**Send the APK as a WhatsApp document attachment, directly, to the Tenant's
contact number** (`infra/tenants/<slug>.json`'s `contact.phone`).

This is a plain human action from your own WhatsApp (mobile app or WhatsApp
Web) — attach `infra/android/dist/<slug>.apk` as a file, same as sharing any
other document. WhatsApp supports document attachments well over the ~1MB
size of this APK (verified in story 20.1). No new tooling, no code, nothing
to build.

**This is deliberately not the same thing as this codebase's automated
report-delivery WhatsApp channel** (FR-33/FR-50, `apps/api/src/reports/`).
That channel is not usable for this or anything else today —
`NotConfiguredWhatsAppSender` unconditionally rejects every send with
`"WhatsApp BSP not yet selected (PRD Open Question 3)"`, because the actual
BSP vendor (Gupshup vs. Interakt vs. AiSensy) is a deferred founder/pricing
decision, not an engineering one (see `PRE-LAUNCH-CHECKLIST.md`,
`deferred-work.md`). Every existing Tenant config also has
`notificationChannels.whatsapp: false`. Do not wait on that channel, and do
not describe this manual send as "using" it — they're unrelated. If/when a
BSP is selected and that channel goes live, revisit whether it's worth
automating this handoff too; nothing about this runbook depends on that ever
happening.

Email (already working, `RESEND_API_KEY`/`REPORT_EMAIL_FROM`) is a fallback
if a Tenant's contact number is missing or WhatsApp isn't available to
them — attach the APK the same way, to `contact.email`.

## 2. What to tell the client *before* they install

Android will show a one-time-per-device **"Install unknown apps"**
permission prompt the first time this specific APK is opened. Say this (or
equivalent) *before* they tap install, so the prompt reads as expected, not
as a warning something is wrong — substitute "WhatsApp" or "your email app"
below for whichever channel you actually sent it through:

> "Your phone will ask permission to install apps from [WhatsApp / your
> email app]. That's normal for apps we hand you directly instead of the
> Play Store — it's not a security warning about our app specifically, it's
> Android's standard check for any app installed this way. Tap **Settings**,
> then turn on **Allow from this source**, then go back and tap install
> again."

Do not tell them to "ignore the warning" or "just tap through it" — naming
what the prompt actually is (Android's standard unknown-sources gate, not an
antivirus flag) is what prevents it from looking untrustworthy.

**Two things this specific prompt is not, worth distinguishing if a client asks:**
- **Older phones (Android 7 and below):** there's no per-app prompt — it's a
  single systemwide **Settings → Security → Unknown sources** toggle instead.
  Same idea, different screen; field devices skew older/lower-end, so don't
  assume the per-app flow above is what they'll actually see.
- **Google Play Protect** may separately scan the file after install and show
  its own "app may be harmful"/blocked warning — this is a different prompt
  from "Install unknown apps," triggered by Play Protect not recognizing an
  app outside the Play Store, not by anything actually wrong with this APK.
  If it appears, the client can tap **More details → Install anyway**; this
  is expected for any sideloaded app on a Play-Protect-enabled device, not a
  signal to stop.

## 3. Install steps

1. Client opens the APK file from WhatsApp (or their email attachment).
2. Android shows "Install unknown apps" — client follows the explanation
   above, grants the one-time permission, taps install.
3. Client opens the installed app, signs in with their existing
   username/password (same credentials as the browser — this is the same
   backend, not a separate account).
4. The app should open full-screen with no address bar — same as your own
   pre-send check above. If the client sees one anyway (a device/DAL
   verification issue can be device-specific even after your own check
   passed), that's still story 20.5's chrome-less check failing for them;
   don't leave them using it in that state — investigate before they rely on
   it for real work.

## 4. When a rebuild is required

**Any shell-level change — new icon, renamed app, changed domain — has no
silent auto-update path.** There is no Play Store listing, so there is no
update channel for anything baked into the native shell at build time
(`infra/android/build.ts`'s `TwaManifest.fromWebManifest` step, story 20.3).
Concretely:

- Changing `NEXT_PUBLIC_APP_DISPLAY_NAME`, the tenant's icon/branding, or the
  tenant's domain on the live web deployment does **not** update an
  already-installed APK's icon, name, or splash screen.
- To reflect that change, rebuild (`pnpm android:build -- ...` against that
  Tenant's updated manifest URL, same `--package-id`/`--slug`, same shared
  keystore) and redistribute the new APK through this same runbook — the
  client re-installs over the old one.
- **Content updates need none of this.** The app renders the Tenant's live
  site every time it's opened — a Daily Report UI change, a new feature, a
  bug fix on the web side, all show up automatically on next open, exactly
  like refreshing a browser tab. Only shell-level (icon/name/domain/package
  id) changes need a rebuild + reinstall.
- Re-installing with the **same** `--package-id` and the **same** shared
  signing key is a normal upgrade (Android treats it as updating the
  existing app, keeping any local state). A different package id or a
  different signing key is a *new*, separate app install, not an update —
  see `infra/android/README.md`'s package-id-is-permanent-identity note.
