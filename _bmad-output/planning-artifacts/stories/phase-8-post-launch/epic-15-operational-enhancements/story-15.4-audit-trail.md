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
**And** login/cron/presign requests are never logged, and an audit-write failure never fails the user's own request

**Given** Settings → Audit Log as Owner/Admin
**Then** I see the newest 200 entries filterable by Site, user, and date range, with Site names resolved even for soft-deleted Sites; a Supervisor gets 404/403

## References

- Complements AD-9 (corrections carry reasons; the trail adds who/when across everything)
- FR-48 (roles — read access is OWNER_ADMIN-only)
