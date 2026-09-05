# Epic 21 Context: Web Push Notifications

<!-- Compiled retroactively (2026-09-06) — this epic was built directly per user instruction, without a formal spec-first pass, then documented and code-reviewed after the fact. Edit freely. -->

## Goal

Give both roles a way to learn about important events without having to be looking at the app: a curated set of high-value, event-driven pushes (Daily Report submitted, Purchase pending pricing, Site Contract pending terms, Team/Subcontractor Payment recorded) plus a code-complete but not-yet-scheduled time-based reminder for Sites missing today's Daily Report. Built on the standard Web Push API + VAPID (`web-push` npm package) — no Firebase/FCM SDK, no vendor account, free at any scale. Works identically across the installed PWA and the Android TWA (epic 20) since both share the exact same origin, service worker, and push subsystem; iOS Safari only supports this for an installed PWA (16.4+).

This was explicitly scoped to avoid the token-burning back-and-forth the user had previously experienced with notifications on another project: every claim about the feature working was required to be backed by real, demonstrated proof (a real FCM subscription, a real DB row, a real API-triggered send, a real displayed notification), not assumption — and a full adversarial code review round was required before considering the feature done.

## Stories

- Story 21.1: Web Push Notifications (event-driven triggers, subscribe/unsubscribe UI, missing-report-reminders cron endpoint)

## Requirements & Constraints

- No Firebase/FCM SDK, no per-message cost, no vendor account beyond the free, standard Web Push/VAPID mechanism (Chrome's transport happens to be FCM internally — irrelevant to the app code, which never touches a Firebase SDK or config).
- Both `OWNER_ADMIN` and `SITE_SUPERVISOR` can subscribe — a per-device opt-in, not a role restriction.
- The acting user is always excluded from a push confirming their own action (an Owner/Admin who records their own Payment doesn't get pinged about it).
- A push failure must never fail or roll back the write that triggered it — this is a best-effort supplementary channel, not FR-33's report-delivery guarantee.
- `PushSubscription` is session/config state (AD-9's append-only rule does not apply) — a dead subscription (push service returns 404/410) is deleted outright, not corrected.
- Deferred, explicitly out of scope for this pass: e2e/Playwright coverage of the push flow, a component test for the sidebar's push UI states, proactive pruning of abandoned subscriptions beyond reactive 404/410 cleanup, and a proper monochrome notification badge asset (currently reuses the full-color app icon).
- Blocked, not this epic's problem to solve: the time-based missing-report-reminders cron is code-complete and tested but not actually invoked in production — blocked on the pre-existing Vercel Hobby 2-cron-job limit (AGENTS.md TODO), which already blocks three other crons.
