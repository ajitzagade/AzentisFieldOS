---
epic: 1
story: "1.7"
phase: "1 — Foundation"
title: Accessibility & Performance CI Gate
---

# Story 1.7: Accessibility & Performance CI Gate

As the Development Team,
I want `eslint-plugin-jsx-a11y` and Lighthouse CI wired into every PR touching `apps/web`,
So that WCAG AA and the >95 Lighthouse budgets (AD-15) are enforced automatically, not left to discretionary review.

## Acceptance Criteria

**Given** a PR that modifies any file under `apps/web`
**When** CI runs
**Then** `eslint-plugin-jsx-a11y` errors block merge
**And** a Lighthouse CI run reports Performance/Accessibility/Best Practices/SEO scores, failing the check if any drops below 95
**And** this gate is documented in `AGENTS.md`'s Running and verifying section, replacing the current TODO placeholder

## References

- Architecture AD-15
- `AGENTS.md` (current TODO this story resolves)
