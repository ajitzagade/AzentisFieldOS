---
epic: 6
story: "6.2"
phase: "4 — People & Money"
title: Record Daily Work Record / Attendance
---

# Story 6.2: Record Daily Work Record / Attendance

As Site Supervisor or Owner/Admin,
I want to record which Team Members were present at a Site on a given date, with attendance, hours, and overtime,
So that labour presence is tracked accurately per Site per day.

## Acceptance Criteria

**Given** a Team Member already has a Work Record at Site A for a given date
**When** I try to record a Work Record for that same Team Member at Site B on the same date
**Then** the second entry is rejected — a Team Member cannot have two Work Records at two different Sites on the same date (FR-20)
**And** the attendance entry defaults from the previous day's crew at that Site for faster entry

## References

- FR-20
