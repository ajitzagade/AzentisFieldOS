---
epic: 5
story: "5.7"
phase: "3 — Materials & Inventory"
title: Stock Lifecycle Visibility & Low-Stock Flagging
---

# Story 5.7: Stock Lifecycle Visibility & Low-Stock Flagging

As Owner/Admin,
I want full stock visibility per Material/Size/Site/Godown, always derived from transaction history, with low-stock flagged automatically against a configured threshold,
So that I catch a shortage before it stalls work, not after.

## Acceptance Criteria

**Given** any combination of Purchase/Movement/Consumption/Wastage entries for a Material
**When** I view its stock lifecycle
**Then** the displayed quantity always reconciles exactly to the sum of its transaction history — never a manually-editable "current stock" field (FR-14)

**Given** a Material's stock falls below its configured per-Material threshold
**When** I view Inventory
**Then** a Gap Flag names the exact Material and threshold, with a direct "Transfer Stock" action, never a bare warning badge (FR-36)

## References

- FR-14, FR-36
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/05-inventory.html`
