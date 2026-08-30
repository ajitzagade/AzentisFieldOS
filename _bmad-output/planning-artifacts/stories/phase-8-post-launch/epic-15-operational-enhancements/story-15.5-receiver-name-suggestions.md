---
epic: 15
story: "15.5"
phase: "8 — Post-launch Enhancements"
title: Team-name suggestions on receiver/person fields
status: Implemented 2026-08-30 (commit b853c73) — written retroactively alongside the build
---

# Story 15.5: Team-Name Suggestions on Receiver/Person Fields

As Owner/Admin or Site Supervisor,
I want the Receiver Name (Purchases) and Person Responsible (Movements) fields to suggest my Team Members as I type — while still accepting any outside name,
So that recording who received or handled material is one tap for the common case without forcing everyone into the Team roster.

## Acceptance Criteria

**Given** the Receiver Name field on the Purchase / Vendor→Site forms, or Person Responsible on the Movement / Site→Site forms
**When** I start typing
**Then** active Team Member names are suggested (native datalist — works on mobile, no new component)
**And** any free-typed name is accepted and stored as plain text on that record only — it is never added to the Team roster
**And** a failed Team Member lookup degrades to a plain text field, never blocking the form

## References

- FR-8 (Purchase fields), FR-9/FR-11 (Movement fields), FR-19 (Team Members)
