---
baseline_commit: 057ff73068e07b4912c7352b1dbfdf89cadbd65f
---

# Story 14.4: Notification Channel Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to configure which channels (WhatsApp/Email/in-app) receive automated reports, and to whom,
so that the right people get the daily report without me forwarding it manually.

## Acceptance Criteria

1. **Given** I configure a notification channel and recipient list, **when** the next automated report compiles, **then** it delivers to exactly the configured channels and recipients. (FR-50)
2. This governs Epic 13 Story 13.1's daily-DSR-report delivery specifically — Story 14.5 governs the separate report set (Site/Inventory/Labour/Financial) independently, per FR-51's explicit "independent of FR-50" framing.

## Tasks / Subtasks

- [x] Task 1 — Schema addition (AC: #1)
  - [x] Epic 13 Story 13.1 hardcoded its enabled-channels set (`EMAIL` + `IN_APP`, `WHATSAPP` blocked on the undecided BSP) and its recipient list (every `OWNER_ADMIN` User's email) as a scoped, sensible default — this story replaces both with real configuration. Add `model NotificationChannelSetting { id String @id @default(uuid(7)), channel String, enabled Boolean @default(false), recipientUserIds String[] @default([]) }`, seeded with the same three rows Story 13.1's defaults implied (`EMAIL`: enabled, recipients = current `OWNER_ADMIN` user ids at seed time; `IN_APP`: enabled, recipients irrelevant — in-app "delivery" has no per-user targeting, every Owner/Admin can already see it in the product; `WHATSAPP`: disabled, empty recipients) so this story's migration doesn't silently change Story 13.1's already-working delivery behavior on day one. Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1)
  - [x] Create `packages/shared/src/schemas/notification-channel-setting.ts`: `updateNotificationChannelSettingSchema` (`{ enabled: z.boolean(), recipientUserIds: z.array(z.uuid()) }`), keyed by `channel` in the route, not the body.
- [x] Task 3 — `apps/api` (AC: #1)
  - [x] `apps/api/src/reports/notification-settings.controller.ts` + `.service.ts` (same `ReportsModule` as Story 13.1/14.1 — this is report-delivery configuration, it belongs alongside `ReportDeliveryService`, not a new module). `GET /notification-settings`, `PATCH /notification-settings/:channel`.
  - [x] `apps/api/src/reports/report-delivery.service.ts` (Story 13.1, modify): read the enabled channels and recipient list from `NotificationChannelSetting` instead of the hardcoded default — this is the one behavioral change in `ReportDeliveryService` this story makes; everything else about how a channel actually sends (Resend for Email, the `WhatsAppSender` adapter, in-app's immediate-mark-sent) is untouched.
  - [x] The `WHATSAPP` row can be toggled `enabled: true` in this UI even though Story 13.1's adapter is still the `NotConfiguredWhatsAppSender` placeholder (the BSP decision is still, as of this story, unmade) — enabling it here doesn't make WhatsApp delivery work, it just means `ReportDeliveryService` will *attempt* it and record the same honest `WhatsApp BSP not yet selected` failure Story 13.1 already produces. Don't block the toggle on the BSP decision; the toggle is real configuration, the underlying capability is what's still pending.
- [x] Task 4 — `apps/web` UI (AC: #1)
  - [x] Extend `apps/web/app/(app)/settings/page.tsx` (Stories 14.1–14.3) with a "Notification Channels" section: one row per channel (Email/WhatsApp/In-App), an enable toggle, and a recipient picker (multi-select over existing `User`s, Story 14.2's `GET /users`) shown only when the channel is enabled. WhatsApp's row shows the same "not yet available" framing Story 13.1 established for its delivery-status badge, so an Owner/Admin toggling it on understands why nothing arrives yet, rather than assuming a bug.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod test for the update schema.
  - [x] `notification-settings.service.spec.ts`: update persists correctly; `report-delivery.service.spec.ts` (extend Story 13.1's) confirms delivery now reads from `NotificationChannelSetting` — disabling Email means no `ReportDelivery` row is created for that channel on the next compile, and a changed recipient list is honored on the very next run.

## Dev Notes

**This story replaces Story 13.1's hardcoded delivery defaults — read that story first, this one is a small, precise swap, not new delivery machinery.** The channel-send logic (`ReportDeliveryService`, the `WhatsAppSender` adapter interface, the retry/failure-surfacing behavior) is entirely Story 13.1's; this story only changes *which channels are enabled* and *who receives them*, both of which move from hardcoded to `NotificationChannelSetting`.

**Depends on**: Story 13.1 (`ReportsModule`, `ReportDeliveryService`) and Story 14.2 (`GET /users`, for the recipient picker).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7.

### Project Structure Notes

- New `notification-settings.controller.ts`/`.service.ts` in `apps/api/src/reports/` (Story 13.1). One modification to `report-delivery.service.ts` (Story 13.1).
- Extends `apps/web/app/(app)/settings/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-14] (FR-50)
- [Source: _bmad-output/planning-artifacts/stories/phase-7-administration/epic-14-tenant-configuration-settings/story-14.4-notification-channel-configuration.md]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md — the hardcoded defaults this story replaces, and the WhatsApp-adapter placeholder this story's toggle doesn't unblock]
- [Source: _bmad-output/implementation-artifacts/14-2-users-roles-permissions.md — GET /users, used for the recipient picker]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/17-settings.html]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

### Completion Notes List

- Added `NotificationChannelSetting` model (`channel` `@unique` as the natural PATCH key, `enabled`, `recipientUserIds String[]`). Committed migration `infra/prisma/migrations/20260826190818_add_notification_channel_setting/`.
- Shared `updateNotificationChannelSettingSchema` (`{ enabled, recipientUserIds: array(uuid) }`, keyed by channel in the route).
- New `NotificationSettingsController`/`Service` in `ReportsModule`: `GET /notification-settings`, `PATCH /notification-settings/:channel`. Both `@Roles('OWNER_ADMIN')` (admin surface).
- `ReportDeliveryService` now reads enabled channels + recipients from `NotificationChannelSetting` instead of the hardcoded `ENABLED_CHANNELS` / all-Owner/Admin default. Channel-send mechanics (Resend Email, NotConfigured WhatsApp placeholder, in-app no-op) untouched; recipient resolution changed from `where role=OWNER_ADMIN` to the setting's `recipientUserIds`.
- Seed adds the three rows matching Story 13.1's hardcoded defaults exactly (EMAIL enabled → current Owner/Admin ids; IN_APP enabled; WHATSAPP disabled) so day-one delivery behavior is unchanged. Idempotent `upsert` with `update: {}`.
- Settings "Notification Channels" section: per-channel enable toggle + recipient multi-select over Active users (shown when enabled); WhatsApp carries the "not yet available" framing.
- Extended `report-delivery.service.spec` to prove disabling Email creates no EMAIL `ReportDelivery` row on next compile, and a changed recipient list is honored on the next run. WhatsApp can be toggled enabled (records the honest placeholder failure).
- Verified: api test (749 pass) + typecheck; web typecheck/lint/test/build; shared typecheck.

### File List

- infra/prisma/schema.prisma (NotificationChannelSetting)
- infra/prisma/migrations/20260826190818_add_notification_channel_setting/migration.sql (new)
- infra/prisma/seed.ts (seed three channel rows)
- packages/shared/src/schemas/notification-channel-setting.ts (new), packages/shared/src/index.ts
- apps/api/src/reports/notification-settings.controller.ts, notification-settings.service.ts (+ .service.spec.ts) (new)
- apps/api/src/reports/report-delivery.service.ts (reads NotificationChannelSetting) (+ .spec.ts extended)
- apps/api/src/reports/reports.module.ts (register controller/service)
- apps/web/app/(app)/settings/notification-channels-section.tsx (new)
- apps/web/app/(app)/settings/page.tsx (Notification Channels card + fetch)
