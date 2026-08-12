---
epic: 14
story: "14.2"
phase: "7 — Administration"
title: Users, Roles & Permissions
---

# Story 14.2: Users, Roles & Permissions

As Owner/Admin,
I want to manage which people have accounts in my Tenant and what role they hold — Owner/Admin or Site Supervisor,
So that access matches who's actually on the team, with no third role tier or cross-tenant surface ever appearing.

## Acceptance Criteria

**Given** I invite a user to my Tenant
**When** I assign them a role
**Then** only Owner/Admin and Site Supervisor exist as options — never a Platform Operator or any cross-tenant role (AD-1, AD-11, FR-48)

## References

- FR-48, AD-1, AD-11
