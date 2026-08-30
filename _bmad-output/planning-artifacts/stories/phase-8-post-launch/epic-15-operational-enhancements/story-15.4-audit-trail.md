---
epic: 15
story: "15.4"
phase: "8 — Post-launch Enhancements"
title: Audit trail (who changed what, where, when)
status: Implemented 2026-08-30 (commit b853c73) — written retroactively alongside the build
---

# Story 15.4: Audit Trail

As the Owner/Admin,
I want an automatic log of every change — who made it, what it was, on which Site, and when,
So that when something looks wrong I can trace exactly who did what without asking around.

## Acceptance Criteria

**Given** any signed-in user performing any successful create, update, correction, or delete
**Then** an AuditLog row is written automatically (global interceptor — every current and future write endpoint is covered by construction, with no per-feature code)
**And** the row records the acting user, a plain-language action ("Created Purchase", "Corrected Daily Site Report", "Deleted Site"), the entity, the Site where the write named one, and the timestamp

**Given** the audit trail
**Then** rows are write-once — no endpoint can ever edit or remove them
**And** login/cron/presign requests are never logged (and by design, only requests with a signed-in user are audited — a guard-exempt route has no actor to attribute), and an audit-write failure never fails the user's own request

**Given** Settings → Audit Log as Owner/Admin
**Then** I see the newest 200 entries filterable by Site, user, and date range, with Site names resolved even for soft-deleted Sites; a Supervisor gets 404/403

## References

- Complements AD-9 (corrections carry reasons; the trail adds who/when across everything)
- FR-48 (roles — read access is OWNER_ADMIN-only)

## Review Findings (code review 2026-08-30, commits b853c73+80be98e)

- [x] [Review][Patch] Audit write can be silently lost on Vercel — fire-and-forget inside tap(): the response returns before the insert settles and the function may freeze. Await the write in the pipeline (keep failure isolation) [apps/api/src/audit/audit-log.interceptor.ts:85-93]
- [x] [Review][Patch] Movement / asset-movement audit rows never carry a Site — interceptor only reads body/response siteId; Movements use sourceSiteId/destinationSiteId, so every movement logs Site "—" and is invisible to the Site filter [audit-log.interceptor.ts]
- [x] [Review][Patch] AuditLog has no indexes — occurredAt DESC + siteId + userId needed for the filtered latest-200 read on a forever-growing table [infra/prisma/schema.prisma]
- [x] [Review][Patch] POST /branding-config/logo/presign is audited as a misleading "Created Branding Config" — presigns must be skipped per AC [audit-log.interceptor.ts SKIP_PREFIXES]
- [x] [Review][Patch] Audit page Site filter can never select a soft-deleted Site (options come from GET /sites which hides them) — augment options with the sites present in the returned rows [apps/web/app/(app)/settings/audit-log/page.tsx]
- [x] [Review][Patch] "When" timestamps render in server timezone (UTC on Vercel → 5.5h off) — pass timeZone Asia/Kolkata like the dashboard heading [settings/audit-log/page.tsx:formatDateTime]
- [x] [Review][Patch] Hardening: SKIP_PREFIXES uses raw startsWith (match on segment boundary); audit PUT too; story wording — guard-exempt routes (no req.user) are unaudited by design [audit-log.interceptor.ts, story-15.4]
- [x] [Review][Patch] Missing tests: interceptor unit spec (skip rules, action naming, siteId chain, failure isolation), audit controller spec (OWNER_ADMIN metadata, deleted-Site name resolution), dashboard deletedAt where-clause assertion
- [x] [Review][Defer] Invalid from/to query strings 500 instead of 400 — pre-existing dateRangeBounds pattern shared by all report endpoints — deferred, pre-existing
- [x] [Review][Defer] User FK now RESTRICTs a hard user delete — no user-delete endpoint exists today; map P2003 to 409 if one is ever added — deferred
- [x] [Review][Defer] Repo-wide toLocaleString without timeZone on other pages — pre-existing; only the new audit page is patched now — deferred, pre-existing
