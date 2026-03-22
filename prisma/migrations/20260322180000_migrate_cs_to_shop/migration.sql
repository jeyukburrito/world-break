-- Migrate all cs data to shop
UPDATE "match_results" SET "eventCategory" = 'shop' WHERE "eventCategory" = 'cs';
UPDATE "tournament_sessions" SET "eventCategory" = 'shop' WHERE "eventCategory" = 'cs';

-- Remove cs from EventCategory enum
-- PostgreSQL requires: create new type, alter columns, drop old, rename new
ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');

ALTER TABLE "match_results"
  ALTER COLUMN "eventCategory" TYPE "EventCategory"
  USING ("eventCategory"::text::"EventCategory");

ALTER TABLE "match_results"
  ALTER COLUMN "eventCategory" SET DEFAULT 'friendly';

ALTER TABLE "tournament_sessions"
  ALTER COLUMN "eventCategory" TYPE "EventCategory"
  USING ("eventCategory"::text::"EventCategory");

DROP TYPE "EventCategory_old";
