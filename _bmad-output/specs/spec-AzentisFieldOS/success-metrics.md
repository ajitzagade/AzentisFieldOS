# Success Metrics

Full numeric detail behind the kernel's Success signal. Targets marked `[unratified]` are PRD-authored defaults, not yet agreed with the founder or pilot contractor — see Open Questions. This matters more than usual here: the pilot's payment is quality-contingent, so whatever "quality" ends up measured against should be a target someone actually signed off on.

## Primary

- **SM-1** — % of active Sites with a DSR submitted for the previous calendar day, measured daily. Target `[unratified]`: ≥90%. Validates CAP-8 (FR-28, FR-29).
- **SM-2** — Median time to complete and submit a DSR from the mobile surface. Target `[unratified]`: <5 minutes. Validates CAP-8 (FR-28), and the offline-performance constraint in SPEC.md.
- **SM-3** — Owner reports (qualitatively, pilot check-in) no longer needing to phone supervisors for a same-day status update. Validates CAP-9 (FR-32, FR-33), CAP-10 (FR-35).

## Secondary

- **SM-4** — A second Tenant successfully onboarded and using the platform independently, tenant-isolation-verified. Target timeframe `[unratified]`. Validates CAP-15 (FR-52, FR-53).
- **SM-5** — Stock-reconciliation variance (recorded Stock vs. physical spot-check) trends toward zero over the pilot period. Validates CAP-3 (FR-14).

## Counter-metrics (do not optimize)

- **SM-C1** — DSR submission rate (SM-1) should not be driven up by rushed, inaccurate entries just to hit the number — a fast-but-wrong DSR is worse than a slightly-late accurate one. Counterbalances SM-1, SM-2.
- **SM-C2** — Inventory data-entry speed should not be optimized at the expense of accuracy — a fabricated or guessed Stock figure is worse than an honestly-flagged unknown. Counterbalances SM-5.
