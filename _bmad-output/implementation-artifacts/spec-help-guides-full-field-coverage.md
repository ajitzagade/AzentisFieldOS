---
title: 'Help & Guides: full field coverage for the 5 existing guides'
type: 'feature'
created: '2026-09-06'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'e1b5e303ff822b2f9ed4c4da7726312cd11f99c2'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** All 5 shipped Help & Guides walkthroughs skip real form fields — e.g. the 13-field Purchase form's guide covers ~3 fields, Consumption's guide omits Consumption Date/Activity Reference/Notes — and the give-advance guide states "A short reason is required" when Reason is actually optional. A first-time user following a guide hits fields the guide never mentioned.

**Approach:** Rewrite the `steps` arrays of the 5 guides in `packages/shared/src/content/help-content.ts` so every field the reader will actually see gets its own numbered step (per the EXPERIENCE.md field-completeness rule, 2026-09-06), in the exact order the real form renders them, in the established plain-language voice. Content-only change — no schema, component, or route changes.

## Boundaries & Constraints

**Always:** One step per field, in real render order, matching real form labels verbatim. Mark optional fields as optional in the step detail ("You can leave this empty..."). Keep the existing plain-language voice (school-student readable, real construction examples like "50 bags", "₹2,000"). Keep each guide's existing `id`/`moduleId`/`title`/`result`/`tryItHref` unchanged. Fields behind the Purchase form's "More details" fold get steps introduced by one "open More details" step; note they're all optional. Purchase pricing (Rate/Total Amount/Payment Status) is OWNER_ADMIN-only (D7): cover it as steps but say plainly that Supervisors won't see these fields and should skip them — the office fills rates in later.

**Ask First:** Any change to the `GuideStep`/`Guide` interfaces; adding new guides beyond the existing 5; touching `presentation.html`.

**Never:** Do not add screenshot/selector fields to the data (deferred with the screenshot pipeline — see deferred-work.md 2026-09-06). Do not invent fields not on the real forms, and do not pad a guide with fields its reader never sees (a Supervisor's pricing-pending Purchase legitimately lacks pricing steps only if role-conditional wording is impossible — prefer the conditional wording above). Do not change the two /help page components.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Guide vs real form | Each of the 5 guides opened next to its real form | Every visible field appears as its own step, in form order, labels matching | N/A |
| Optional field | e.g. Notes, Activity Reference, Payment Method | Step exists and explicitly says it can be left empty | N/A |
| Role-conditional field | Purchase pricing group, Supervisor reader | Step states Supervisors won't see these fields; office prices later | N/A |
| Factual error fix | give-advance "reason is required" | Corrected: Reason is optional on the real form | N/A |
| Repeating DSR sub-entries | Materials/RMC/Expenses rows in submit-dsr | One step per section naming the fields inside a row (Material+Quantity; Vendor+Quantity+Grade+Rate; Category+Amount+Description) | N/A |

</frozen-after-approval>

## Code Map

- `packages/shared/src/content/help-content.ts` -- the only file to edit. `GuideStep` (lines 29–32: `{title, detail}`), `Guide` (34–42), `guides` array at line 506 (5 guides: record-consumption, create-site, record-purchase, give-advance, submit-dsr — 5/4/5/5/7 steps today). Only consumers of `.guides`: `apps/web/app/(app)/help/page.tsx` and `help/[guideId]/page.tsx`. **No test anywhere asserts on guide content** — zero test blast radius.
- Ground-truth forms (read-only, field order verified 2026-09-06):
  - Consumption (`movements/consumption/consumption-form.tsx`): Site*, Material/Size*, Quantity*, Consumption Date* (defaults today), Activity Reference, Notes. Submit "Record Consumption".
  - New Site (`sites/new/page.tsx`, inline form): Name*, Location*, Status (defaults Active), Contract reference, Description. Submit "Create Site".
  - Purchase (`movements/purchases/purchase-form.tsx`): Vendor*, Material/Size*, Destination* (Godown/Site; Site field appears only when Site chosen), Quantity*, [pricing group Rate*/Total Amount* (auto = qty × rate, overridable)/Payment Status* — OWNER_ADMIN only; Supervisors instead see "Rates & amounts are entered by the office"], Purchase Date*, then "More details" fold (closed by default, all optional): Invoice / Challan No., Challan Photo, Delivery Location, Vehicle Details, Receiver Name, Notes. Submit "Record Purchase".
  - Advance (`team/[id]/advances/advance-form.tsx`; page is OWNER_ADMIN-only, worker comes from the profile page): Amount*, Date* (defaults today), Reason (OPTIONAL — current guide wrongly says required), Payment Method (optional, "e.g. Cash, Bank Transfer"). Confirm dialog then submit "Record Advance".
  - Mobile DSR (`dsr/new/page.tsx`, `NewDsrForm`): Site* (submit disabled without it), Date* (defaults today), Work completed, Issues / blockers, "Crew present today" (pre-filled checklist + add-member combobox), "Materials consumed" repeating rows (Material+Quantity), "RMC used" repeating rows (Vendor+Quantity m³+Grade+Rate per m³), "Expenses" repeating rows (Category+Amount+Description), "Equipment used today" (add machinery/vehicle), "Site Photos" (camera/add photo). Submit "Submit Daily Report". Works offline — queued and synced later.

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/content/help-content.ts` -- rewrite `steps` for `record-consumption` (~7 steps: open, Site, Material/Size, Quantity, Consumption Date, optional Activity Reference + Notes each their own step, Save) -- full field coverage
- [x] same file -- rewrite `create-site` (~7 steps: open Sites, Add Site, Name, Location, Status, Contract reference, Description, Save) -- covers Status/Description, un-lumps "Enter details"
- [x] same file -- rewrite `record-purchase` (~13 steps: open, Record Purchase, Vendor, Material/Size, Destination (+Site when chosen), Quantity, Rate/Total/Payment Status with Supervisor-skip wording, Purchase Date, open More details, each optional fold field, Save) -- covers all 13 fields incl. D7 conditional
- [x] same file -- rewrite `give-advance` (~7 steps: open Team & Labour, open worker, Give Advance, Amount, Date, Reason as optional (fix factual error), Payment Method, confirm & Save)
- [x] same file -- rewrite `submit-dsr` (~11 steps: open, Site, Date, Work completed, Issues/blockers, Crew, Materials consumed, RMC, Expenses, Equipment, Photos, Submit — keep the existing offline-sync closing note)

**Acceptance Criteria:**
- Given any of the 5 guides, when compared field-by-field against its real form in new mode, then every visible field has its own step in render order and no step names a field that doesn't exist
- Given a Supervisor reading the record-purchase guide, when they reach the pricing steps, then the wording tells them they won't see those fields and the office fills pricing later
- Given the give-advance guide, when read, then Reason is described as optional
- Given the /help pages, when built, then they render the new content with no code changes (typecheck passes; `GuideStep` shape untouched)

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/shared exec tsc --noEmit` -- expected: clean
- `pnpm --filter @azentisfieldos/web exec tsc --noEmit` -- expected: clean
- `pnpm --filter @azentisfieldos/web exec vitest run` -- expected: all pass (no test asserts guide content; suite guards against accidental syntax breakage)

**Manual checks (if no CLI):**
- Open `/help/record-purchase` (and the other 4) in the dev app next to the real form; walk the steps top-to-bottom against the form's fields.

## Suggested Review Order

**The D7 role split and money-accuracy caveats (highest-risk copy)**

- Supervisor-skip wording for the Owner-only pricing group — quotes the app's real notice
  [`help-content.ts:553`](../../packages/shared/src/content/help-content.ts#L553)

- Recompute caveat: hand-typed total is silently replaced if Quantity/Rate change after
  [`help-content.ts:554`](../../packages/shared/src/content/help-content.ts#L554)

- Paid-prefill callout — prevents unpaid bills being recorded as Paid by default
  [`help-content.ts:555`](../../packages/shared/src/content/help-content.ts#L555)

**Full-coverage rewrites, one guide at a time**

- record-purchase (5→19 steps): all 13 fields incl. conditional Site + the More-details fold
  [`help-content.ts:542`](../../packages/shared/src/content/help-content.ts#L542)

- submit-dsr (7→12 steps): all sections; photo-clear warning, first-report crew, dropped-row rule
  [`help-content.ts:587`](../../packages/shared/src/content/help-content.ts#L587)

- record-consumption (5→8): adds Consumption Date, Activity Reference, Notes; over-stock warning
  [`help-content.ts:508`](../../packages/shared/src/content/help-content.ts#L508)

- give-advance (5→8): Reason factual error fixed (optional, was "required"); role clause added
  [`help-content.ts:570`](../../packages/shared/src/content/help-content.ts#L570)

- create-site (4→8): un-lumps "Enter details" into Name/Location/Status/Contract ref/Description
  [`help-content.ts:525`](../../packages/shared/src/content/help-content.ts#L525)

**Review-driven retitles (React-key safety)**

- Nav step retitled "Start a new purchase" so the final "Record Purchase" title stays unique (`key={step.title}`)
  [`help-content.ts:547`](../../packages/shared/src/content/help-content.ts#L547)

- Same pattern for advance: "Open the advance form" avoids duplicating "Record Advance"
  [`help-content.ts:576`](../../packages/shared/src/content/help-content.ts#L576)

- Corrected offline claim: report syncs itself; photos upload only while the app is open
  [`help-content.ts:602`](../../packages/shared/src/content/help-content.ts#L602)
