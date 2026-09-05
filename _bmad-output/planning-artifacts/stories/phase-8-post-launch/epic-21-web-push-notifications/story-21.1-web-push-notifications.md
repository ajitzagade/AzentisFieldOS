---
epic: 21
story: "21.1"
phase: "8 — Post-launch Enhancements"
title: Web Push Notifications
---

# Story 21.1: Web Push Notifications

As an Owner/Admin or Site Supervisor,
I want to receive a push notification for the handful of events that actually need my attention,
So that I don't have to keep the app open or check it repeatedly to know when a Daily Report is submitted, a Purchase needs pricing, a Site Contract needs terms, or a Payment is recorded.

## Acceptance Criteria

**Given** I am signed in on a device that supports Web Push (service worker + PushManager + a configured VAPID key)
**When** I open the sidebar
**Then** I see an "Enable notifications" control, or "Notifications on" if this device already has a live subscription, or a blocked-permission hint if the browser has denied notifications for this site

**Given** I tap "Enable notifications" and grant the browser permission prompt
**When** the subscription is created
**Then** it is saved against my user, and the button now reads "Notifications on"

**Given** a Daily Report is submitted for a Site for the first time today
**When** the submission commits
**Then** every `OWNER_ADMIN` (other than the submitter, if they are also an Owner/Admin) receives a push naming the Site, linking to that Daily Report

**Given** the same Site/date's Daily Report is resubmitted (an offline-sync retry)
**When** the retry commits
**Then** no additional push is sent — only the first submission for a Site/date notifies

**Given** a Purchase is recorded with no rate/totalAmount (D7 "pricing pending")
**When** it is not a correction
**Then** every `OWNER_ADMIN` (other than the recorder) receives a "Purchase needs pricing" push linking to that Purchase's pricing page

**Given** a Site Contract is created as Draft and still missing a required term (work category, rate type, start date, or the rate-type-appropriate rate/fixed amount)
**When** it is created
**Then** every `OWNER_ADMIN` (other than the creator) receives a "Site Contract needs terms" push linking to that contract

**Given** a Team Payment or Subcontractor Payment is recorded
**When** it is not a correction
**Then** every `OWNER_ADMIN` (other than the recorder) receives a "Payment recorded" push naming who it was for

**Given** a push notification is delivered
**When** the user taps it
**Then** the service worker focuses an already-open tab on the linked page if one exists, or opens a new one

**Given** a subscribed device's push registration has gone dead (the push service returns 404/410)
**When** the next send to it fails that way
**Then** the subscription row is pruned automatically, without affecting delivery to any other device

## References

- Built directly per user instruction, no pre-implementation spec — this story and its `implementation-artifacts/spec-21-1-web-push-notifications.md` sibling were written retroactively (2026-09-06) as the documented record, after a full code-review pass.
- `AGENTS.md`'s Web Push TODO entry (2026-09-05, reviewed 2026-09-06) for current status, verification state, and the blocked missing-report-reminders cron.
- `_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-20-android-app-distribution/` — confirms the Android TWA shares the same origin/service worker/push subsystem as the PWA, so this feature needs no Android-specific code path.
