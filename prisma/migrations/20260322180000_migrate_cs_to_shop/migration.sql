-- Migrate all cs data to shop
-- Use ::text casts to avoid type mismatch when column type is EventCategory_old (partial-apply state)
UPDATE "match_results" SET "eventCategory" = 'shop' WHERE "eventCategory"::text = 'cs';
UPDATE "tournament_sessions" SET "eventCategory" = 'shop' WHERE "eventCategory"::text = 'cs';

-- Remove cs from EventCategory enum
-- PostgreSQL requires: drop defaults first, create new type, alter columns, re-add defaults, drop old type
ALTER TABLE "match_results" ALTER COLUMN "eventCategory" DROP DEFAULT;

-- Handle partial-apply: if EventCategory_old already exists, RENAME was already done
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventCategory_old') THEN
    ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
  END IF;
END $$;

-- Create new type only if it doesn't already exist with the correct values
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'EventCategory'
    AND oid IN (SELECT enumtypid FROM pg_enum WHERE enumlabel = 'friendly');
  IF NOT FOUND THEN
    CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');
  END IF;
END $$;

ALTER TABLE "match_results"
  ALTER COLUMN "eventCategory" TYPE "EventCategory"
  USING ("eventCategory"::text::"EventCategory");

ALTER TABLE "match_results"
  ALTER COLUMN "eventCategory" SET DEFAULT 'friendly'::"EventCategory";

ALTER TABLE "tournament_sessions"
  ALTER COLUMN "eventCategory" TYPE "EventCategory"
  USING ("eventCategory"::text::"EventCategory");

DROP TYPE IF EXISTS "EventCategory_old";
