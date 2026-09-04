---
title: 'Manual Distribution Runbook'
type: 'feature'
created: '09-04-2026'
status: 'done'
route: 'one-shot'
---

# Manual Distribution Runbook

## Intent

**Problem:** Nobody has a documented way to actually get a Tenant's signed APK (Story 20.4's output) onto a client's phone, or to explain the "install unknown apps" prompt so it doesn't read as a security problem — and the story's own acceptance criteria assumed an "existing WhatsApp BSP channel already used for report delivery" that turned out, on investigation, to be a stub (`NotConfiguredWhatsAppSender`) that unconditionally throws, blocked on an unmade BSP vendor decision.

**Approach:** Write `infra/android/DISTRIBUTION.md` documenting the distribution path that's actually available today — a human manually sending the APK as a WhatsApp/email document attachment, explicitly distinguished from the unrelated, unimplemented automated report-delivery channel — plus the exact client-facing explanation for the install-unknown-apps prompt (and its Play-Protect and older-Android variants), and the rebuild-and-redistribute rule for shell-level branding changes (no silent auto-update, no Play Store listing).

## Suggested Review Order

- Precondition + pre-send self-check, and why the runbook corrects the story's own false premise about an "existing" WhatsApp channel.
  [`DISTRIBUTION.md:9`](../../infra/android/DISTRIBUTION.md#L9)

- The actual distribution mechanism, and the explicit split from `apps/api`'s unimplemented automated WhatsApp sender.
  [`DISTRIBUTION.md:34`](../../infra/android/DISTRIBUTION.md#L34)

- Client-facing script for the install-unknown-apps prompt, plus the Play Protect / older-Android variants a client might see instead.
  [`DISTRIBUTION.md:60`](../../infra/android/DISTRIBUTION.md#L60)

- Rebuild-and-redistribute rule for shell-level changes — no silent auto-update without a Play Store listing.
  [`DISTRIBUTION.md:101`](../../infra/android/DISTRIBUTION.md#L101)

- Pointer from the build doc so a reader following the build steps actually finds this file.
  [`README.md:134`](../../infra/android/README.md#L134)
