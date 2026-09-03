-- Trigram GIN indexes for the search columns the original
-- 20260902200934_add_pg_trgm_search_indexes migration deliberately scoped
-- out (its own header: "the global search palette's 9-entity fan-out").
-- Story 16.6 later expanded search.service.ts's fan-out to 23 entities
-- without a matching indexing pass — every searchCandidates() below still
-- runs a leading-wildcard `ILIKE '%q%'` (Prisma's `contains`/
-- `mode: 'insensitive'`) on every keystroke, unindexed, which is the
-- dominant contributor to the reported 5-10s global-search latency
-- (product feedback 2026-09-03). Same pg_trgm + GIN approach, same reason
-- for hand-written SQL over schema.prisma (postgresqlExtensions is still
-- a preview feature) as the original migration.
--
-- Do not run `pnpm db:migrate:dev` after this migration is applied unless
-- you inspect its output first: since none of these GIN indexes are
-- declared in schema.prisma, `migrate dev`'s schema diff treats them as
-- drift and will auto-generate + auto-apply a migration that DROPs every
-- one of them (this happened once already while authoring this file — see
-- AGENTS.md's "Running and verifying" section, "Danger (found
-- 2026-09-03)"). Always apply raw-SQL migrations like this one with
-- `pnpm db:migrate:deploy`, which only replays pending migration files and
-- never diffs against schema.prisma.
--
-- A relation's own name column (Site.name, Material.name, Vendor.name,
-- TeamMember.name) is already indexed by the prior migration and is not
-- repeated here even though several of these entities filter through it
-- via a join (e.g. Movement's sourceSite/destinationSite, Machinery's
-- currentSite) — only each entity's own text columns are new here.

-- Movement (searchCandidates: notes — material/site name legs already covered)
CREATE INDEX "Movement_notes_trgm_idx" ON "Movement" USING GIN ("notes" gin_trgm_ops);

-- Consumption (searchCandidates: activityReference, notes — site/material name legs already covered)
CREATE INDEX "Consumption_activityReference_trgm_idx" ON "Consumption" USING GIN ("activityReference" gin_trgm_ops);
CREATE INDEX "Consumption_notes_trgm_idx" ON "Consumption" USING GIN ("notes" gin_trgm_ops);

-- WasteDisposal (searchCandidates: wasteType, notes — site/vendor name legs already covered)
CREATE INDEX "WasteDisposal_wasteType_trgm_idx" ON "WasteDisposal" USING GIN ("wasteType" gin_trgm_ops);
CREATE INDEX "WasteDisposal_notes_trgm_idx" ON "WasteDisposal" USING GIN ("notes" gin_trgm_ops);

-- ReturnWastage (searchCandidates: notes — site/material name legs already covered)
CREATE INDEX "ReturnWastage_notes_trgm_idx" ON "ReturnWastage" USING GIN ("notes" gin_trgm_ops);

-- Advance (searchCandidates: reason — teamMember name leg already covered)
CREATE INDEX "Advance_reason_trgm_idx" ON "Advance" USING GIN ("reason" gin_trgm_ops);

-- AdvanceAdjustment (searchCandidates: note — teamMember name leg already covered via join)
CREATE INDEX "AdvanceAdjustment_note_trgm_idx" ON "AdvanceAdjustment" USING GIN ("note" gin_trgm_ops);

-- Machinery (searchCandidates: name, assetNumber, operator, type.name)
CREATE INDEX "Machinery_name_trgm_idx" ON "Machinery" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Machinery_assetNumber_trgm_idx" ON "Machinery" USING GIN ("assetNumber" gin_trgm_ops);
CREATE INDEX "Machinery_operator_trgm_idx" ON "Machinery" USING GIN ("operator" gin_trgm_ops);
CREATE INDEX "MachineryType_name_trgm_idx" ON "MachineryType" USING GIN ("name" gin_trgm_ops);

-- Vehicle (searchCandidates: number, driver, type.name)
CREATE INDEX "Vehicle_number_trgm_idx" ON "Vehicle" USING GIN ("number" gin_trgm_ops);
CREATE INDEX "Vehicle_driver_trgm_idx" ON "Vehicle" USING GIN ("driver" gin_trgm_ops);
CREATE INDEX "VehicleType_name_trgm_idx" ON "VehicleType" USING GIN ("name" gin_trgm_ops);

-- SiteContract (searchCandidates: workCategory — subcontractor/site name legs already covered)
CREATE INDEX "SiteContract_workCategory_trgm_idx" ON "SiteContract" USING GIN ("workCategory" gin_trgm_ops);

-- SubcontractorWorkEntry (searchCandidates: note — subcontractor/site name legs already covered via join)
CREATE INDEX "SubcontractorWorkEntry_note_trgm_idx" ON "SubcontractorWorkEntry" USING GIN ("note" gin_trgm_ops);

-- SubcontractorPayment (searchCandidates: note — subcontractor/site name legs already covered via join)
CREATE INDEX "SubcontractorPayment_note_trgm_idx" ON "SubcontractorPayment" USING GIN ("note" gin_trgm_ops);

-- WorkRecord: no own text column (searchCandidates only matches
-- teamMember/site name, both already covered) — no index needed here.

-- DailySiteReport (searchCandidates: 6 free-text fields — site/submittedBy name legs already covered)
CREATE INDEX "DailySiteReport_workCompleted_trgm_idx" ON "DailySiteReport" USING GIN ("workCompleted" gin_trgm_ops);
CREATE INDEX "DailySiteReport_workInProgress_trgm_idx" ON "DailySiteReport" USING GIN ("workInProgress" gin_trgm_ops);
CREATE INDEX "DailySiteReport_plannedWork_trgm_idx" ON "DailySiteReport" USING GIN ("plannedWork" gin_trgm_ops);
CREATE INDEX "DailySiteReport_issuesBlockers_trgm_idx" ON "DailySiteReport" USING GIN ("issuesBlockers" gin_trgm_ops);
CREATE INDEX "DailySiteReport_safetyObservations_trgm_idx" ON "DailySiteReport" USING GIN ("safetyObservations" gin_trgm_ops);
CREATE INDEX "DailySiteReport_notes_trgm_idx" ON "DailySiteReport" USING GIN ("notes" gin_trgm_ops);

-- AuditLog (searchCandidates: action, entityType — user name leg already covered)
CREATE INDEX "AuditLog_action_trgm_idx" ON "AuditLog" USING GIN ("action" gin_trgm_ops);
CREATE INDEX "AuditLog_entityType_trgm_idx" ON "AuditLog" USING GIN ("entityType" gin_trgm_ops);

-- Inventory (Story 16.x's new "Inventory" search group, product feedback
-- 2026-09-03): GodownStock/SiteStock are keyed off materialSizeId, not a
-- free-text column of their own — the ILIKE happens through the
-- MaterialSize -> Material join, so the search itself needs Material's own
-- trigram index above (already present), not a trigram index on Stock.
--
-- GodownStock's own @@id is `materialSizeId` alone (see schema.prisma), so
-- Postgres can already seek straight from a matched Material/MaterialSize
-- into GodownStock via that primary key — no extra index needed there.
-- SiteStock's only index is the composite @@id([siteId, materialSizeId])
-- (siteId leading), which does NOT accelerate a lookup keyed on
-- materialSizeId alone — exactly what StockService.searchCandidates does
-- (it has no siteId to filter by, only the matched Material). Without this,
-- that reverse lookup degrades toward a sequential scan of SiteStock as it
-- grows, which is the same class of unindexed-search cost every other
-- index in this migration exists to eliminate.
CREATE INDEX "SiteStock_materialSizeId_idx" ON "SiteStock" ("materialSizeId");
