---
epic: 20
story: "20.5"
phase: "8 — Post-launch Enhancements"
title: Manual QA Parity Pass Inside the Wrapped Shell
---

# Story 20.5: Manual QA Parity Pass Inside the Wrapped Shell

As Owner/Admin,
I want the Android app to behave identically to using the site in Chrome for the things that matter most in the field,
So that Supervisors can rely on it for Daily Reports without hitting a surprise gap the web app doesn't have.

This story is a manual verification pass against a real built APK (Stories 20.1–20.4) on a real Android device, not new implementation work.

## Acceptance Criteria

**Given** a Supervisor signs in inside the installed APK
**When** they close and reopen the app later
**Then** they remain signed in exactly as they would in Chrome — the existing cookie-based session (`lib/auth-cookies.ts`) persists with no separate re-authentication required

**Given** the device goes offline mid-session after the app has already been opened online at least once
**When** a Daily Report is submitted while offline
**Then** it queues via the existing Dexie/IndexedDB offline queue and syncs automatically on reconnect (FR-29), identically to the browser experience

**Given** a Daily Report photo is added from within the wrapped app
**When** the device's camera or gallery is used
**Then** the photo attaches and uploads exactly as it does in the browser, with no missing permission prompt, broken file picker, or silently-dropped upload

**Given** the device has never opened the app before and has no network connectivity at first launch
**When** it's launched
**Then** the resulting behavior is confirmed against the epic's documented "Known Limitations" — treated as expected, not logged as a new defect

**Given** the Tenant's `assetlinks.json` (Story 20.2) is correctly served
**When** the app is opened
**Then** it renders fully chrome-less (no address bar) — if it doesn't, this pass fails and blocks distribution until 20.2 is fixed

## References

- Exercises Stories 20.1–20.4 end-to-end; any failure here is a defect in one of those stories, not new scope.
