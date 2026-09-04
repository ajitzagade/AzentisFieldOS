---
epic: 20
story: "20.1"
phase: "8 — Post-launch Enhancements"
title: TWA Wrapper Build Template & Signing Key
---

# Story 20.1: TWA Wrapper Build Template & Signing Key

As the team onboarding a new Tenant,
I want a single, reusable Android TWA wrapper project and one shared release-signing key,
So that generating a Tenant's Android app is a config swap against an existing template, not a new native project built by hand each time.

This is the foundation story: it ships no Tenant-facing output on its own, but every later story in this epic builds on the template and key it produces.

## Acceptance Criteria

**Given** the wrapper template is pointed at a target `manifest.webmanifest` URL and package name via config
**When** it is built
**Then** the resulting APK opens that URL full-screen with no address bar, rendering through Chrome's engine (not a bundled/embedded copy of the UI)

**Given** a single release-signing key is generated once and stored outside the repo (not committed)
**When** every Tenant's APK is signed with that same key
**Then** the same SHA-256 certificate fingerprint is valid for Digital Asset Link verification across all Tenants (consumed by Story 20.2) — one key to protect and rotate, not one per Tenant

**Given** the build is invoked with a target domain, package name, and Tenant slug
**When** it completes
**Then** it emits a signed release APK artifact named per Tenant slug, with no manual Android Studio steps required to reproduce the build

## References

- Epic 20's "Known Limitations" section — this story does not change any of those constraints, it only produces the shell that inherits them.
