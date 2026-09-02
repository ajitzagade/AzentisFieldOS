-- Trigram GIN indexes for the columns backing the global search palette's
-- 9-entity fan-out (apps/api/src/search/search.service.ts) — every one of
-- these searchCandidates() methods runs a leading-wildcard `ILIKE '%q%'`
-- (Prisma's `contains`/`mode: 'insensitive'`) on every keystroke, which a
-- plain B-tree index cannot serve. pg_trgm + a GIN index lets Postgres use
-- an index for ILIKE regardless of wildcard position.
--
-- Deliberately NOT declared in schema.prisma: Prisma's declarative
-- `extensions`/`type: Gin` support is still gated behind the
-- `postgresqlExtensions` preview feature (confirmed against this repo's
-- Prisma 7.10.0 install, not assumed) — enabling a preview feature to
-- express two index types is a bigger, codebase-wide decision than this
-- migration warrants. Hand-written raw SQL is the standard, safe pattern
-- for index types Prisma's stable schema layer doesn't yet model; this
-- does not cause migration drift since `prisma migrate dev`/`deploy`
-- replay migrations, not schema.prisma, to determine DB state.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Site (searchCandidates: name, location, contractReference)
CREATE INDEX "Site_name_trgm_idx" ON "Site" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Site_location_trgm_idx" ON "Site" USING GIN ("location" gin_trgm_ops);
CREATE INDEX "Site_contractReference_trgm_idx" ON "Site" USING GIN ("contractReference" gin_trgm_ops);

-- Material (searchCandidates: name)
CREATE INDEX "Material_name_trgm_idx" ON "Material" USING GIN ("name" gin_trgm_ops);

-- Vendor (searchCandidates: name, contactPerson, phone — also covers
-- RmcEntry/Purchase's `vendor.name` relation-filtered searches, which
-- resolve to this same column via the join)
CREATE INDEX "Vendor_name_trgm_idx" ON "Vendor" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Vendor_contactPerson_trgm_idx" ON "Vendor" USING GIN ("contactPerson" gin_trgm_ops);
CREATE INDEX "Vendor_phone_trgm_idx" ON "Vendor" USING GIN ("phone" gin_trgm_ops);

-- TeamMember (searchCandidates: name, designation — also covers
-- Payment's `teamMember.name` relation-filtered search via the join)
CREATE INDEX "TeamMember_name_trgm_idx" ON "TeamMember" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "TeamMember_designation_trgm_idx" ON "TeamMember" USING GIN ("designation" gin_trgm_ops);

-- Payment (searchCandidates: payPeriod)
CREATE INDEX "Payment_payPeriod_trgm_idx" ON "Payment" USING GIN ("payPeriod" gin_trgm_ops);

-- Purchase (searchCandidates: invoiceOrChallanNo — vendor/material name
-- legs of the same OR already covered by the Vendor/Material indexes above)
CREATE INDEX "Purchase_invoiceOrChallanNo_trgm_idx" ON "Purchase" USING GIN ("invoiceOrChallanNo" gin_trgm_ops);

-- Subcontractor (searchCandidates: name, contactPerson, phone)
CREATE INDEX "Subcontractor_name_trgm_idx" ON "Subcontractor" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Subcontractor_contactPerson_trgm_idx" ON "Subcontractor" USING GIN ("contactPerson" gin_trgm_ops);
CREATE INDEX "Subcontractor_phone_trgm_idx" ON "Subcontractor" USING GIN ("phone" gin_trgm_ops);

-- RmcEntry (searchCandidates: grade — site/vendor name legs already covered)
CREATE INDEX "RmcEntry_grade_trgm_idx" ON "RmcEntry" USING GIN ("grade" gin_trgm_ops);

-- Expense (searchCandidates: description, personOrVendor)
CREATE INDEX "Expense_description_trgm_idx" ON "Expense" USING GIN ("description" gin_trgm_ops);
CREATE INDEX "Expense_personOrVendor_trgm_idx" ON "Expense" USING GIN ("personOrVendor" gin_trgm_ops);
