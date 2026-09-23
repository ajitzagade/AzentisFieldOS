-- Bugfix (2026-09-23): DSR Materials Used / standalone Consumption now
-- draws Site Stock first and falls back to Godown Stock for the shortfall.
-- Each Consumption row persists the exact split it drew so a later
-- edit/correction can give stock back to precisely where it came from,
-- never re-deriving a guessed split.
--
-- Hand-written (not `prisma migrate dev`): these two columns ARE declared
-- in schema.prisma, but this repo also carries several hand-written
-- pg_trgm GIN indexes that are deliberately NOT declared in schema.prisma
-- (postgresqlExtensions is still preview-gated — see the 2026-09-03
-- migrations' own headers and AGENTS.md's "Danger" note). Running
-- `migrate dev` here would treat every one of those indexes as drift and
-- auto-generate a second migration that drops them all back out — this
-- file avoids that entirely by being written directly and applied with
-- `pnpm db:migrate:deploy`.
--
-- Existing rows predate the Godown fallback and were necessarily
-- Site-only, so they backfill as {quantity, 0} — never re-derived from
-- current stock levels.

-- AlterTable
ALTER TABLE "Consumption"
  ADD COLUMN "siteStockQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "godownStockQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- Backfill
UPDATE "Consumption" SET "siteStockQuantity" = "quantity";
