# Feature Plan — Material Dispatch (per-trip sales to third parties)

**Date:** 2026-08-30 · **Status:** SUPERSEDED — direction reversed same day. The owner's actual need turned out to be the **cost** flow (the contractor PAYS per trip to remove waste), not the income flow planned here. That was built and shipped as the **Waste & Disposal module** (2026-08-30): `WasteDisposal` append-only table (own/hired, trips × rate + other charges server-computed, payment status for hired parties), `/waste-disposals` API with summary breakdowns (own-vs-hired, by vendor, by waste type, by site, date-ranged), "Waste & Disposal" nav surface with filterable list + entry + correction forms, site activity-feed integration, and a sixth site-tagged category in the FR-46 financial report. This income-side plan below stays valid as a possible future feature (selling murum/surplus to buyers) — its Buyer/receivable design is unaffected.

**Original decisions confirmed with owner (income flow):** catalog-material dispatches deduct site stock (free-text waste never does); full receivable tracking (trips + payments + outstanding) in Phase 1; entry via both a DSR section and a standalone form.

## The business need

Sites generate sellable outbound material — excavated earth (murum), debris/malba, or surplus catalog material — that third parties take away by the truckload and pay for **per trip**. Today this lives in notebooks. This is the product's **first income/receivable flow**: everything existing tracks money going out.

## Glossary terms (use verbatim)

- **Buyer** — the third party who takes material and pays. Deliberately NOT a Vendor: vendor screens sum what the contractor owes; buyer screens sum what is owed *to* the contractor. One table serving both would corrupt both outstanding figures.
- **Dispatch** — one recorded outbound entry: material × trips × rate per trip for a Buyer from a Site.
- **Buyer Payment** — money received from a Buyer.

## Data model (all additive — no existing-table changes)

```
Buyer          id, name, contactPerson?, phone?, address?, notes?, isActive, createdAt, updatedAt

Dispatch       id, siteId→Site, buyerId→Buyer,
               materialSizeId?→MaterialSize  // catalog path: decrements SiteStock (floor-checked)
               materialDescription?          // free-text path (e.g. "Murum"): no stock effect
               // exactly one of the two, enforced in the shared Zod schema
               tripCount Int, ratePerTrip Decimal,
               totalAmount Decimal           // SERVER-computed tripCount × ratePerTrip — never typed
               vehicleDetails?, challanPhotoUrl?,   // reuses the existing challan presign flow
               dispatchedAt, dailySiteReportId?, clientGeneratedId? @unique,  // DSR offline idempotency (AD-8)
               recordedByUserId, correctsId?, reason?, createdAt

BuyerPayment   id, buyerId→Buyer, amount Decimal, paymentMethod?, receivedAt,
               note?, dispatchId?,           // set when auto-created by "payment received now"
               correctsId?, reason?, createdAt
```

**Append-only (AD-9):** Dispatch and BuyerPayment join the never-UPDATE/never-DELETE transaction tables; corrections are new reason-carrying rows. Correction semantics follow the **fixed** convention (post-P0-2 lesson): signed `tripCount` delta with server-computed **signed** `totalAmount` — never a forced-positive amount on a negative delta. Catalog-material corrections reverse/apply stock with the floor check in both directions.

**Outstanding per Buyer** (computed on read, never stored):
`Σ Dispatch.totalAmount − Σ BuyerPayment.amount` — with the superseded-DSR filter (`currentDsrRowsWhere`) on DSR-linked dispatch rows, same as every other aggregate.

**"Payment received now"**: buyers commonly pay cash per trip on the spot — the dispatch entry form carries a toggle that creates the matching BuyerPayment in the same transaction (linked via `dispatchId`). One entry, ledger stays correct.

## API surface

| Endpoint | Notes | Roles |
|---|---|---|
| `POST/GET /buyers`, `GET /buyers/:id`, `PATCH /buyers/:id` | master data; PATCH OWNER_ADMIN (lookup-table convention) | as noted |
| `GET /buyers/:id/summary` | dispatched total, received total, outstanding | any |
| `POST /dispatches` | create + corrections (correctsId), stock decrement when catalog material, optional inline payment | any |
| `GET /dispatches?siteId&buyerId&from&to`, `GET /dispatches/:id` | history | any |
| `POST /buyer-payments`, `GET /buyer-payments?buyerId` | receipts + corrections | any (revisit with P0-3 role lockdown) |
| DSR extension | `createDsrSchema` gains `dispatches[]` (clientGeneratedId upsert; stock difference-application like consumptions) | — |

Zod schemas in `packages/shared` (AD-7), consumed by both apps. Validation: exactly one of materialSizeId/materialDescription; positive tripCount & ratePerTrip on originals; signed on corrections.

## Web UI

- **Supervisor**: "Material dispatched" section in the mobile DSR (Buyer combobox, catalog-Material picker *or* free-text description, Trips, Rate with computed total shown, "Payment received now" toggle) + standalone `/dispatches/new?siteId=` quick form with the money-movement confirm dialog.
- **Owner**: `Buyers` nav item beside Vendors; buyers list (name, phone, dispatched ₹, received ₹, outstanding badge); buyer detail (summary tiles, dispatch history with challan links, payment history, Record Payment); dispatches join the Site activity feed (new feed type) and the site-detail control room quick actions.
- **Dashboard (Phase 2)**: "Buyer Receivable" tile in the Money row — shown as its own figure, NOT added into Cash Tied Up (receivable is inbound, tied-up is outbound; summing them fabricates a number).
- **Reports (Phase 2)**: dispatch history tab/section sliceable by site/buyer/date (RMC chips pattern). Income deliberately stays OUT of the 5-category financial cost report — mixing income into a cost rollup breaks its reconciliation; a separate "Material Sales" summary is honest.

## Phasing

- **Phase 1 (build next):** migration, shared schemas, api module (buyers/dispatches/buyer-payments + DSR extension), DSR section, standalone form, buyers list/detail, site feed + quick action, unit + DB-integration tests. All additive/safe-track.
- **Phase 2:** dashboard receivable tile, reports slice, PDF inclusion, corrections UI polish.
- **Deliberately out of scope:** gate-pass/security workflows, weighbridge integration, GST invoicing, buyer portal — ERP territory.

## Implementation cautions

1. Add Dispatch + BuyerPayment to the AD-9 policy list in AGENTS.md when building.
2. Server computes `totalAmount` everywhere (RMC/purchase lesson).
3. DSR-linked dispatch rows need `clientGeneratedId` idempotency AND superseded-DSR filtering in every aggregate from day one.
4. Site activity feed + site detail + buyer summary must reconcile by construction (read from the same rows).
5. Feed type config, empty states, and state components follow AD-5/AD-6 — no new primitives.
